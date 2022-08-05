<template>
  <div class="pill">
    <div v-if="slots.left" class="left"><slot name="left" /></div>
    <div v-if="slots.right" class="right"><slot name="right" /></div>
  </div>
</template>

<script lang="ts" setup>
import { useSlots } from 'vue';

const slots = useSlots();
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.pill {
  .border-pill();
  .block-select();

  display: inline-flex;
  overflow: hidden;
  background-color: #00000021;
  backdrop-filter: blur(5px);

  & > .right,
  & > .left {
    padding: 5px 10px;
  }
  & > .left {
    .border-pill();

    color: white;
    background-color: var(--cl-primary-dark);
  }
  & > .right {
    color: white;
  }
}
</style>
