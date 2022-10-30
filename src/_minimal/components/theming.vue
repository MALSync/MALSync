<template>
  <span class="theming" style="display: none"></span>
</template>

<script lang="ts" setup>
import { computed, inject, watch } from 'vue';
import { hexToHsl, HSL, Hsl } from '../../utils/color';
import { getThemeByKey } from './themes';

const rootHtml = inject('rootHtml') as HTMLElement;

const hslColor = computed(() => hexToHsl(api.settings.get('themeColor')));

const classes = computed(() => {
  const cl: string[] = [];

  if (api.settings.get('theme') === 'dark') cl.push('dark');
  if (api.settings.get('theme') === 'auto') cl.push('auto');
  if (!api.settings.get('themeSidebars')) cl.push('no-sidebar');

  switch (api.settings.get('theme')) {
    case 'dark':
      cl.push('dark');
      break;
    case 'auto':
      cl.push('auto');
      break;
    case 'custom':
      cl.push('custom');
      if (new HSL(...hslColor.value).isDark()) cl.push('dark');
      if (api.settings.get('themeImage')) cl.push('backImage');
      break;
    default: {
      const theme = getThemeByKey(api.settings.get('theme'));
      if (theme && theme.base === 'dark') cl.push('dark');
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

const hslColorString = (color: Hsl, opacity = false) => {
  return `hsla(${color[0]}, ${color[1]}%, ${color[2]}%${opacity ? ', var(--cl-opacity)' : ''})`;
};

const styles = computed(() => {
  if (getThemeByKey(api.settings.get('theme'))) {
    const theme = getThemeByKey(api.settings.get('theme'));
    const c = theme.colors;
    if (c.foreground && !c['foreground-solid']) c['foreground-solid'] = c.foreground;
    const colors = Object.keys(c).map(key => `--cl-${key}: ${theme.colors[key]};`);
    return colors.join(';');
  }
  if (api.settings.get('theme') !== 'custom') return '';
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
  s.push(`--cl-backdrop: ${hslColorString(backdrop.toHsl())}`);
  s.push(`--cl-foreground: ${hslColorString(foreground.toHsl(), true)}`);
  s.push(`--cl-foreground-solid: ${hslColorString(foreground.toHsl())}`);
  s.push(`--cl-primary: ${hslColorString(primary.toHsl())}`);
  s.push(`--cl-secondary: ${hslColorString(secondary.toHsl())}`);
  s.push(`--cl-secondary-text: ${hslColorString(secondaryText.toHsl())}`);
  s.push(`--cl-light-text: ${hslColorString(lightText.toHsl())}`);

  if (api.settings.get('themeImage')) {
    s.push(`--cl-back-image: url('${api.settings.get('themeImage')}')`);
    s.push(`--cl-opacity: ${api.settings.get('themeOpacity') / 100}`);
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
