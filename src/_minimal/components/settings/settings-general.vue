<template>
  <div class="option">
    <div v-if="labelSection" class="title">
      <a v-if="path.length" class="anchor-link" :href="'#' + ['settings', ...path].join('/')">
        <div class="material-icons">link</div>
      </a>
      <slot name="title">
        {{ typeof title === 'function' ? (title as any)() : title }}
      </slot>
      <MediaLink v-if="infoLink" class="infoLink" :href="infoLink">
        <FormButton padding="mini" color="primary">{{ lang('settings_more_info') }}</FormButton>
      </MediaLink>
      <span v-if="tooltip" :data-text="tooltip" class="material-icons tooltip">help</span>
    </div>
    <div :class="`type-${component} ${labelSection ? 'component' : 'only-component'}`">
      <slot name="component">
        <component
          :is="components[component]"
          v-bind="props"
          v-model="model"
          @click="$emit('click')"
          ><slot
        /></component>
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import FormButton from '../form/form-button.vue';
import FormCheckbox from '../form/form-checkbox.vue';
import FormColorPicker from '../form/form-color-picker.vue';
import FormSlider from '../form/form-slider.vue';
import FormDropdown from '../form/form-dropdown.vue';
import FormText from '../form/form-text.vue';
import formSwitch from '../form/form-switch.vue';
import FormShortcut from '../form/form-shortcut.vue';
import MediaLink from '../media-link.vue';
import FormMultiSelect from '../form/form-multi-select.vue';

const components = {
  button: FormButton,
  checkbox: FormCheckbox,
  colorPicker: FormColorPicker,
  slider: FormSlider,
  dropdown: FormDropdown,
  input: FormText,
  switch: formSwitch,
  shortcut: FormShortcut,
  multiSelect: FormMultiSelect,
};

const emit = defineEmits(['change', 'click']);

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
  tooltip: {
    type: String,
    required: false,
    default: null,
  },
  labelSection: {
    type: Boolean,
    default: true,
  },
  path: {
    type: Array as PropType<string[]>,
    default: () => [],
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

.only-component {
  width: 100%;
}

.type-slider {
  flex-grow: 1;
  max-width: 150px;
}

.infoLink {
  margin-inline-start: 10px;
}

.tooltip {
  cursor: help;
  font-size: @normal-text;
  margin-inline-start: 5px;
  vertical-align: bottom;
  position: relative;

  &::before {
    .border-radius();
    .big-shadow();

    content: attr(data-text);
    font-family: Montserrat, sans-serif;
    font-size: @normal-text;
    white-space: normal;
    z-index: 10;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    inset-inline-start: 100%;
    margin-inline-start: 15px;
    width: 40vw;
    max-width: 500px;
    border-radius: 10px;
    text-align: center;
    background-color: var(--cl-foreground-solid);
    padding: 10px 5px;
    display: none;
  }

  &:hover::before {
    display: block;
  }
}

.anchor-link {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 100%;
  display: flex;
  align-items: center;
  padding-right: 2px;
  opacity: 0;

  &:hover {
    opacity: 1;
  }
}
</style>
