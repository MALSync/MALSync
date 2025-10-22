<template>
  <div class="radio-slider">
    <template v-for="(option, index) in options" :key="option.value">
      <input
        :id="`radio-${id}-${index}`"
        v-model="picked"
        class="input"
        type="radio"
        :name="`radio-slide-${id}`"
        :value="option.value"
        :checked="modelValue === option.value"
      />
      <label
        class="label"
        :for="`radio-${id}-${index}`"
        tabindex="0"
        @keyup.enter="picked = option.value"
      >
        {{ option.title }}
      </label>
    </template>
    <div class="select-pill" />
  </div>
</template>

<script lang="ts" setup>
import { PropType, computed } from 'vue';

interface Option {
  value: string;
  title: string;
}

const props = defineProps({
  options: {
    type: Array as PropType<Option[]>,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
    default: '',
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

const id = Math.floor(Math.random() * 10000);
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.radio-slider {
  .block-select();
  .border-pill();

  border: 2px solid var(--cl-backdrop);
  background-color: var(--cl-foreground);
  display: inline-flex;
  align-items: stretch;
  padding: 0;

  .label {
    .border-pill();
    .link();

    display: inline-flex;
    align-items: center;
    padding: 5px 10px;
    margin: -2px;
    transition:
      background-color @fast-transition,
      color @fast-transition;
  }

  :checked + label {
    .border-pill();

    background-color: var(--cl-primary);
    color: var(--cl-primary-contrast);
  }

  &:focus-visible {
    .focus-outline();
  }

  .input {
    display: none;
  }
}
</style>
