<template>
  <div id="header" :class="{ scrolled }">
    <div class="nav">
      <router-link
        class="link"
        :to="{
          name: 'Bookmarks',
          params: { type: getStateContext().value },
        }"
      >
        <span class="material-icons">bookmark</span>
      </router-link>

      <NavSearch class="flex-grow" />

      <router-link to="/settings" class="link">
        <span class="material-icons">settings</span>
      </router-link>
      <span class="material-icons">close</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { getStateContext } from '../../utils/state';
import NavSearch from './nav-search.vue';

const scrolled = ref(false);

function scrollEvent() {
  const scrollPos = document.documentElement.scrollTop;
  if (scrollPos > 30) {
    scrolled.value = true;
  } else {
    scrolled.value = false;
  }
}
scrollEvent();

onMounted(() => {
  window.addEventListener('scroll', scrollEvent);
});

onUnmounted(() => {
  window.removeEventListener('scroll', scrollEvent);
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
#header {
  .block-select();
  .border-radius();

  position: sticky;
  padding: 0 @spacer;
  top: -20px;
  margin-bottom: 20px;
  z-index: 10;
  transition: box-shadow 0.1s, background-color 0.1s;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: var(--cl-background);

  .nav {
    .flex-row();
    padding-top: @spacer;
    padding-bottom: 10px;
  }

  .link {
    .click-move-down();
  }

  .material-icons {
    font-size: 30px;
    height: 30px;
  }
}

.custom #header {
  background-color: transparent;
}

#header.scrolled {
  box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.15);
  background-color: var(--cl-background);
  backdrop-filter: blur(2px);
}

</style>
