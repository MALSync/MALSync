<template>
  <div class="multi-select">
    <FormButton
      v-for="option in options"
      :key="option.value"
      padding="large"
      class="multi-select-button"
      :color="compareFunc(option.value, picked) && !ignore ? 'secondary' : 'default'"
      :class="{ active: compareFunc(option.value, picked) }"
      @click="select(option)"
    >
      <TextIcon :icon="compareFunc(option.value, picked) && !ignore ? 'done' : 'arrow_right'">
        {{ option.title || option.label }}
      </TextIcon>
    </FormButton>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';
import FormButton from './form-button.vue';
import TextIcon from '../text-icon.vue';

interface Option {
  value: string | number;
  title?: string;
  label?: string;
  meta?: any;
}

const props = defineProps({
  options: {
    type: Array as PropType<Option[]>,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    require: true,
    default: '',
  },
  compareFunc: {
    type: Function as PropType<(el: string | number, picked: string | number) => boolean>,
    default: (el: string | number, picked: string | number) => el.toString() === picked.toString(),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  ignoreSelect: {
    type: Boolean,
    default: false,
  },
});

const ignore = ref(props.ignoreSelect);

const emit = defineEmits(['update:modelValue']);

const picked = ref(props.modelValue);
const open = ref(false);
const select = (option: Option) => {
  picked.value = option.value;
  open.value = false;
  ignore.value = false;
};

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

.multi-select {
  display: flex;
  flex-direction: column;
  gap: @spacer-half;
}
</style>
