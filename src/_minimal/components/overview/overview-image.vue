<template>
  <div class="overviewImage">
    <ImageFit mode="cover" :src="src" :loading="loading" />
  </div>
</template>

<script lang="ts" setup>
import ImageFit from '../image-fit.vue';

defineProps({
  src: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>
