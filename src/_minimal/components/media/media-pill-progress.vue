<template>
  <PillDark v-if="progress?.progress()?.getAuto()" :title="progress!.progress()!.getAutoText()">
    {{ progress.progress()!.getAuto() }}
  </PillDark>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import type { ProgressRelease } from '../../../utils/progressRelease';
import PillDark from '../pill-dark.vue';

defineProps({
  progress: {
    type: Object as PropType<ProgressRelease | null>,
    required: false,
    default: null,
  },
});
</script>
