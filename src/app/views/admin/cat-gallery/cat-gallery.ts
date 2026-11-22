import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { concatMap, finalize, from } from 'rxjs';
import { AdminCatsService } from '../cats/admin-cats.service';
import {
  ALT_TEXT_MAX,
  ALT_TEXT_MIN,
  IMAGE_ACCEPT,
  IMAGE_MAX_BYTES,
  IMAGE_MAX_COUNT,
  IMAGE_TEXT,
  IMAGE_TYPES,
} from '../cats/cat.constants';
import { CatImage } from '../cats/cat.models';
import { imageUrl } from '../../../shared/cats/image-url';

type EditMode = 'alt' | 'remove';

@Component({
  selector: 'app-cat-gallery',
  imports: [RouterLink],
  templateUrl: './cat-gallery.html',
  styleUrl: './cat-gallery.scss',
})
export class CatGallery {
  private readonly adminCats = inject(AdminCatsService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly images = input.required<CatImage[]>();
  readonly catId = input<string | null>(null);
  readonly editable = input(false);

  readonly imagesChange = output<CatImage[]>();
  readonly uploadFinished = output<string | null>();

  protected readonly t = IMAGE_TEXT;
  protected readonly accept = IMAGE_ACCEPT;
  protected readonly imageUrl = imageUrl;
  protected readonly failed = signal<ReadonlySet<string>>(new Set());

  protected readonly uploadable = computed(() => this.catId() !== null);
  protected readonly canAdd = computed(() => this.images().length < IMAGE_MAX_COUNT);
  protected readonly showAdd = computed(
    () => this.canAdd() && (this.editable() || (this.uploadable() && this.images().length === 0)),
  );

  protected readonly announcement = signal('');
  protected readonly editing = signal<{ id: string; mode: EditMode } | null>(null);
  protected readonly altDraft = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly progress = signal<{ done: number; total: number } | null>(null);
  protected readonly busy = signal(false);

  constructor() {
    if (inject(ActivatedRoute).snapshot.fragment === 'fotos') {
      afterNextRender(() => {
        if (this.editable()) {
          this.focusById('photos-title');
        }
      });
    }
  }

  protected markFailed(id: string): void {
    this.failed.update((ids) => new Set(ids).add(id));
  }

  protected editMode(id: string): EditMode | null {
    const editing = this.editing();
    return editing?.id === id ? editing.mode : null;
  }

  protected onFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    const catId = this.catId();
    if (!catId || files.length === 0 || this.busy()) {
      return;
    }
    if (files.some((file) => !IMAGE_TYPES.includes(file.type))) {
      this.error.set(IMAGE_TEXT.errors.fileType);
      return;
    }
    if (files.some((file) => file.size > IMAGE_MAX_BYTES)) {
      this.error.set(IMAGE_TEXT.errors.fileSize);
      return;
    }
    const room = IMAGE_MAX_COUNT - this.images().length;
    this.error.set(files.length > room ? IMAGE_TEXT.errors.tooMany(room) : null);
    this.upload(catId, files.slice(0, room));
  }

  protected startEdit(mode: EditMode, image: CatImage): void {
    this.error.set(null);
    this.altDraft.set(image.altText);
    this.editing.set({ id: image.id, mode });
    this.focusById(mode === 'alt' ? `gallery-alt-${image.id}` : `gallery-cancel-${image.id}`);
  }

  protected cancelEdit(): void {
    const editing = this.editing();
    if (!editing) {
      return;
    }
    this.editing.set(null);
    this.error.set(null);
    this.focusById(`gallery-${editing.mode === 'alt' ? 'edit' : 'remove'}-${editing.id}`);
  }

  protected onAltInput(event: Event): void {
    this.altDraft.set((event.target as HTMLTextAreaElement).value);
    this.error.set(null);
  }

  protected submitEdit(image: CatImage): void {
    const catId = this.catId();
    const mode = this.editMode(image.id);
    if (!catId || !mode || this.busy()) {
      return;
    }
    if (mode === 'alt') {
      this.saveAlt(catId, image);
    } else {
      this.remove(catId, image);
    }
  }

  protected move(image: CatImage, index: number, offset: -1 | 1): void {
    const catId = this.catId();
    const position = index + 1 + offset;
    if (!catId || this.busy()) {
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.adminCats.moveImage(catId, image.id, position).subscribe({
      next: (images) => {
        this.busy.set(false);
        this.imagesChange.emit(images);
        this.announce(IMAGE_TEXT.moved(position));
        const atEdge = offset === -1 ? position === 1 : position === images.length;
        const next = (offset === -1) !== atEdge ? 'before' : 'after';
        this.focusById(`gallery-move-${next}-${image.id}`);
      },
      error: () => {
        this.busy.set(false);
        this.error.set(IMAGE_TEXT.errors.request);
      },
    });
  }

  private upload(catId: string, files: File[]): void {
    const uploaded: CatImage[] = [];
    this.busy.set(true);
    this.progress.set({ done: 1, total: files.length });
    from(files)
      .pipe(
        concatMap((file) => this.adminCats.uploadImage(catId, file)),
        finalize(() => {
          this.busy.set(false);
          this.progress.set(null);
          if (uploaded.length > 0) {
            this.imagesChange.emit([...this.images(), ...uploaded]);
            if (!this.editable()) {
              this.uploadFinished.emit(this.error());
            }
          }
        }),
      )
      .subscribe({
        next: (image) => {
          uploaded.push(image);
          this.progress.set({
            done: Math.min(uploaded.length + 1, files.length),
            total: files.length,
          });
        },
        complete: () => {
          this.announce(IMAGE_TEXT.uploaded);
          if (this.editable()) {
            this.focusById(`gallery-photo-${uploaded[uploaded.length - 1].id}`);
          }
        },
        error: () => this.error.set(IMAGE_TEXT.errors.request),
      });
  }

  private saveAlt(catId: string, image: CatImage): void {
    const value = this.altDraft().trim();
    if (value.length < ALT_TEXT_MIN || value.length > ALT_TEXT_MAX) {
      this.error.set(IMAGE_TEXT.errors.altLength);
      return;
    }
    this.busy.set(true);
    this.adminCats.updateImageAltText(catId, image.id, value).subscribe({
      next: (updated) => {
        this.busy.set(false);
        this.imagesChange.emit(this.images().map((item) => (item.id === image.id ? updated : item)));
        this.announce(IMAGE_TEXT.altSaved);
        this.cancelEdit();
      },
      error: () => {
        this.busy.set(false);
        this.error.set(IMAGE_TEXT.errors.request);
      },
    });
  }

  private remove(catId: string, image: CatImage): void {
    this.busy.set(true);
    this.adminCats.deleteImage(catId, image.id).subscribe({
      next: () => {
        this.busy.set(false);
        this.editing.set(null);
        this.imagesChange.emit(this.images().filter((item) => item.id !== image.id));
        this.announce(IMAGE_TEXT.removed);
        this.focusById('photos-title');
      },
      error: () => {
        this.busy.set(false);
        this.error.set(IMAGE_TEXT.errors.request);
      },
    });
  }

  private announce(message: string): void {
    this.announcement.set('');
    queueMicrotask(() => this.announcement.set(message));
  }

  private focusById(id: string): void {
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>(`#${CSS.escape(id)}`)?.focus(),
      { injector: this.injector },
    );
  }
}
