import type { Theme } from './index';
import { nordtheme } from './nordtheme';

export const installTheme: Theme = {
  name: 'Install',
  base: 'dark',
  colors: nordtheme.colors,
  overrides: {
    sidebars: false,
    image: 'https://malsync.moe/images/install-full.webp',
    opacity: 0,
  },
};
