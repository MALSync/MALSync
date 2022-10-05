<template>
  <div class="book-element">
    <ImageFit
      class="img"
      :src="item.imageBanner ? item.imageBanner : item.imageLarge"
      mode="cover"
    />
    <div class="gradient gradient-black" />
    <MediaLink class="link" :href="item.url" />
    <div class="text">
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
      <div class="subtext">
        <div>
          {{ episodeLang(item.type) }}
          <span class="value">
            {{ item.watchedEp }}/<MediaTotalEpisode :episode="item.totalEp" />
            <MediaProgress :episode="item.progressEp" :text="item.progressText" />
          </span>
        </div>
        <div v-if="item.score">
          {{ lang('search_Score') }}
          <span class="value">
            {{ item.score }}
          </span>
        </div>
      </div>
      <Header class="title"> <StateDot :status="item.status" />{{ item.title }} </Header>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { bookmarkItem } from '../../minimalClass';
import ImageFit from '../image-fit.vue';
import MediaLink from '../media-link.vue';
import Header from '../header.vue';
import StateDot from '../state-dot.vue';
import MediaTotalEpisode from '../media/media-total-episode.vue';
import MediaProgress from '../media/media-progress.vue';
import MediaPill from '../media/media-pill.vue';
import MediaPillProgress from '../media/media-pill-progress.vue';

defineProps({
  item: {
    type: Object as PropType<bookmarkItem>,
    required: true,
  },
});

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
    height: 190px;
  });

  .img {
    .fullSize();
  }

  .gradient {
    .fullSize();
  }

  .link {
    .fullSize();
  }

  .text {
    .fullSize();

    display: flex;
    flex-direction: column;
    padding: @spacer-half;
    pointer-events: none;
  }

  .top-text {
    flex-grow: 1;
    align-self: flex-end;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  .title {
    margin: 0;
  }

  .subtext {
    display: flex;
    gap: 20px;
    margin-bottom: 5px;
    .value {
      padding-left: 5px;
      font-weight: bold;
    }
  }
}
</style>
