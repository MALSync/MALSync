<template>
  <label class="checkbox" @keydown.enter="$el.click()">
    <input v-model="picked" class="checkbox-input" type="checkbox" />
    <span class="slider"></span>
  </label>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const picked = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.checkbox {
  .block-select();

  position: relative;
  display: inline-block;
  width: 60px;
  height: 32px;

  .slider {
    .fullSize();
    .link();
    .border-pill();

    background-color: var(--cl-backdrop);
    transition: background-color @normal-transition;
    &::before {
      position: absolute;
      content: '';
      border-radius: 50%;
      height: 24px;
      width: 24px;
      left: 4px;
      bottom: 4px;
      background-color: var(--cl-primary-contrast);
      transition: transform @normal-transition;
    }
  }

  .checkbox-input {
    opacity: 0;
    width: 0;
    height: 0;
    &:checked + .slider {
      background-color: var(--cl-primary);
    }

    &:focus-visible + .slider {
      .focus-outline();
    }

    &:checked + .slider::before {
      transform: translateX(28px);
    }
  }
}
</style>
