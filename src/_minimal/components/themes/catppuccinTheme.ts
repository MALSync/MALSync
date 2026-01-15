import type { Theme } from './index';

export const latte: Theme = {
  name: 'Catppuccin Latte',
  base: 'light',
  colors: {
    backdrop: '#dce0e8',
    background: '#e6e9ef',
    foreground: '#eff1f5',
    primary: '#8839ef',
    'primary-dark': '#40a02b',
    'border-hover': '#4c4f69',
    secondary: '#d20f39',
    'dark-background': '#5c5f77', // subtext 1, white text stands out more against it
    text: '#4c4f69',
    'light-text': '#5c5f77',
    'secondary-text': '#1e66f5',
    'primary-contrast': '#eff1f5',
    'primary-dark-contrast': '#eff1f5',
    'state-1': '#40a02b',
    'state-2': '#1e66f5',
    'state-3': '#fe640b',
    'state-4': '#d20f39',
    'state-6': '#8839ef',
    'state-23': '#04a5e5',
  },
};

export const frappe: Theme = {
  name: 'Catppuccin Frappé',
  base: 'dark',
  colors: {
    backdrop: '#232634',
    background: '#292c3c',
    foreground: '#303446',
    primary: '#ca9ee6',
    'primary-dark': '#a6d189',
    'border-hover': '#c6d0f5',
    secondary: '#e78284',
    'dark-background': '#51576d',
    text: '#c6d0f5',
    'light-text': '#b5bfe2',
    'secondary-text': '#8caaee',
    'primary-contrast': '#303446',
    'primary-dark-contrast': '#303446',
    'state-1': '#a6d189',
    'state-2': '#8caaee',
    'state-3': '#ef9f76',
    'state-4': '#e78284',
    'state-6': '#ca9ee6',
    'state-23': '#99d1db',
  },
};

export const macchiato: Theme = {
  name: 'Catppuccin Macchiato',
  base: 'dark',
  colors: {
    backdrop: '#181926',
    background: '#1e2030',
    foreground: '#24273a',
    primary: '#c6a0f6',
    'primary-dark': '#a6da95',
    'border-hover': '#cad3f5',
    secondary: '#ed8796',
    'dark-background': '#494d64',
    text: '#cad3f5',
    'light-text': '#b8c0e0',
    'secondary-text': '#8aadf4',
    'primary-contrast': '#24273a',
    'primary-dark-contrast': '#24273a',
    'state-1': '#a6da95',
    'state-2': '#8aadf4',
    'state-3': '#f5a97f',
    'state-4': '#ed8796',
    'state-6': '#c6a0f6',
    'state-23': '#91d7e3',
  },
};

export const mocha: Theme = {
  name: 'Catppuccin Mocha',
  base: 'dark',
  colors: {
    backdrop: '#11111B', // sidebar colouring - crust
    background: '#181825', // main background - mantle
    foreground: '#1E1E2E', // searchbar and buttons - base
    primary: '#CBA6F7', // accent + not caught up with chapters - mauve
    'primary-dark': '#a6e3a1', // rating - green
    'border-hover': '#cdd6f4', // button border on hover - text
    secondary: '#ed8796', // not caught up with chapters - red
    'dark-background': '#45475a', // days ago/days to next episode - surface 1
    text: '#cdd6f4', // text - text
    'light-text': '#bac2de', // greyed out text - subtext 1
    'secondary-text': '#89b4fa', // links - blue
    'primary-contrast': '#1e1e2e', // text of primary and secondary - base
    'primary-dark-contrast': '#1e1e2e', // text of primary-dark - base
    'state-1': '#a6e3a1', // watching - green
    'state-2': '#89b4fa', // completed - blue
    'state-3': '#fab387', // on-hold - peach
    'state-4': '#f38ba8', // dropped - red
    'state-6': '#cba6f7', // plan to watch - mauve
    'state-23': '#89dceb', // rewatching - sky
  },
};
