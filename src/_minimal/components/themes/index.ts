import { nordtheme } from './nordtheme';
import { installTheme } from './installTheme';
import { bestTheme } from './bestTheme';
import { latte, frappe, macchiato, mocha } from './catppuccinTheme';

export const themeOverrides = ['sidebars', 'image', 'opacity', 'color'] as const;

export type Theme = {
  name: string;
  base: 'light' | 'dark';
  colors: { [key: string]: string };
  overrides?: { [key in (typeof themeOverrides)[number]]?: any };
};

const themes: { [key: string]: Theme } = {
  nordtheme,
  installTheme,
  bestTheme,
  latte,
  frappe,
  macchiato,
  mocha,
};

export const themeOptions = Object.keys(themes)
  .filter(k => k !== 'installTheme' && k !== 'bestTheme')
  .map(key => ({
    title: themes[key].name,
    value: key,
  }));

export const getThemeByKey = (key: string) => themes[key];
