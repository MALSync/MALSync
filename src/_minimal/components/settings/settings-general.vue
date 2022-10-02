<template>
  <div class="option">
    <div class="title">
      <slot name="title">
        {{ typeof title === 'function' ? (title as any)() : title }}
      </slot>
      <MediaLink v-if="infoLink" class="infoLink" :href="infoLink">
        <FormButton padding="mini" color="primary">Info</FormButton>
      </MediaLink>
    </div>
    <div class="component" :class="`type-${component}`">
      <slot name="component">
        <component :is="components[component]" v-bind="props" v-model="model"><slot /></component>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import FormButton from '../form/form-button.vue';
import FormCheckbox from '../form/form-checkbox.vue';
import FormColorPicker from '../form/form-color-picker.vue';
import FormSlider from '../form/form-slider.vue';
import FormDropdown from '../form/form-dropdown.vue';
import FormText from '../form/form-text.vue';
import formSwitch from '../form/form-switch.vue';
import FormShortcut from '../form/form-shortcut.vue';
import MediaLink from '../media-link.vue';

const components = {
  button: FormButton,
  checkbox: FormCheckbox,
  colorPicker: FormColorPicker,
  slider: FormSlider,
  dropdown: FormDropdown,
  input: FormText,
  switch: formSwitch,
  shortcut: FormShortcut,
};

const emit = defineEmits(['change']);

const properties = defineProps({
  title: {
    type: [String, Function],
    required: true,
  },
  component: {
    type: String,
    required: true,
  },
  props: {
    type: Object,
    default: () => ({}),
  },
  option: {
    type: String,
    required: false,
    default: null,
  },
  infoLink: {
    type: String,
    required: false,
    default: null,
  },
});

let model;
if (properties.option) {
  model = computed({
    get() {
      return api.settings.get(properties.option);
    },
    set(value) {
      if (properties.component === 'colorPicker') {
        api.settings.setDebounce(properties.option, value);
      } else {
        api.settings.set(properties.option, value);
      }
      emit('change', value);
    },
  });
} else {
  model = ref(null);
}
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

.component {
  max-width: 50%;
  overflow: show;
}

.type-slider {
  flex-grow: 1;
  max-width: 150px;
}

.infoLink {
  margin-left: 10px;
}
</style>
