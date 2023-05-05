<template>
  <div class="book-element">
    <ImageLazy class="img" :src="item.image" mode="cover" />
    <div class="gradient" :class="`gradient-${item.status}`" />
    <MediaLink class="link" :href="item.url" :title="item.title" />
    <div class="on-hover">
      <MediaPill :score="item.score" />
      <MediaPill
        :stream-url="item.streamUrl"
        :stream-icon="item.streamIcon"
        :watched-ep="item.watchedEp"
        :total-ep="item.totalEp"
        :progress-ep="item.progressEp"
        :progress-text="item.progressText"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { bookmarkItem } from '../../minimalClass';
import ImageLazy from '../image-lazy.vue';
import MediaLink from '../media-link.vue';
import MediaPill from '../media/media-pill.vue';

defineProps({
  item: {
    type: Object as PropType<bookmarkItem>,
    required: true,
  },
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.book-element {
  .click-move-down();
  .box-shadow();
  .border-radius();

  overflow: hidden;
  position: relative;
  aspect-ratio: 1;

  .img {
    .fullSize();
  }

  .gradient {
    .fullSize();

    opacity: 0;
    transition: opacity @fast-transition;
  }

  .link {
    .fullSize();
  }

  .on-hover {
    .fullSize();

    opacity: 0;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  &:hover {
    .img {
      filter: grayscale(1);
    }
    .gradient {
      opacity: 1;
    }
    .on-hover {
      opacity: 1;
    }
  }
}
</style>
