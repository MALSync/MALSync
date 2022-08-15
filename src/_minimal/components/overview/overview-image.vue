<template>
  <div class="overviewImage">
    <ImageFit class="over" :src="src" :loading="loading" />
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

<style lang="less" scoped>
@import '../../less/_globals.less';
.overviewImage {
  .border-radius();

  overflow: hidden;
  position: relative;
  .over {
    .fullSize();
  }
}
</style>
