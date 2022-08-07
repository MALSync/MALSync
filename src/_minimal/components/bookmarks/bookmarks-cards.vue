<template>
  <div class="book-element">
    <ImageFit class="img" :src="item.image" mode="cover" />
    <div class="gradient gradient-black" />
    <MediaLink class="link" :href="item.url" />
    <div class="text">
      <div class="subtext">
        <div>
          Progress
          <span class="value">
            {{ item.watchedEp }}/<MediaTotalEpisode :episode="item.totalEp" />
            <MediaProgress :episode="item.progressEp" :text="item.progressText" />
          </span>
        </div>
        <div v-if="item.score">
          Score
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

  color: white;
  overflow: hidden;
  position: relative;
  height: 240px;

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
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 20px;
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
