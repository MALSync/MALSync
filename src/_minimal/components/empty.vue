<template>
  <component :is="card ? Card : 'div'" class="empty-block" :class="{ cardMode: card }">
    <div class="material-icons icon">{{ icon }}</div>
    <div class="text">{{ text }}</div>
  </component>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import Card from './card.vue';

defineProps({
  text: {
    type: String,
    default: () => api.storage.lang('NothingFound'),
  },
  icon: {
    type: String as PropType<'set_meal' | 'search_off' | 'flood' | 'egg_alt'>,
    default: 'set_meal',
  },
  card: {
    type: Boolean,
    default: false,
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
.cardMode {
  color: var(--cl-text);
}
</style>
