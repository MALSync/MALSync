<template>
  <ErrorGeneral v-if="!listRequest.loading && listRequest.error">
    <span v-if="listRequest.error.html" v-dompurify-html="listRequest.error.html"></span>
    <template v-else>{{ listRequest.error.message || listRequest.error }}</template>
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
