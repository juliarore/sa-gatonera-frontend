import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminCatsService } from '../cats/admin-cats.service';
import { DELETE_CAT_TEXT } from '../cats/cat.constants';
import { parseSaveError } from '../cats/utils/save-error';

@Component({
  selector: 'app-delete-cat-dialog',
  templateUrl: './delete-cat-dialog.html',
  styleUrl: './delete-cat-dialog.scss',
})
export class DeleteCatDialog {
  private readonly adminCats = inject(AdminCatsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly catId = input.required<string>();
  readonly catName = input.required<string>();

  readonly deleted = output<void>();
  readonly gone = output<void>();
  readonly cancelled = output<void>();

  protected readonly t = DELETE_CAT_TEXT;
  protected readonly busy = signal(false);
  protected readonly error = signal(false);

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  protected cancel(): void {
    this.dialog().nativeElement.close();
  }

  protected onNativeCancel(event: Event): void {
    if (this.busy()) {
      event.preventDefault();
    }
  }

  protected confirm(): void {
    this.busy.set(true);
    this.error.set(false);
    this.adminCats
      .delete(this.catId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.deleted.emit(),
        error: (error: unknown) => {
          this.busy.set(false);
          if (parseSaveError(error).status === 404) {
            this.gone.emit();
          } else {
            this.error.set(true);
          }
        },
      });
  }
}
