import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COLLABORATE_PATH } from '../../shared/collaborate/collaborate-options';
import { MenuLink } from '../public-header/public-menu';

interface FooterColumn {
  title: string;
  links: MenuLink[];
}

interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: 'Sa Gatonera',
    links: [
      { label: 'Sobre nosaltres', path: '/sobre-nosaltres' },
      { label: 'Contacte', path: '/contacte' },
    ],
  },
  {
    title: 'Adopta',
    links: [
      { label: 'Gats en adopció', path: '/adopta/gats-adopcio' },
      { label: 'Troba el teu company de vida', path: '/adopta/troba-el-teu-company' },
      { label: "Procés d'adopció", path: '/adopta/proces-adopcio' },
      { label: "Condicions d'adopció", path: '/adopta/condicions-adopcio' },
    ],
  },
  {
    title: 'Col·labora',
    links: [
      { label: 'Donacions', path: COLLABORATE_PATH, fragment: 'donacions' },
      { label: 'Voluntariat', path: COLLABORATE_PATH, fragment: 'voluntariat' },
      { label: 'Fes-te soci/sòcia', path: COLLABORATE_PATH, fragment: 'socis' },
    ],
  },
];

const LEGAL_LINKS: readonly MenuLink[] = [
  { label: 'Avís legal', path: '/avis-legal' },
  { label: 'Política de privacitat', path: '/politica-privacitat' },
];

const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: 'Facebook', url: 'https://www.facebook.com/', icon: 'fa-facebook-f' },
  { label: 'Instagram', url: 'https://www.instagram.com/', icon: 'fa-instagram' },
  { label: 'X', url: 'https://x.com/', icon: 'fa-x-twitter' },
];

@Component({
  imports: [RouterLink],
  selector: 'app-public-footer',
  templateUrl: './public-footer.html',
  styleUrl: './public-footer.scss',
})
export class PublicFooter {
  protected readonly columns = FOOTER_COLUMNS;
  protected readonly legalLinks = LEGAL_LINKS;
  protected readonly socialLinks = SOCIAL_LINKS;
  protected readonly year = new Date().getFullYear();
}
