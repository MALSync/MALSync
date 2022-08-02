<template>
  <label ref="el" class="text-from" :class="{ noFocus: !inFocus }">
    <input
      v-model="picked"
      class="text-input"
      type="input"
      @focus="inFocus = true"
      @blur="inFocus = false"
    />
    <span v-show="!inFocus">{{ picked }}{{ picked ? suffix : '' }}</span>
  </label>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  suffix: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const picked = ref(props.modelValue);
watch(picked, value => {
  emit('update:modelValue', value);
});

watch(
  () => props.modelValue,
  value => {
    picked.value = value;
  },
);

const el = ref(null as HTMLElement | null);
const inFocus = ref(false);
const minWidth = ref(100);
watch(inFocus, value => {
  if (value && el.value) {
    minWidth.value = el.value.offsetWidth;
  } else {
    minWidth.value = 100;
  }
});
const width = computed(() => {
  return `${minWidth.value}px`;
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.text-from {
  .border-radius();
  .link();

  display: inline-flex;
  position: relative;
  align-items: center;
  height: 32px;
  min-width: v-bind(width);
  max-width: 100%;
  border: 2px solid var(--cl-backdrop);
  padding: 0 10px;
  font-size: 16px;
  overflow: hidden;

  &:hover {
    border-color: var(--cl-border-hover);
  }

  &:focus-visible {
    .focus-outline();
  }

  &:focus-within {
    border-color: var(--cl-primary);
  }

  .text-input {
    text-decoration: none;
    border: none;
    background-color: transparent;
    color: inherit;
    font-size: inherit;
    padding: 0;
    max-width: 100%;
    width: 100%;

    &:focus {
      outline: none;
    }
  }

  &.noFocus {
    .text-input {
      position: absolute;
      height: 0;
      width: 0;
    }
  }
}
</style>
