import { ParamMap } from '@angular/router';
import {
  AGE_GROUPS,
  COMPATIBLE_WITH_LABELS,
  GENDER_LABELS,
} from '../../../../../shared/cats/cat.constants';
import { CatsSort } from '../../../../../shared/cats/cat.models';
import { PublicCatsFilters } from '../../../../../shared/cats/public-cats.service';

export const DEFAULT_SORT: CatsSort = 'oldest';

export const EMPTY_FILTERS: PublicCatsFilters = {
  gender: [],
  ageGroup: [],
  compatible: [],
  traits: [],
  urgent: false,
  joint: false,
  search: '',
};

export function countSelected(filters: PublicCatsFilters): number {
  const { gender, ageGroup, compatible, traits, urgent, joint, search } = filters;
  return [...gender, ...ageGroup, ...compatible, ...traits, urgent, joint, search].filter(Boolean)
    .length;
}

function parseList(value: string | null): string[] {
  return [...new Set((value ?? '').split(',').filter(Boolean))];
}

function parseKeys<T extends string>(
  value: string | null,
  labels: Record<T, string | object>,
): T[] {
  return parseList(value).filter((item): item is T => Object.hasOwn(labels, item));
}

export function readFilterParams(params: ParamMap): PublicCatsFilters {
  return {
    gender: parseKeys(params.get('gender'), GENDER_LABELS).slice(0, 1),
    ageGroup: parseKeys(params.get('ageGroup'), AGE_GROUPS),
    compatible: parseKeys(params.get('compatible'), COMPATIBLE_WITH_LABELS),
    traits: parseList(params.get('traits')),
    urgent: params.get('urgent') === 'true',
    joint: params.get('joint') === 'true',
    search: (params.get('search') ?? '').trim(),
  };
}

export function toFilterParams(filters: PublicCatsFilters): Record<string, string | null> {
  return {
    gender: filters.gender.join(',') || null,
    ageGroup: filters.ageGroup.join(',') || null,
    compatible: filters.compatible.join(',') || null,
    traits: filters.traits.join(',') || null,
    urgent: filters.urgent ? 'true' : null,
    joint: filters.joint ? 'true' : null,
    search: filters.search || null,
  };
}
