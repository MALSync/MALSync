<template>
  <div v-if="left || right" class="pill" :class="{ reverse, blurBackground: !img }">
    <ImageLazy v-if="img" class="blur-img normal" :src="img" mode="cover" />
    <div v-if="left" class="left" :class="color"><slot name="left" /></div>
    <div v-if="right" class="right"><slot name="right" /></div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import ImageLazy from './image-lazy.vue';

defineProps({
  left: {
    type: Boolean,
    default: true,
  },
  right: {
    type: Boolean,
    default: true,
  },
  reverse: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String as PropType<'primary-dark' | 'secondary' | 'dark-background'>,
    default: 'primary-dark',
  },
  img: {
    type: String,
    optional: true,
    default: '',
  },
});
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.pill {
  .border-pill();
  .block-select();

  z-index: 1;
  position: relative;
  display: inline-flex;
  overflow: hidden;
  background-color: #0000003b;

  &.blurBackground {
    backdrop-filter: blur(5px);
  }

  &.reverse {
    flex-direction: row-reverse;
  }

  & > .right,
  & > .left {
    padding: 5px 10px;
  }
  & > .left {
    .border-pill();

    color: white;

    &.primary-dark {
      background-color: var(--cl-primary-dark);
      color: var(--cl-primary-dark-contrast);
    }
    &.secondary {
      background-color: var(--cl-secondary);
    }

    &.dark-background {
      background-color: var(--cl-dark-background);
    }
  }
  & > .right {
    color: white;
  }

  .blur-img {
    position: absolute;
    top: -10px;
    right: -10px;
    width: var(--card-width);
    height: var(--card-height);
    display: block;
    max-width: none;
    filter: blur(5px) brightness(0.8);
    z-index: -1;
  }
}
</style>
