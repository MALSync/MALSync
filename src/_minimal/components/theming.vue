<template>
  <span class="theming" style="display: none"></span>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { hexToHsl, Hsl, hue, illuminate, isDark, saturate } from '../../utils/color';

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
      if (isDark(hslColor.value)) cl.push('dark');
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

  const backdrop = saturate(illuminate(hslColor.value, -15, 10), 15);
  const foreground = illuminate(hslColor.value, 8);
  const primary = hue(illuminate(hslColor.value, 0, 30, 50), 60);
  let secondary = hue(saturate(illuminate(hslColor.value, 0, 10, 30), 20, 70, 90), 60);
  let lightText = illuminate([hslColor.value[0], 0, hslColor.value[2]], -50, 10, 90);

  if (isDark(hslColor.value)) {
    secondary = hue(saturate(illuminate(hslColor.value, 0, 70, 90), 20, 70, 90), 60);
    lightText = illuminate([hslColor.value[0], 0, hslColor.value[2]], 50, 10, 90);
  }

  s.push(`--cl-background: ${hslColorString(hslColor.value, true)}`);
  s.push(`--cl-backdrop: ${hslColorString(backdrop)}`);
  s.push(`--cl-foreground: ${hslColorString(foreground, true)}`);
  s.push(`--cl-foreground-solid: ${hslColorString(foreground)}`);
  s.push(`--cl-primary: ${hslColorString(primary)}`);
  s.push(`--cl-secondary: ${hslColorString(secondary)}`);
  s.push(`--cl-light-text: ${hslColorString(lightText)}`);

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
