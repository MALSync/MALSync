<template>
  <label
    ref="el"
    class="text-from"
    :class="{ noFocus: !inFocus, search: type === 'search', mini: type === 'mini' }"
  >
    <span v-if="icon" class="material-icons">{{ icon }}</span>
    <span v-if="placeholder && !inFocus" class="placeholder-text">
      {{ placeholder }}{{ picked ? ':' : '' }}
    </span>
    <input
      v-model="picked"
      class="text-input"
      type="input"
      @focus="inFocus = true"
      @blur="inFocus = false"
    />
    <span v-show="!inFocus" class="span-placeholder">{{ picked }}{{ picked ? suffix : '' }}</span>
    <span v-if="clearIcon && picked" class="material-icons" @click="picked = ''">close</span>
  </label>
</template>

<script lang="ts" setup>
import { ref, watch, computed, PropType } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
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
  clearIcon: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String as PropType<'' | 'search' | 'mini'>,
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
  if (props.type === 'mini') return '0';
  return `${minWidth.value}px`;
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
  height: 32px;
  min-width: v-bind(width);
  max-width: 100%;
  border: 2px solid var(--cl-backdrop);
  background-color: var(--cl-foreground);
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

  .span-placeholder {
    flex-grow: 1;
  }

  .placeholder-text {
    color: var(--cl-light-text);
    white-space: nowrap;
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
  }

  &.mini {
    .border-radius-small();

    padding: 2px 5px;
    height: auto;
    .text-input {
      width: 70px;
    }
  }
}
</style>
