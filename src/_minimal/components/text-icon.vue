<template>
  <span class="text-icon">
    <span v-if="icon" class="material-icons">{{ icon }}</span>
    <img v-if="src" class="img-icons" :src="src" />
    <slot />
  </span>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

defineProps({
  icon: {
    type: String,
    default: '',
  },
  src: {
    type: String,
    default: '',
  },
});
</script>

<style lang="less" scoped>
.text-icon {
  .material-icons {
    font-size: 18px;
    vertical-align: sub;
    margin-right: 10px;
  }
  .img-icons {
    display: inline-block;
    vertical-align: sub;
    height: 18px;
    width: 18px;
    margin-right: 10px;
  }
}
</style>
