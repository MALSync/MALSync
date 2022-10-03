<template>
  <div class="hr-wrapper">
    <div v-if="title" class="hr-header">{{ title }}</div>
    <HR padding="half" :direction="!title ? 'both' : 'bottom'" />
  </div>
</template>

<script lang="ts" setup>
import HR from '../hr.vue';

defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.hr-header {
  padding-top: @spacer;
  color: var(--cl-light-text);
}
</style>
