<template>
  <PillDark
    v-if="progress && progress.getAuto && progress.getAuto()"
    :title="progress.getAutoText()"
  >
    {{ progress.getAuto() }}
  </PillDark>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { Progress } from '../../../utils/progress';
import PillDark from '../pill-dark.vue';

defineProps({
  progress: {
    type: Object as PropType<Progress | null>,
    required: false,
    default: null,
  },
});
</script>
