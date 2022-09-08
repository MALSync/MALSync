<template>
  <div class="empty-block">
    <div class="material-icons icon">{{ icon }}</div>
    <div class="text">{{ text }}</div>
  </div >
</template>

<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
  text: {
    type: String,
    default: api.storage.lang('NothingFound'),
  },
  icon: {
    type: String as PropType<'set_meal' | 'search_off' | 'flood'>,
    default: 'set_meal',
  },
});
</script>

<style lang="less" scoped>
@import './../less/_globals.less';

.empty-block {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  color: var(--cl-light-text);
}
.icon {
  font-size: 150px;
  margin-bottom: @spacer-half;
}

.text {
  .header-normal();
}
</style>
