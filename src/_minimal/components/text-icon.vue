<template>
  <span class="text-icon">
    <span v-if="icon && position === 'before'" class="material-icons before">{{ icon }}</span>
    <img v-if="src && position === 'before'" class="img-icons before" :src="src" />
    <slot />
    <span v-if="icon && position === 'after'" class="material-icons after">{{ icon }}</span>
    <img v-if="src && position === 'after'" class="img-icons after" :src="src" />
  </span>
</template>

<script lang="ts" setup>
import { defineProps, PropType } from 'vue';

defineProps({
  icon: {
    type: String,
    default: '',
  },
  src: {
    type: String,
    default: '',
  },
  position: {
    type: String as PropType<'before' | 'after'>,
    default: 'before',
  },
  color: {
    type: String,
    default: 'inherit',
  },
});
</script>

<style lang="less" scoped>
.text-icon {
  .before {
    margin-right: 10px;
  }
  .after {
    margin-left: 10px;
  }
  .material-icons {
    font-size: 18px;
    vertical-align: sub;
    color: v-bind(color);
  }
  .img-icons {
    display: inline-block;
    vertical-align: sub;
    height: 18px;
    width: 18px;
  }
}
</style>
