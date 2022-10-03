<template>
  <Theming />
  <MediaModal />
  <NavBar />
  <div class="content">
    <router-view v-slot="{ Component, route }">
      <transition
        :name="route.meta.transition as string || 'fade'"
        :duration="route.meta.duration as number || 0"
      >
        <keep-alive max="5" :exclude="['overview']">
          <component
            :is="Component"
            v-bind="route.params"
            :key="route.meta.key ? route.path : undefined"
          />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, provide, ref } from 'vue';
import Theming from './components/theming.vue';
import NavBar from './components/nav/nav-bar.vue';
import MediaModal from './components/media/media-modal.vue';

const breakpoint = ref('desktop' as 'desktop' | 'mobile');

function setBreakpoint() {
  if (window.innerWidth < 900) {
    breakpoint.value = 'mobile';
  } else {
    breakpoint.value = 'desktop';
  }
}
setBreakpoint();

onMounted(() => {
  window.addEventListener('resize', setBreakpoint);
  nextTick(() => {
    if (
      ['popup', 'settings'].includes(document.documentElement.getAttribute('mode')!) &&
      window.innerWidth !== 550
    ) {
      document.documentElement.style.minWidth = `${window.innerWidth}px`;
      // document.documentElement.style.maxWidth = `${window.innerWidth}px`;
      document.documentElement.style.width = 'auto';
      document.body.style.width = 'auto';
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', setBreakpoint);
});

provide('breakpoint', breakpoint);
</script>

<style lang="less">
@import './less/_main.less';
</style>

<style lang="less" scoped>
@import './less/_globals.less';
.content {
  padding: 0 @spacer;
  overflow: auto;
  overflow-x: hidden;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

// temp

.transitionTest {
  width: 100px;
  height: 100px;
  background-color: red;
}
</style>
