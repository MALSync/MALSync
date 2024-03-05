<template>
  <label
    ref="el"
    class="text-from"
    :class="{
      auto: fakeFocus,
      noFocus: !inFocus,
      search: type === 'search',
      mini: type === 'mini',
      invalid: !valid,
      disabled,
    }"
    @click="fakeFocus = false"
  >
    <span v-if="icon" class="material-icons">{{ icon }}</span>
    <span
      v-if="placeholder && !inFocus && (!simplePlaceholder || !picked)"
      class="placeholder-text"
    >
      {{ placeholder }}{{ picked ? ':' : '' }}
    </span>
    <input
      ref="inputField"
      v-model="picked"
      class="text-input"
      type="input"
      @focus="inFocus = true"
      @blur="inFocus = false"
    />
    <span v-show="!inFocus && picked" class="span-placeholder">
      <slot name="placeholder" :picked="picked" :suffix="suffix">
        {{ picked }}{{ picked ? suffix : '' }}
      </slot>
    </span>
    <span v-if="clearIcon && picked" class="material-icons" @click="picked = ''">close</span>
  </label>
</template>

<script lang="ts" setup>
import { ref, watch, computed, PropType, onMounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  suffix: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  simplePlaceholder: {
    type: Boolean,
    default: false,
  },
  clearIcon: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<'' | 'search' | 'mini'>,
    default: '',
  },
  validation: {
    type: Function as PropType<(value: string) => boolean>,
    default: () => true,
  },
  strictValidation: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
});

const fakeFocus = ref(false);
const inputField = ref(null as HTMLInputElement | null);
if (props.autofocus) {
  fakeFocus.value = true;
  onMounted(() => {
    if (inputField.value) inputField.value.focus();
  });
}

const emit = defineEmits(['update:modelValue']);

const picked = ref(props.modelValue.toString());
watch(picked, value => {
  fakeFocus.value = false;
  if (props.validation && !props.validation(value)) {
    if (props.strictValidation) picked.value = props.modelValue.toString();
    return;
  }
  emit('update:modelValue', value);
});

watch(
  () => props.modelValue,
  value => {
    picked.value = value.toString();
  },
);

const el = ref(null as HTMLElement | null);
const inFocus = ref(false);
const minWidth = ref(100);
watch(inFocus, value => {
  if (value && el.value) {
    minWidth.value = el.value.offsetWidth;
  } else {
    fakeFocus.value = false;
    minWidth.value = 100;
  }
});
const width = computed(() => {
  if (props.type === 'mini') return '0';
  return `${minWidth.value}px`;
});

const textwidth = computed(() => {
  return `${(picked.value + props.suffix).trim().length + 1}ch`;
});

const valid = computed(() => {
  if (!picked.value) return true;
  return props.validation(picked.value);
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.text-from {
  .border-radius();
  .link();

  display: inline-flex;
  gap: 10px;
  position: relative;
  align-items: center;
  min-height: 32px;
  min-width: v-bind(width);
  max-width: 100%;
  border: 2px solid var(--cl-backdrop);
  background-color: var(--cl-foreground);
  padding: 0 10px;
  font-size: @normal-text;
  overflow: hidden;

  &:hover {
    border-color: var(--cl-border-hover);
  }

  &:not(.auto):focus-visible {
    .focus-outline();
  }

  &:not(.auto):focus-within {
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

  .span-placeholder {
    flex-grow: 1;
  }

  .placeholder-text {
    color: var(--cl-light-text);
    white-space: nowrap;
  }

  &.auto .text-input {
    caret-color: transparent;
  }

  &.noFocus {
    .text-input {
      position: absolute;
      height: 0;
      width: 0;
    }
  }

  &.search {
    padding: 10px;
    height: auto;
    border-radius: 30px;
    .__breakpoint-popup__({
      height: 32px;
    });
  }

  &.mini {
    .border-radius-small();

    padding: 2px 5px;
    min-height: auto;
    .text-input {
      width: 70px;
    }

    &.noFocus {
      min-width: v-bind(textwidth);
      text-align: center;
    }
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  &.invalid {
    border-color: red;
  }
}
</style>
