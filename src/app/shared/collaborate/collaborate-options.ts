export interface CollaborateOption {
  id: string;
  title: string;
  text: string;
  icon: string;
}

export const COLLABORATE_OPTIONS: readonly CollaborateOption[] = [
  {
    id: 'donacions',
    title: 'Fes una donació',
    text: "La teva aportació ens ajuda a cobrir les despeses d'alimentació i atenció veterinària dels gats de les colònies.",
    icon: 'icons/collabora-donacio.svg',
  },
  {
    id: 'voluntariat',
    title: 'Fes-te voluntari/ària',
    text: 'El teu temps també pot ajudar. Col·labora en les tasques de cura dels gats i contribueix a millorar-ne el dia a dia.',
    icon: 'icons/collabora-voluntariat.svg',
  },
  {
    id: 'socis',
    title: 'Fes-te soci/a',
    text: "Fes costat a Sa Gatonera i ajuda'ns a continuar treballant pel benestar dels gats de Blanes.",
    icon: 'icons/collabora-soci.svg',
  },
];
