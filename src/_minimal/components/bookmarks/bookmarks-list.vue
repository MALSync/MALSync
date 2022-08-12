<template>
  <div class="book-element">
    <div class="img">
      <ImageLazy :src="item.image" />
    </div>
    <div class="text-side">
      <div class="top-text">
        <MediaLink v-if="item.streamUrl" :href="item.streamUrl" class="stream">
          <TextIcon :src="item.streamIcon">
            {{ lang(`overview_Continue_${item.type}`) }} →
          </TextIcon>
        </MediaLink>
        <div v-if="item.progressText" class="time">
          {{ item.progressText }}
        </div>
      </div>
      <MediaLink :href="item.url" class="link" />
      <Header class="title">
        {{ item.title }}
      </Header>
      <MediaBar
        :watched-ep="item.watchedEp"
        :total-ep="item.totalEp"
        :progress-ep="item.progressEp"
        :progress-text="item.progressText"
      />
    </div>
    <div class="progress">
      <div class="subtext">
        <div class="value">{{ item.watchedEp }}</div>
        <div>/</div>
        <div><MediaTotalEpisode :episode="item.totalEp" /></div>
      </div>
      <MediaProgress :episode="item.progressEp" :text="item.progressText" />
    </div>
    <div class="subtext score">
      {{ item.score || '-' }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { bookmarkItem } from '../../minimalClass';
import ImageLazy from '../image-lazy.vue';
import MediaLink from '../media-link.vue';
import Header from '../header.vue';
import MediaBar from '../media/media-bar.vue';
import MediaTotalEpisode from '../media/media-total-episode.vue';
import MediaProgress from '../media/media-progress.vue';
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
  .border-radius();

  position: relative;
  display: flex;
  padding: 5px 10px 5px 0;
  gap: 10px;
  min-height: 70px;

  .img {
    position: relative;
    overflow: hidden;
    width: 10vw;
    min-width: 80px;
    border-radius: 10px;

    .lazy-image {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
    }
  }

  .link {
    .fullSize();
  }

  .text-side {
    flex-grow: 1;
    display: flex;
    gap: 5px;
    flex-direction: column;
    justify-content: space-around;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  .stream:hover {
    color: var(--cl-secondary);
  }

  .title {
    margin: 0;
  }

  .subtext {
    color: var(--cl-light-text);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;

    .value {
      font-weight: bold;
    }

    &.score {
      width: 50px;
    }
  }

  .progress {
    color: var(--cl-light-text);
    min-width: 80px;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    text-align: center;
    gap: 5px;
  }

  .top-text {
    color: var(--cl-light-text);
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    z-index: 2;
  }

  .bars {
    height: 5px;
  }

  &:hover {
    box-shadow: 0 5px 20px rgb(0 0 0 / 7%);
    background-color: var(--cl-backdrop);

    .img {
      overflow: visible;
      z-index: 1;
      pointer-events: none;
      .lazy-image {
        .border-radius();
        .box-shadow();

        left: -10px;
      }
    }
  }
}
</style>
