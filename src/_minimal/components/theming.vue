<template>
  <span class="theming" style="display: none"></span>
</template>

<script lang="ts" setup>
import { computed, inject, watch } from 'vue';
import { hexToHsl, HSL, Hsl } from '../../utils/color';
import { Theme, getThemeByKey, themeOverrides } from './themes';

const rootHtml = inject('rootHtml') as HTMLElement;

const themeConfig = () => {
  const conf = {
    theme: api.settings.get('theme'),
    sidebars: api.settings.get('themeSidebars'),
    image: api.settings.get('themeImage'),
    opacity: api.settings.get('themeOpacity'),
    color: api.settings.get('themeColor'),
    predefined: null as null | Theme,
  };

  if (rootHtml.getAttribute('mode') === 'install') conf.theme = 'installTheme';

  if (conf.theme && !['dark', 'light', 'auto', 'custom'].includes(conf.theme)) {
    conf.predefined = getThemeByKey(conf.theme);
    if (conf.predefined && conf.predefined.overrides) {
      for (const i in themeOverrides) {
        const key = themeOverrides[i];
        if (typeof conf.predefined.overrides[key] !== 'undefined')
          conf[key] = conf.predefined.overrides[key];
      }
    }
  }

  return conf;
};

const hslColor = computed(() => hexToHsl(themeConfig().color));

const classes = computed(() => {
  const cl: string[] = [];
  const config = themeConfig();

  cl.push(`theme-${config.theme}`);

  if (config.theme && config.theme === 'auto') {
    const now = new Date();
    if (now.getMonth() === 3 && now.getDate() === 1) {
      cl.push('theme-bestTheme');
    }
  }

  if (!config.sidebars) cl.push('no-sidebar');

  switch (config.theme) {
    case 'dark':
      cl.push('dark');
      break;
    case 'auto':
      cl.push('auto');
      break;
    case 'custom':
      cl.push('custom');
      if (new HSL(...hslColor.value).isDark()) cl.push('dark');
      if (config.image) cl.push('backImage');
      break;
    default: {
      if (config.predefined && config.predefined.base === 'dark') cl.push('dark');
      if (config.image) cl.push('backImage');
      break;
    }
  }

  return cl.join(' ');
});

watch(
  classes,
  value => {
    rootHtml.className = value;
  },
  {
    immediate: true,
  },
);

const direction = computed(() => {
  return api.storage.langDirection() === 'rtl' ? 'rtl' : '';
});

watch(
  direction,
  value => {
    rootHtml.setAttribute('dir', value);
  },
  {
    immediate: true,
  },
);

const hslColorString = (color: Hsl, opacity = false) => {
  return `hsla(${color[0]}, ${color[1]}%, ${color[2]}%${opacity ? ', var(--cl-opacity)' : ''})`;
};

const styles = computed(() => {
  const config = themeConfig();

  if (config.predefined) {
    const theme = config.predefined;
    const c = theme.colors;
    if (c.foreground && !c['foreground-solid']) c['foreground-solid'] = c.foreground;
    if (c.background && !c['background-solid']) c['background-solid'] = c.background;

    if (theme.overrides && theme.overrides.image) {
      c.background = hslColorString(hexToHsl(c.background), true);
    }

    const colors = Object.keys(c).map(key => `--cl-${key}: ${theme.colors[key]};`);

    if (theme.overrides && theme.overrides.image) {
      colors.push(`--cl-back-image: url('${theme.overrides.image}')`);
      colors.push(`--cl-opacity: ${config.opacity / 100}`);
    }

    return colors.join(';');
  }
  if (config.theme !== 'custom') return '';
  const s: string[] = [];

  const base = new HSL(...hslColor.value);

  const backdrop = base.copy().illuminate(-15, 20, 100, true).saturate(15, 15, 85, true);
  const foreground = base.copy().illuminate(8, 0, 100, true);
  const primary = base.copy().illuminate(10, 30, 45).hue(120).saturate(0, 50);
  let secondary = base.copy().illuminate(0, 35, 45).hue(-120).saturate(-20, 40, 80);
  let secondaryText = base.copy().illuminate(0, 45, 55).hue(-120).saturate(10, 30, 55);
  let lightText = base.copy().illuminate(-50, 10, 90).saturate(0, 0, 0);

  if (base.isDark()) {
    secondary = base.copy().illuminate(0, 35, 45).hue(-120).saturate(-20, 40, 80);
    secondaryText = base.copy().illuminate(0, 59, 60).hue(-120).saturate(10, 40, 100);
    lightText = base.copy().illuminate(50, 10, 90).saturate(0, 0, 0);
  }

  s.push(`--cl-background: ${hslColorString(base.toHsl(), true)}`);
  s.push(`--cl-background-solid: ${hslColorString(base.toHsl(), false)}`);
  s.push(`--cl-backdrop: ${hslColorString(backdrop.toHsl())}`);
  s.push(`--cl-foreground: ${hslColorString(foreground.toHsl(), true)}`);
  s.push(`--cl-foreground-solid: ${hslColorString(foreground.toHsl())}`);
  s.push(`--cl-primary: ${hslColorString(primary.toHsl())}`);
  s.push(`--cl-secondary: ${hslColorString(secondary.toHsl())}`);
  s.push(`--cl-secondary-text: ${hslColorString(secondaryText.toHsl())}`);
  s.push(`--cl-light-text: ${hslColorString(lightText.toHsl())}`);

  if (config.image) {
    s.push(`--cl-back-image: url('${config.image}')`);
    s.push(`--cl-opacity: ${config.opacity / 100}`);
  }

  return s.join(';');
});

watch(
  styles,
  value => {
    rootHtml.style.cssText = value;
  },
  {
    immediate: true,
  },
);
</script>
