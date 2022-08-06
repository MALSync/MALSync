<template>
  <div class="book-element">
    <ImageLazy class="img" :src="item.image" mode="cover" />
    <div class="gradient" :class="`gradient-${item.status}`" />
    <MediaLink class="link" :href="item.url" />
    <div class="on-hover">
      <PillSplit>
        <template v-if="item.score" #left>
          <TextIcon icon="star">{{ item.score }}</TextIcon>
        </template>
        <template v-if="item.streamUrl" #right>
          <MediaLink :href="item.streamUrl">
            <TextIcon :src="item.streamIcon">{{ item.watchedEp }}</TextIcon>
          </MediaLink>
        </template>
      </PillSplit>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { bookmarkItem } from '../../minimalClass';
import ImageLazy from '../image-lazy.vue';
import MediaLink from '../media-link.vue';
import PillSplit from '../pill-split.vue';
import TextIcon from '../text-icon.vue';

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
