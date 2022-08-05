<template>
  <transition-group appear @before-enter="beforeEnter" @enter="enter">
    <slot />
  </transition-group>
</template>

<script lang="ts" setup>
import { nextTick } from 'vue';

const transitionDuration = 150;
const delayDuration = 100;

async function beforeEnter(el: HTMLElement) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  await nextTick();
  el.style.transition = 'opacity 2s ease, transform 2s ease';
  el.style.transitionDuration = `${transitionDuration}ms`;
}

async function enter(el: HTMLElement) {
  await nextTick();
  const index = Array.from(el.parentElement!.children).indexOf(el);
  const delay = index * delayDuration;
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
  el.style.transitionDelay = `${delay}ms`;
  setTimeout(() => {
    el.setAttribute('style', '');
  }, delay + transitionDuration);
}
</script>
