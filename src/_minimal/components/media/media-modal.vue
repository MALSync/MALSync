<template>
  <div class="outer">
    <MediaLink v-if="fill && fill.url" :href="fill.url" class="mediaModal">
      <ImageFit :src="fill.image" class="image" />
      <DynamicFont class="title" :text="fill.title || fill.url" />
    </MediaLink>
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import MediaLink from '../media-link.vue';
import ImageFit from '../image-fit.vue';
import Header from '../header.vue';
import DynamicFont from '../dynamic-font.vue';

const fill = inject('fill') as null | { url: string; image: string; title: string };
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.outer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 20px;
  z-index: 10;
}

.mediaModal {
  .border-radius();
  .big-shadow();

  display: flex;
  align-items: center;
  background-color: var(--cl-foreground-solid);
  background-image: url(@diamonds);
  max-width: 600px;
  padding: 5px;

  .image {
    .border-radius();

    width: 125px;
    min-height: 65px;
    min-width: 125px;
    height: 100%;
  }
  .title {
    padding: 10px 15px;
  }
}
</style>
