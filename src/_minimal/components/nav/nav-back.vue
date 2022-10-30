<template>
  <span
    v-if="display"
    class="material-icons"
    :class="{ noAction: !hasPrevious }"
    @click="router.go(-1)"
    >arrow_back</span
  >
</template>

<script lang="ts" setup>
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';

const rootWindow = inject('rootWindow') as Window;

const router = useRouter();
const display = document.documentElement.getAttribute('mode') === 'popup';
const hasPrevious = ref(rootWindow.history.length > 1);

if (display) {
  router.afterEach(() => {
    hasPrevious.value = rootWindow.history.length > 1;
  });
}
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.material-icons {
  .link();
  .click-move-down();

  &.noAction {
    cursor: default;
    opacity: 0.5;
  }
}
</style>
