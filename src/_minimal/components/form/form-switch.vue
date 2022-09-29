<template>
  <div class="radio-slider">
    <template v-for="(option, index) in options" :key="option.value">
      <input
        :id="`radio-${id}-${index}`"
        v-model="picked"
        class="input"
        type="radio"
        name="radio-slide"
        :value="option.value"
      />
      <label class="label" :for="`radio-${id}-${index}`">{{ option.title }}</label>
    </template>
    <div class="select-pill" />
  </div>
</template>

<script lang="ts" setup>
import { PropType, watch, ref } from 'vue';

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
    require: true,
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

    display: inline-block;
    padding: 5px 10px;
    margin: -2px;
    transition: background-color @fast-transition, color @fast-transition;
  }

  :checked + label {
    .border-pill();

    background-color: var(--cl-primary);
    color: white;
  }

  .input {
    display: none;
  }
}
</style>
