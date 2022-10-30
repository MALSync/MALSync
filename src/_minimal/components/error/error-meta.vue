<template>
  <ErrorGeneral v-if="!metaRequest.loading && metaRequest.error">
    {{ metaRequest.error.message || metaRequest.error }}
  </ErrorGeneral>
</template>

<script lang="ts" setup>
import ErrorGeneral from './error-general.vue';

defineProps({
  metaRequest: {
    type: Object,
    default: () => ({}),
  },
});
</script>
