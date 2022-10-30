<template>
  <div ref="wrapper" class="transition-wrapper">
    <transition
      name="slide"
      :duration="1000"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
    >
      <slot />
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref } from 'vue';

const wrapper = ref(null as unknown as HTMLElement);

function enter() {
  const { width } = getComputedStyle(wrapper.value);

  wrapper.value.style.width = width;
  wrapper.value.style.position = 'absolute';
  wrapper.value.style.visibility = 'hidden';
  wrapper.value.style.height = 'auto';
  wrapper.value.style.overflow = 'hidden';

  const { height } = getComputedStyle(wrapper.value);

  wrapper.value.style.width = '';
  wrapper.value.style.position = '';
  wrapper.value.style.visibility = '';
  wrapper.value.style.height = '0';

  nextTick().then(() => {
    wrapper.value.style.height = height;
  });
}

function afterEnter() {
  wrapper.value.style.overflow = '';
  wrapper.value.style.height = '';
}

function leave() {
  const { height } = getComputedStyle(wrapper.value);

  wrapper.value.style.height = height;
  wrapper.value.style.overflow = 'hidden';

  nextTick().then(() => {
    wrapper.value.style.height = '0';
  });
}
</script>

<style lang="less" scoped>
@import '../less/_globals.less';

.transition-wrapper {
  transition: height @fast-transition ease-in-out;
  position: relative;
}
</style>
