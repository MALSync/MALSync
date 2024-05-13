<template>
  <component :is="card ? Card : 'div'" class="accordion">
    <div class="accordion-header" @click="isOpen = !isOpen">
      <div class="accordion-header-content"><slot name="header" /></div>
      <TextIcon :icon="isOpen ? 'expand_less' : 'expand_more'" position="after" />
    </div>
    <div v-show="isOpen" class="accordion-content">
      <Hr direction="both" padding="half" />
      <slot name="content" />
    </div>
  </component>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Hr from './hr.vue';
import Card from './card.vue';
import TextIcon from './text-icon.vue';

defineProps({
  card: {
    type: Boolean,
    default: true,
  },
});

const isOpen = ref(false);
</script>

<style lang="less" scoped>
@import '../less/_globals.less';

.accordion {
  .accordion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    .accordion-header-content {
      flex: 1;
    }
  }
}
</style>
