<template>
  <div class="option">
    <div class="title">
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <div class="component" :class="`type-${component}`">
      <slot name="component">
        <component :is="components[component]" v-bind="props" v-model="model"><slot /></component>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref } from 'vue';
import FormButton from '../form/form-button.vue';
import FormCheckbox from '../form/form-checkbox.vue';
import FormColorPicker from '../form/form-color-picker.vue';
import FormSlider from '../form/form-slider.vue';
import FormDropdown from '../form/form-dropdown.vue';

const components = {
  button: FormButton,
  checkbox: FormCheckbox,
  colorPicker: FormColorPicker,
  slider: FormSlider,
  dropdown: FormDropdown,
};

defineProps({
  title: {
    type: String,
    required: true,
  },
  component: {
    type: String as PropType<keyof typeof components>,
    required: true,
  },
  props: {
    type: Object,
    default: () => ({}),
  },
});

const model = ref(null);
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.option {
  padding: @spacer-half 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @spacer;
}

.type-slider {
  flex-grow: 1;
  max-width: 150px;
}
</style>
