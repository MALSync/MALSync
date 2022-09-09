<template>
  <div class="image-fit" :class="{ small: small, cover: mode === 'cover', loading }">
    <template v-if="!loading">
      <imageLazy class="mainImage" :src="src" mode="object-fit" @load="imageLoaded" />
      <img v-if="small" class="sideImage" :src="src" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref } from 'vue';
import imageLazy from './image-lazy.vue';

defineProps({
  src: {
    type: String,
    required: false,
    default: null,
  },
  mode: {
    type: String as PropType<'' | 'cover'>,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const small = ref(false);
const imageLoaded = (event: Event) => {
  if (event.currentTarget) {
    const el = event.currentTarget as HTMLImageElement;

    if (el.naturalWidth * 1.4 < el.width) {
      small.value = true;
    } else if (el.naturalHeight * 1.4 < el.height) {
      small.value = true;
    }
  }
};
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.image-fit {
  position: relative;
  overflow: hidden;
  .mainImage {
    .fullSize();
  }
  .sideImage {
    .fullSize();

    object-fit: contain;
    margin-left: auto;
    margin-right: auto;
    top: 50%;
    transform: translateY(-50%);
    height: auto;
    width: auto;
    max-width: 100%;
  }
  &.small {
    .mainImage {
      filter: blur(4px);
    }
  }
  &.cover {
    aspect-ratio: @aspect-ratio-cover;
    .border-radius();
    .box-shadow();
  }
  &.loading {
    .skeleton-img();
  }
}
</style>
