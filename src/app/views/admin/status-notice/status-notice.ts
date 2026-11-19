import { Component, effect, input, output } from '@angular/core';
import { CAT_DETAIL_TEXT } from '../cats/cat.constants';

const NOTICE_VISIBLE_MS = 8000;

export interface StatusNoticeMessage {
  text: string;
}

@Component({
  selector: 'app-status-notice',
  templateUrl: './status-notice.html',
  styleUrl: './status-notice.scss',
})
export class StatusNotice {
  readonly notice = input<StatusNoticeMessage | null>(null);
  readonly closed = output<void>();
  readonly expired = output<void>();

  protected readonly closeLabel = CAT_DETAIL_TEXT.closeMessage;

  constructor() {
    effect((onCleanup) => {
      if (!this.notice()) {
        return;
      }
      const timer = setTimeout(() => this.expired.emit(), NOTICE_VISIBLE_MS);
      onCleanup(() => clearTimeout(timer));
    });
  }
}
