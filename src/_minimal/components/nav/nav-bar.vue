<template>
  <div id="header" :class="{ scrolled }">
    <div class="nav">
      <NavBack />
      <Link
        class="link"
        :to="{
          name: 'Bookmarks',
          params: { type: getTypeContext().value, state: getStateContext().value },
        }"
        @click="route.name === 'Bookmarks' ? router.go(-1) : null"
      >
        <span class="material-icons">
          {{ route.name === 'Bookmarks' ? 'bookmarks' : 'bookmark' }}
        </span>
      </Link>

      <NavSearch class="flex-grow" />

      <Link to="/settings" class="link">
        <span class="material-icons">settings</span>
      </Link>
      <span v-if="fullscreenFunction" class="material-icons link" @click="fullscreenFunction()"
        >fullscreen</span
      >
      <span class="material-icons link close-fix" @click="closeWindow()">close</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getStateContext, getTypeContext } from '../../utils/state';
import NavSearch from './nav-search.vue';
import NavBack from './nav-back.vue';
import Link from '../link.vue';

const scrolled = ref(false);

const rootBody = inject('rootBody') as HTMLElement;
const rootHtml = inject('rootHtml') as HTMLElement;
const rootWindow = inject('rootWindow') as Window;
const closeFunction = inject('closeFunction') as () => void;
const fullscreenFunction = inject('fullscreenFunction') as () => void;

const route = useRoute();
const router = useRouter();

function scrollEvent() {
  const scrollPos = rootHtml.scrollTop || rootBody.scrollTop;
  if (scrollPos > 30) {
    scrolled.value = true;
  } else {
    scrolled.value = false;
  }
}
scrollEvent();

onMounted(() => {
  rootWindow.addEventListener('scroll', scrollEvent);
});

onUnmounted(() => {
  rootWindow.removeEventListener('scroll', scrollEvent);
});

const closeWindow = () => {
  closeFunction();
};
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
#header {
  .block-select();
  .border-radius();

  position: sticky;
  padding: 0 @spacer;
  top: -20px;
  z-index: 10;
  transition:
    box-shadow 0.1s,
    background-color 0.1s;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: var(--cl-background);

  .nav {
    .flex-row();

    padding-top: 30px;
    padding-bottom: 10px;
  }

  .link {
    .click-move-down();
    .link();

    display: flex;
    align-items: center;
  }

  .material-icons {
    font-size: 30px;
    height: 30px;
    width: 30px;

    &.close-fix {
      font-size: 38px;
      position: relative;
      inset-inline-start: -4px;
    }
  }

  .__breakpoint-popup__({
    top: -10px;
    margin-bottom: @spacer-half;
    .nav {
      padding-top: 20px;
    }
  });
}

.custom.backImage #header {
  background-color: transparent;
}

#header.scrolled {
  .big-shadow();
}

.backImage #header.scrolled {
  background-color: var(--cl-background);
  backdrop-filter: blur(15px);
}
</style>
