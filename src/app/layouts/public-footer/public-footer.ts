import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuLink } from '../../shared/navigation/menu-link';
import {
  ABOUT_PATH,
  CONTACT_PATH,
  HOME_PATH,
  LEGAL_NOTICE_PATH,
  NEWS_PATH,
  PRIVACY_POLICY_PATH,
} from '../../shared/navigation/routes';
import { MENU_ITEMS, MenuGroupItem } from '../public-header/public-menu';

interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

const FOOTER_COLUMNS: readonly MenuGroupItem[] = [
  ...MENU_ITEMS.filter((item): item is MenuGroupItem => item.kind === 'group'),
  {
    kind: 'group',
    key: 'association',
    label: 'Sa Gatonera',
    links: [
      { label: 'Sobre nosaltres', path: ABOUT_PATH },
      { label: 'Actualitat', path: NEWS_PATH },
      { label: 'Contacte', path: CONTACT_PATH },
    ],
  },
];

const LEGAL_LINKS: readonly MenuLink[] = [
  { label: 'Avís legal', path: LEGAL_NOTICE_PATH },
  { label: 'Política de privacitat', path: PRIVACY_POLICY_PATH },
];

const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: 'Instagram', url: 'https://www.instagram.com/sagatonerablanes/', icon: 'fa-instagram' },
  { label: 'X', url: 'https://x.com/SaGatonera', icon: 'fa-x-twitter' },
];

@Component({
  imports: [RouterLink],
  selector: 'app-public-footer',
  templateUrl: './public-footer.html',
  styleUrl: './public-footer.scss',
})
export class PublicFooter {
  protected readonly homePath = HOME_PATH;
  protected readonly columns = FOOTER_COLUMNS;
  protected readonly legalLinks = LEGAL_LINKS;
  protected readonly socialLinks = SOCIAL_LINKS;
  protected readonly year = new Date().getFullYear();
}
