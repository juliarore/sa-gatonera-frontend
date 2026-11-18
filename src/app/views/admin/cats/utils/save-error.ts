import { HttpErrorResponse } from '@angular/common/http';
import { CAT_API_FIELD_ERRORS } from '../cat.constants';
import { CatFieldError } from '../cat.models';

export function parseSaveError(error: unknown): {
  fieldError: CatFieldError | null;
  status: number;
  code: string | undefined;
} {
  const http = error instanceof HttpErrorResponse ? error : null;
  const code = (http?.error as { code?: string } | null)?.code;
  const mapped = code ? CAT_API_FIELD_ERRORS[code] : undefined;

  return { fieldError: mapped ? { ...mapped } : null, status: http?.status ?? 0, code };
}
