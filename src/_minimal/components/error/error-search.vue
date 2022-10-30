<template>
  <ErrorGeneral v-if="!listRequest.loading && listRequest.error">
    {{ listRequest.error.message || listRequest.error }}
  </ErrorGeneral>
</template>

<script lang="ts" setup>
import ErrorGeneral from './error-general.vue';

defineProps({
  listRequest: {
    type: Object,
    default: () => ({}),
  },
});
</script>
