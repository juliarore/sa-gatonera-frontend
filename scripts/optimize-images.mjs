import { mkdir, stat } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const PRESETS = {
  hero: {
    widths: [960, 1440, 1920, 2880],
    sizes: 'max(100vw, 840px)',
    minOriginalWidth: 2880,
    quality: {
      avif: [[1920, 72], [2880, 60]],
      webp: [[1920, 85], [2880, 80]],
      jpg: 82,
    },
  },
  card: {
    widths: [320, 480, 640, 960],
    sizes: '(min-width: 960px) 33vw, 100vw',
    quality: { avif: 50, webp: 75, jpg: 78 },
  },
  detail: {
    widths: [640, 960, 1440, 1920],
    sizes: '100vw',
    quality: { avif: 60, webp: 80, jpg: 82 },
  },
};

const ENCODERS = {
  avif: (image, quality) => image.avif({ quality, effort: 4 }),
  webp: (image, quality) => image.webp({ quality }),
  jpg: (image, quality) => image.jpeg({ quality, progressive: true, mozjpeg: true }),
};

const USAGE = `Usage: npm run images -- <original> [--preset hero|card|detail] [--name <name>] [--widths 960,1440] [--quality 60 | avif=60,webp=80,jpg=82] [--out <dir>]
Output: <out>/<name>-<width>.<avif|webp|jpg>, e.g. --out public/images/home/about (default: public/images/<name>)`;

function fail(message) {
  console.error(`${message}\n${USAGE}`);
  process.exit(1);
}

function parseWidths(value) {
  const widths = value.split(',').map(Number);
  if (widths.some((width) => !Number.isInteger(width) || width <= 0)) {
    fail(`Invalid --widths "${value}"`);
  }
  return widths;
}

function parseQuality(value) {
  if (/^\d+$/.test(value)) {
    return Object.fromEntries(Object.keys(ENCODERS).map((format) => [format, Number(value)]));
  }
  const quality = {};
  for (const pair of value.split(',')) {
    const [format, number] = pair.split('=');
    if (!(format in ENCODERS) || !/^\d+$/.test(number ?? '')) {
      fail(`Invalid --quality "${value}"`);
    }
    quality[format] = Number(number);
  }
  return quality;
}

function qualityFor(table, format, width) {
  const value = table[format];
  if (typeof value === 'number') return value;
  return value.find(([maxWidth]) => width <= maxWidth)?.[1] ?? value.at(-1)[1];
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    preset: { type: 'string', default: 'detail' },
    name: { type: 'string' },
    widths: { type: 'string' },
    quality: { type: 'string' },
    out: { type: 'string' },
  },
});

const [input] = positionals;
if (!input) fail('Missing original image');

const preset = PRESETS[values.preset];
if (!preset) fail(`Unknown preset "${values.preset}"`);

const name = values.name ?? basename(input, extname(input));
const outputDir = values.out ?? join('public/images', name);
const qualityOverride = values.quality ? parseQuality(values.quality) : {};
const qualityTable = { ...preset.quality, ...qualityOverride };
const requestedWidths = values.widths ? parseWidths(values.widths) : preset.widths;

const { width: originalWidth, height: originalHeight } = await sharp(input).metadata();
const widths = requestedWidths.filter((width) => width <= originalWidth);

if (widths.length === 0) fail(`The original (${originalWidth}px) is narrower than every requested width`);

if (preset.minOriginalWidth && originalWidth < preset.minOriginalWidth) {
  console.warn(
    `Warning: the "${values.preset}" preset expects an original of at least ${preset.minOriginalWidth}px wide, but this one is ${originalWidth}px. Retina screens will get upscaled images.`,
  );
}

await mkdir(outputDir, { recursive: true });

for (const width of widths) {
  for (const extension of Object.keys(ENCODERS)) {
    const quality = qualityFor(qualityTable, extension, width);
    const file = join(outputDir, `${name}-${width}.${extension}`);
    await ENCODERS[extension](sharp(input).rotate().resize({ width }), quality).toFile(file);
    const { size } = await stat(file);
    console.log(`${file}  q${quality}  ${(size / 1024).toFixed(1)} KB`);
  }
}

const largest = widths.at(-1);
const publicPath = join(outputDir, name).replace(/^public\//, '');
console.log(
  `\nTemplate: src="${publicPath}" [widths]="[${widths.join(', ')}]" sizes="${preset.sizes}" [width]="${largest}" [height]="${Math.round((largest * originalHeight) / originalWidth)}"`,
);
