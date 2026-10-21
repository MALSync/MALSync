<template>
  <label
    class="password-field"
    :class="{ 'in-focus': inFocus, disabled }"
    @click="inputEl?.focus()"
  >
    <span v-if="placeholder && !inFocus && !modelValue" class="placeholder-text">
      {{ placeholder }}
    </span>
    <input
      ref="inputEl"
      :type="revealed ? 'text' : 'password'"
      :value="modelValue"
      :disabled="disabled"
      class="field-input"
      autocomplete="current-password"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="inFocus = true"
      @blur="inFocus = false"
    />
    <span
      v-if="modelValue || inFocus"
      class="toggle material-icons"
      :title="revealed ? 'Hide' : 'Show'"
      @mousedown.prevent="revealed = !revealed"
    >
      {{ revealed ? 'visibility_off' : 'visibility' }}
    </span>
  </label>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const inputEl = ref<HTMLInputElement | null>(null);
const inFocus = ref(false);
const revealed = ref(false);
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.password-field {
  .border-radius();
  .link();

  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  width: 100%;
  border: 2px solid var(--cl-backdrop);
  background-color: var(--cl-foreground);
  padding: 0 8px 0 10px;
  font-size: @normal-text;
  cursor: text;

  &:hover {
    border-color: var(--cl-border-hover);
  }

  &.in-focus {
    border-color: var(--cl-primary);
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.placeholder-text {
  color: var(--cl-light-text);
  white-space: nowrap;
  flex: 1;
  pointer-events: none;
}

.field-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  min-width: 0;
  padding: 0;

  // keep dots tight — standard password masking
  &[type='password'] {
    letter-spacing: 0.1em;
  }
}

.toggle {
  font-size: 16px;
  color: var(--cl-light-text);
  flex-shrink: 0;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: var(--cl-text);
  }
}
</style>
