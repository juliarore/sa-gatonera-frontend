import { CatCardImage } from '../components/cat-card/cat-card';
import { imageUrl } from './image-url';
import { PublicCat } from './public-cats.service';

export function toCatCardImage(cat: PublicCat): CatCardImage | null {
  return cat.coverImageUrl
    ? { src: imageUrl(cat.coverImageUrl), alt: cat.coverImageAlt || `Foto de ${cat.name}` }
    : null;
}
