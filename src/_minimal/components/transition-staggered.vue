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

let animation = true;

try {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  animation = !mediaQuery.matches;
} catch (e) {
  con.error(e);
}

const transitionDuration = 150;

let index = 0;
let debounce;

function beforeEnter(el) {
  if (!animation) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  nextTick().then(() => {
    el.style.transitionProperty = 'opacity, transform';
    el.style.transitionDuration = `${transitionDuration}ms`;
  });
}

function enter(el) {
  if (!animation) return;
  setTimeout(() => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      index = 0;
    }, 100);
    const i = index++;
    const delay = i * props.delayDuration;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    el.style.transitionDelay = `${delay}ms`;
    setTimeout(() => {
      el.setAttribute('style', '');
    }, delay + transitionDuration);
  }, 0);
}
</script>
