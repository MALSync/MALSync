<template>
  <ErrorGeneral v-if="error">
    <span v-dompurify-html="error"></span>
  </ErrorGeneral>
</template>

<script lang="ts" setup>
import ErrorGeneral from './error-general.vue';

defineProps({
  error: {
    type: String,
    default: '',
  },
});
</script>
