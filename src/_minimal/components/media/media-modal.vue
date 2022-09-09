<template>
  <div v-if="fill && fill.url && open" class="outer">
    <MediaLink :href="fill.url" class="mediaModal" @click="open = false">
      <ImageFit :src="fill.image" class="image" />
      <DynamicFont class="title" :text="fill.title || fill.url" />
      <div class="material-icons top-icon" @click.prevent="open = false">close</div>
      <div class="material-icons image-icon" @click.prevent="open = false">open_in_browser</div>
    </MediaLink>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, Ref, ref, watch } from 'vue';
import MediaLink from '../media-link.vue';
import ImageFit from '../image-fit.vue';
import DynamicFont from '../dynamic-font.vue';

const fill = inject('fill') as Ref<null | { url: string; image: string; title: string }>;

const open = ref(true);

const url = computed(() => (fill.value ? fill.value.url : null));

watch(url, () => {
  open.value = true;
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.outer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 20px;
  z-index: 10;
}

.mediaModal {
  .border-radius();
  .big-shadow();
  .click-move-down();

  display: flex;
  align-items: center;
  background-color: var(--cl-foreground-solid);
  background-image: url(@diamonds);
  max-width: 600px;
  padding: 5px;
  position: relative;

  .image {
    .border-radius();

    width: 125px;
    min-height: 65px;
    min-width: 125px;
    height: 100%;
    filter: brightness(0.7);
  }
  .title {
    padding: 10px 15px;
  }

  .top-icon {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: var(--cl-primary);
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
  }

  .image-icon {
    position: absolute;
    left: 68px;
    top: 50%;
    transform: translateY(-50%) translateX(-50%);
    font-size: 32px;
    color: white;
  }
}
</style>
