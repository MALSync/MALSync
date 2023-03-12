<template>
  <div class="book-element" :class="`state-${item.status}`">
    <div class="img">
      <ImageLazy :src="item.image" />
    </div>
    <div class="text-side" :class="{ hasTop: item.streamUrl || item.progressText }">
      <div v-if="item.streamUrl || item.progressText" class="top-text">
        <MediaLink v-if="item.streamUrl" :href="item.streamUrl" class="stream">
          <TextIcon :src="item.streamIcon">
            <span class="stream-text">{{ lang(`overview_Continue_${item.type}`) }} <Arrow /></span>
          </TextIcon>
        </MediaLink>
        <div v-if="item.progressText" class="time">
          {{ item.progressText }}
        </div>
      </div>
      <MediaLink :href="item.url" class="link" />
      <TextCutoff>
        <DynamicFont class="title" :text="item.title" :sizes="[20]" :double-row-sizes="[20, 14]" />
      </TextCutoff>
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
        <div>
          <MediaProgressPill
            :episode="item.progressEp"
            :text="item.progressText"
            mode="medium"
            :watched-ep="item.watchedEp"
          />
        </div>
      </div>
    </div>
    <div class="subtext score">
      {{ item.score || '' }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { bookmarkItem } from '../../minimalClass';
import ImageLazy from '../image-lazy.vue';
import MediaLink from '../media-link.vue';
import MediaBar from '../media/media-bar.vue';
import MediaTotalEpisode from '../media/media-total-episode.vue';
import TextIcon from '../text-icon.vue';
import TextCutoff from '../text-cutoff.vue';
import DynamicFont from '../dynamic-font.vue';
import Arrow from '../arrow.vue';
import MediaProgressPill from '../media/media-progress-pill.vue';

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
    max-width: 125px;
    border-radius: 10px;

    .lazy-image {
      .border-radius();

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
    flex-shrink: 1000;
    display: flex;
    gap: 4px;
    flex-direction: column;
    justify-content: space-around;
    padding-top: calc(5px + (@small-text / 2));
    padding-bottom: calc(5px + (@small-text / 2));
    &.hasTop {
      padding-top: 3px;
      padding-bottom: 3px;
    }
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
      .__breakpoint-small__({
        display: none;
      });
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
    .__breakpoint-small__({
      display: none;
    });
  }

  .top-text {
    color: var(--cl-light-text);
    font-size: @small-text;
    height: @small-text;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    z-index: 2;
  }

  .bars {
    pointer-events: none;
    height: 5px;
  }

  &:hover {
    .border-radius();

    box-shadow: 0 5px 20px rgb(0 0 0 / 7%);
    background-color: var(--cl-backdrop);

    each(@state-colors, {
      &.state-@{key} {
        background: linear-gradient(90deg, ~"var(--state-@{key})"0%, ~"var(--cl-backdrop)" 30%);
      }
    });

    .img {
      overflow: visible;
      z-index: 1;
      pointer-events: none;
      .lazy-image {
        .border-radius();
        .big-shadow();

        left: -10px;
        max-width: calc(100% + 10px);
      }
    }
  }
}

@media screen and (max-width: 600px) {
  .stream-text {
    display: none;
  }
}

.empty,
.error {
  height: 100%;
}
</style>
