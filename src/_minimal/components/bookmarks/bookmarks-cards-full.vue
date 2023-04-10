<template>
  <div class="book-element">
    <div :style="`--text: ${styleText}`">
      <ImageLazy class="img normal" :src="item.imageLarge" mode="cover" />
      <ImageLazy class="img blurred" :src="item.imageLarge" mode="cover" />
    </div>
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
          :total-ep="item.totalEp"
          :progress-ep="item.progressEp"
          :progress-text="item.progressText"
        />
      </div>
      <div ref="text" class="bottomBox">
        <div class="title">
          <TextCutoff>{{ item.title }}</TextCutoff>
        </div>
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
import { computed, nextTick, onBeforeUnmount, onMounted, PropType, ref, Ref, watch } from 'vue';
import { bookmarkItem } from '../../minimalClass';
import MediaLink from '../media-link.vue';
import MediaPill from '../media/media-pill.vue';
import MediaPillProgress from '../media/media-pill-progress.vue';
import ImageLazy from '../image-lazy.vue';
import MediaBar from '../media/media-bar.vue';
import TextCutoff from '../text-cutoff.vue';

const props = defineProps({
  item: {
    type: Object as PropType<bookmarkItem>,
    required: true,
  },
});

const title = computed(() => {
  const t = props.item.totalEp ? props.item.totalEp : '?';
  const prog = props.item.progressEp ? `[${props.item.progressEp}]` : '';
  return `${props.item.watchedEp}/${t} ${prog} ${props.item.title}`;
});

const text = ref(null) as Ref<HTMLElement | null>;
const textHeight = ref(0);

const calcHeights = () => {
  if (text.value) {
    textHeight.value = text.value.clientHeight;
  }
};

const resizeObserver = new ResizeObserver(() => {
  calcHeights();
});

watch(
  text,
  value => {
    if (value) resizeObserver.observe(value);
  },
  { immediate: true },
);

onMounted(() => {
  nextTick(() => {
    calcHeights();
  });
  calcHeights();
});

onBeforeUnmount(() => {
  resizeObserver.disconnect();
});

const styleText = computed(() => `${textHeight.value}px`);
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

    border-radius: 11px;

    &.normal {
      clip-path: inset(0 0 var(--text) 0);
    }

    &.blurred {
      filter: blur(8px) brightness(0.6);
      clip-path: inset(calc(100% - var(--text)) 0 0 0);
    }
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
    position: relative;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    padding: 10px;
    overflow: hidden;

    .title {
      position: relative;
      margin-bottom: 10px;
      font-weight: 500;
    }
  }

  &:hover {
    .img {
      filter: grayscale(1);

      &.normal {
        clip-path: inset(0 0 0 0);
      }

      &.blurred {
        display: none;
      }
    }
    .gradient {
      opacity: 1;
    }
  }
}
</style>
