<script lang="ts" setup>
import { computed, watch } from 'vue';

const classes = computed(() => {
  const cl: string[] = [];

  if (api.settings.get('theme') === 'dark') cl.push('dark');
  if (api.settings.get('theme') === 'auto') cl.push('auto');

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
</script>
