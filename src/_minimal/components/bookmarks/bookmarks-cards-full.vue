<template>
  <div class="book-element">
    <ImageLazy class="img" :src="item.imageLarge" mode="cover" />
    <div class="gradient" :class="`gradient-${item.status}`" />
    <MediaLink class="link" :href="item.url" :title="title" />
    <div class="text">
      <div class="top-text">
        <MediaPillProgress :progress="item.progress" />
        <MediaPill
          :score="item.score"
          :stream-url="item.streamUrl"
          :stream-icon="item.streamIcon"
          :watched-ep="item.watchedEp"
        />
      </div>
      <div class="bottomBox">
        <div class="backdrop"></div>
        <div class="title">{{ item.title }}</div>
        <MediaBar
          :watched-ep="item.watchedEp"
          :total-ep="item.totalEp"
          :progress-ep="item.progressEp"
          :progress-text="item.progressText"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { bookmarkItem } from '../../minimalClass';
import MediaLink from '../media-link.vue';
import MediaPill from '../media/media-pill.vue';
import MediaPillProgress from '../media/media-pill-progress.vue';
import ImageLazy from '../image-lazy.vue';
import MediaBar from '../media/media-bar.vue';

const props = defineProps({
  item: {
    type: Object as PropType<bookmarkItem>,
    required: true,
  },
});

const title = computed(() => {
  const t = props.item.totalEp ? props.item.totalEp : '?';
  const prog = props.item.progressEp ? `[${props.item.progressEp}]` : '';
  return `${props.item.watchedEp}/${t} ${prog}`;
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.book-element {
  .click-move-down();
  .box-shadow();
  .border-radius();

  color: white;
  overflow: hidden;
  position: relative;
  aspect-ratio: @aspect-ratio-cover;

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

  .text {
    .fullSize();

    display: flex;
    flex-direction: column;
    pointer-events: none;
  }

  .top-text {
    flex-grow: 1;
    align-self: flex-end;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    padding: 10px;
  }

  .bottomBox {
    .border-radius();

    position: relative;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 10px;
    overflow: hidden;

    .backdrop {
      .fullSize();

      backdrop-filter: blur(14px);
      background-color: #00000059;
      opacity: 1;
      transition: opacity @fast-transition;
    }

    .title {
      position: relative;
      margin-bottom: 10px;
    }
  }

  &:hover {
    .img {
      filter: grayscale(1);
    }
    .gradient {
      opacity: 1;
    }
    .backdrop {
      opacity: 0;
    }
  }
}
</style>
