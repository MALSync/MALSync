<template>
  <label class="color-picker-label" tabindex="0">
    <input v-model="picked" class="color-picker" type="color" />
  </label>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '#4c8ff2',
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
  border: 1px solid var(--cl-backdrop);

  &:hover {
    border-color: var(--cl-border-hover);
  }

  &:focus-visible {
    .focus-outline();
  }
}

.color-picker {
  visibility: hidden;
}
</style>
