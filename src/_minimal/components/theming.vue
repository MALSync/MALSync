<template>
  <span class="theming" style="display: none"></span>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';

const classes = computed(() => {
  const cl: string[] = [];

  if (api.settings.get('theme') === 'dark') cl.push('dark');
  if (api.settings.get('theme') === 'auto') cl.push('auto');
  if (!api.settings.get('themeSidebars')) cl.push('no-sidebar');

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

const styles = computed(() => {
  if (api.settings.get('theme') !== 'custom') return '';
  const s: string[] = [];
  const color = api.settings.get('themeColor');
  if (color) s.push(`--cl-background: ${color}`);
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
