<template>
  <div class="head" :class="{ loading }">
    <MediaLink :href="href" class="img" :class="{ [imageType]: true }">
      <template v-if="imageType === 'cover'">
        <ImageFit :loading="loading" :src="image" class="img-el" mode="cover" />
      </template>
      <template v-else>
        <ImageLazy v-if="!loading" :src="image" class="img-el" />
      </template>
    </MediaLink>
    <div class="info">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import ImageLazy from './image-lazy.vue';
import ImageFit from './image-fit.vue';
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
  imageType: {
    type: String as PropType<'round' | 'cover'>,
    default: 'round',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less" scoped>
@import '../less/_globals.less';

.head {
  display: flex;
  gap: 20px;
  .img {
    width: calc(@normal-text * 6.25);
    min-width: calc(@normal-text * 6.25);
    &.round {
      .box-shadow();

      height: calc(@normal-text * 6.25);
      border-radius: 50%;
      overflow: hidden;
      .img-el {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
  .info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  &.loading {
    .img {
      &.round {
        .skeleton-img();
      }
    }
    .info {
      overflow: hidden;
    }
  }
}
</style>
