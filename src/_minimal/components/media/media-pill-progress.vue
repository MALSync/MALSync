<template>
  <PillDark v-if="text">
    {{ text }}
  </PillDark>
</template>

<script lang="ts" setup>
import PillDark from '../pill-dark.vue';

defineProps({
  episode: {
    type: Number,
    required: false,
    default: 0,
  },
  text: {
    type: String,
    required: false,
    default: '',
  },
});
</script>
