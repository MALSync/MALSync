<template>
  <label class="color-picker-label" tabindex="0">
    <input v-model="picked" class="color-picker" type="color" />
  </label>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '#4c8ff2',
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

.color-picker-label {
  .border-radius();
  .link();

  display: inline-block;
  height: 32px;
  width: 60px;
  background-color: v-bind(picked);
  border: 2px solid var(--cl-backdrop);
  background-image: url(@endless-clouds);

  &:hover {
    border-color: var(--cl-border-hover);
  }

  &:focus-visible {
    .focus-outline();
  }

  &:focus-within {
    border-color: var(--cl-primary);
  }
}

.color-picker {
  visibility: hidden;
}
</style>
