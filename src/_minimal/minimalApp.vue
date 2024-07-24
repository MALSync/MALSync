<template>
  <Theming />
  <MediaModal />
  <SettingsPermissionOverviewSmall v-if="isExtension()" />
  <NavBar v-if="rootHtml.getAttribute('mode') !== 'install'" />
  <div class="content">
    <router-view v-slot="{ Component, route }">
      <transition
        :name="(route.meta.transition as string) || 'fade'"
        :duration="(route.meta.duration as number) || 0"
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
import { inject, nextTick, onMounted, onUnmounted, provide, ref } from 'vue';
import Theming from './components/theming.vue';
import NavBar from './components/nav/nav-bar.vue';
import MediaModal from './components/media/media-modal.vue';
import SettingsPermissionOverviewSmall from './components/settings/settings-permission-overview-small.vue';

const breakpoint = ref('desktop' as 'desktop' | 'mobile');

const rootWindow = inject('rootWindow') as Window;
const rootHtml = inject('rootHtml') as HTMLElement;
const rootBody = inject('rootBody') as HTMLElement;

function setBreakpoint() {
  if (rootWindow.innerWidth < 900) {
    breakpoint.value = 'mobile';
  } else {
    breakpoint.value = 'desktop';
  }
}
setBreakpoint();

function isExtension() {
  return api.type === 'webextension';
}

onMounted(() => {
  rootWindow.addEventListener('resize', setBreakpoint);
  nextTick(() => {
    if (
      ['popup', 'settings'].includes(rootHtml.getAttribute('mode')!) &&
      rootWindow.innerWidth !== 550
    ) {
      rootHtml.style.minWidth = `${rootWindow.innerWidth}px`;
      // rootHtml.style.maxWidth = `${rootWindow.innerWidth}px`;
      rootHtml.style.width = 'auto';
      rootBody.style.width = 'auto';
    }
  });
});

onUnmounted(() => {
  rootWindow.removeEventListener('resize', setBreakpoint);
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
  padding-top: @spacer;
}
</style>
