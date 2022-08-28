<template>
  <div class="head">
    <MediaLink :href="href" class="img">
      <ImageLazy :src="image" class="img-el" />
    </MediaLink>
    <div class="info">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ImageLazy from './image-lazy.vue';
import MediaLink from './media-link.vue';

defineProps({
  href: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
});
</script>

<style lang="less" scoped>
.head {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  .img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    &-el {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
}
</style>
