export interface MenuLink {
  label: string;
  path: string;
}

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
  { kind: 'link', label: 'Inici', path: '/' },
  {
    kind: 'group',
    key: 'adopt',
    label: 'Adopta',
    links: [
      { label: 'Gats en adopció', path: '/adopta/gats-adopcio' },
      { label: 'Troba el teu company de vida', path: '/adopta/troba-el-teu-company' },
      { label: "Procés d'adopció", path: '/adopta/proces-adopcio' },
      { label: "Condicions d'adopció", path: '/adopta/condicions-adopcio' },
    ],
  },
  {
    kind: 'group',
    key: 'collaborate',
    label: 'Col·labora',
    links: [
      { label: 'Donacions', path: '/collabora/donacions' },
      { label: 'Voluntariat', path: '/collabora/voluntariat' },
      { label: 'Fes-te soci/sòcia', path: '/collabora/socis' },
    ],
  },
  { kind: 'link', label: 'Actualitat', path: '/actualitat' },
  { kind: 'link', label: 'Sobre nosaltres', path: '/sobre-nosaltres' },
  { kind: 'link', label: 'Contacte', path: '/contacte' },
];
