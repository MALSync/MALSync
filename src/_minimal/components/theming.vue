<template>
  <span class="theming" style="display: none"></span>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { hexToHsl, HSL, Hsl } from '../../utils/color';

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
    default:
      break;
  }

  return cl.join(' ');
});

watch(
  classes,
  value => {
    document.documentElement.className = value;
  },
  {
    immediate: true,
  },
);

const hslColorString = (color: Hsl, opacity = false) => {
  return `hsla(${color[0]}, ${color[1]}%, ${color[2]}%${opacity ? ', var(--cl-opacity)' : ''})`;
};

const styles = computed(() => {
  if (api.settings.get('theme') !== 'custom') return '';
  const s: string[] = [];

  const base = new HSL(...hslColor.value);

  const backdrop = base.copy().illuminate(-15, 20, 100, true).saturate(15, 15, 85, true);
  const foreground = base.copy().illuminate(8, 0, 100, true);
  const primary = base.copy().illuminate(10, 30, 45).hue(120).saturate(0, 50);
  let secondary = base.copy().illuminate(0, 10, 30).hue(-120).saturate(20, 70, 90);
  let lightText = base.copy().illuminate(-50, 10, 90).saturate(0, 0, 0);

  if (base.isDark()) {
    secondary = base.copy().illuminate(40, 70, 90).hue(-120).saturate(20, 70, 90);
    lightText = base.copy().illuminate(50, 10, 90).saturate(0, 0, 0);
  }

  s.push(`--cl-background: ${hslColorString(base.toHsl(), true)}`);
  s.push(`--cl-backdrop: ${hslColorString(backdrop.toHsl())}`);
  s.push(`--cl-foreground: ${hslColorString(foreground.toHsl(), true)}`);
  s.push(`--cl-foreground-solid: ${hslColorString(foreground.toHsl())}`);
  s.push(`--cl-primary: ${hslColorString(primary.toHsl())}`);
  s.push(`--cl-secondary: ${hslColorString(secondary.toHsl())}`);
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
    document.documentElement.style.cssText = value;
  },
  {
    immediate: true,
  },
);
</script>
