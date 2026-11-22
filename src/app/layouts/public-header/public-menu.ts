import { MenuLink } from '../../shared/navigation/menu-link';
import {
  ABOUT_PATH,
  ADOPTION_CONDITIONS_PATH,
  ADOPTION_PROCESS_PATH,
  CATALOG_PATH,
  COLLABORATE_PATH,
  CONTACT_PATH,
  FIND_COMPANION_PATH,
  HOME_PATH,
  NEWS_PATH,
} from '../../shared/navigation/routes';

export interface MenuSingleItem extends MenuLink {
  kind: 'link';
}

export interface MenuGroupItem {
  kind: 'group';
  key: string;
  label: string;
  links: MenuLink[];
}

export type MenuItem = MenuSingleItem | MenuGroupItem;

export const MENU_ITEMS: readonly MenuItem[] = [
  { kind: 'link', label: 'Inici', path: HOME_PATH },
  {
    kind: 'group',
    key: 'adopt',
    label: 'Adopta',
    links: [
      { label: 'Gats en adopció', path: CATALOG_PATH },
      { label: 'Troba el teu company de vida', path: FIND_COMPANION_PATH },
      { label: "Procés d'adopció", path: ADOPTION_PROCESS_PATH },
      { label: "Condicions d'adopció", path: ADOPTION_CONDITIONS_PATH },
    ],
  },
  {
    kind: 'group',
    key: 'collaborate',
    label: 'Col·labora',
    links: [
      { label: 'Donacions', path: COLLABORATE_PATH, fragment: 'donacions' },
      { label: 'Voluntariat', path: COLLABORATE_PATH, fragment: 'voluntariat' },
      { label: 'Fes-te soci/sòcia', path: COLLABORATE_PATH, fragment: 'socis' },
    ],
  },
  { kind: 'link', label: 'Actualitat', path: NEWS_PATH },
  { kind: 'link', label: 'Sobre nosaltres', path: ABOUT_PATH },
  { kind: 'link', label: 'Contacte', path: CONTACT_PATH },
];
