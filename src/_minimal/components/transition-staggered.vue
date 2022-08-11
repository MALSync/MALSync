<template>
  <transition-group appear @before-enter="beforeEnter" @enter="enter">
    <slot />
  </transition-group>
</template>

<script lang="ts" setup>
import { nextTick } from 'vue';

const props = defineProps({
  delayDuration: {
    type: Number,
    default: 100,
  },
});

const transitionDuration = 150;

async function beforeEnter(el: HTMLElement) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  await nextTick();
  el.style.transitionProperty = 'opacity, transform';
  el.style.transitionDuration = `${transitionDuration}ms`;
}

async function enter(el: HTMLElement) {
  setTimeout(() => {
    const index = Array.from(el.parentElement!.children).indexOf(el);
    const delay = index * props.delayDuration;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    el.style.transitionDelay = `${delay}ms`;
    setTimeout(() => {
      el.setAttribute('style', '');
    }, delay + transitionDuration);
  }, 0);
}
</script>
