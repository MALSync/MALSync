<template>
  <router-link :to="path">
    <div class="overview-button">
      <Header>
        <TextIcon :icon="icon" mode="flex">{{ title }}</TextIcon>
      </Header>
    </div>
  </router-link>
</template>

<script lang="ts" setup>
import TextIcon from '../text-icon.vue';
import Header from '../header.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    require: true,
    default: '',
  },
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.overview-button {
  .click-move-down();

  padding: @spacer-half 0;
}
</style>
