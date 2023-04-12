<template>
  <div class="book-element">
    <ImageFit class="img" :src="item.imageBanner ? item.imageBanner : item.imageLarge" />
    <div class="gradient" :class="`gradient-${item.status}`" />
    <MediaLink class="link" :href="item.url" :title="item.title" />
    <div class="text">
      <div class="gradient-transition">
        <div class="top-text">
          <MediaPillProgress :progress="item.progress" />
          <MediaPill
            :score="item.score"
            :stream-url="item.streamUrl"
            :stream-icon="item.streamIcon"
            :watched-ep="item.watchedEp"
            :show-ep="false"
          />
        </div>
      </div>
      <div class="gradient-text">
        <div class="subtext">
          <div>
            {{ episodeLang(item.type) }}
            <span class="value">
              {{ item.watchedEp }}/<MediaTotalEpisode :episode="item.totalEp" />
              <MediaProgressPill
                :episode="item.progressEp"
                :text="item.progressText"
                mode="large"
                :watched-ep="item.watchedEp"
              />
            </span>
          </div>
        </div>
        <Header class="title">
          <StateDot :status="item.status" /><span>
            <TextCutoff :lines="breakpoint === 'desktop' ? 3 : 2">{{ item.title }}</TextCutoff>
          </span>
        </Header>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, PropType } from 'vue';
import { bookmarkItem } from '../../minimalClass';
import ImageFit from '../image-fit.vue';
import MediaLink from '../media-link.vue';
import Header from '../header.vue';
import StateDot from '../state-dot.vue';
import MediaTotalEpisode from '../media/media-total-episode.vue';
import MediaPill from '../media/media-pill.vue';
import MediaPillProgress from '../media/media-pill-progress.vue';
import MediaProgressPill from '../media/media-progress-pill.vue';
import TextCutoff from '../text-cutoff.vue';

defineProps({
  item: {
    type: Object as PropType<bookmarkItem>,
    required: true,
  },
});

const breakpoint = inject('breakpoint');

const episodeLang = utils.episode;
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
  height: 240px;
  .__breakpoint-popup__( {
    height: 180px;
  });

  .img {
    .fullSize();

    border-radius: 11px;
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
    --gradient-pr: rgb(36 36 36 / 40%);
    --gradient-end: rgb(36 36 36 / 85.9%);

    display: flex;
    flex-direction: column;
    pointer-events: none;

    .gradient-transition {
      flex-grow: 1;
      padding: @spacer-half;
      background: linear-gradient(rgb(255 255 255 / 0%) 30%, var(--gradient-pr) 100%);
    }

    .gradient-text {
      padding: @spacer-half;
      background: linear-gradient(var(--gradient-pr) 0%, var(--gradient-end) 100%);
    }
  }

  .top-text {
    align-self: flex-end;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .title {
    margin: 0;
    display: flex;
    align-items: center;
  }

  .subtext {
    display: flex;
    gap: 20px;
    margin-bottom: 5px;
    .value {
      display: inline-flex;
      align-items: center;
      padding-left: 5px;
      font-weight: 600;
    }
  }

  &:hover {
    .gradient {
      opacity: 1;
    }
  }
}
</style>
