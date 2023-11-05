<template>
  <label
    ref="el"
    class="text-from"
    :class="{
      noFocus: !inFocus,
      tempRec: temporaryRecording,
      rec: recording,
    }"
  >
    <span v-if="!inFocus" class="placeholder-text">
      {{ display }}
    </span>
    <input
      v-model="display"
      class="text-input"
      type="input"
      @keydown.prevent="keyDown($event)"
      @keyup="keyUp($event)"
      @focus="inFocus = true"
      @blur="
        inFocus = false;
        focusLost();
      "
    />
    <span v-if="picked.length" class="material-icons" @click="picked = []">close</span>
  </label>
</template>

<script lang="ts" setup>
import { ref, PropType, computed, toRaw } from 'vue';
import { keyboardMap } from './keyboardMap';

const props = defineProps({
  modelValue: {
    type: Array as PropType<number[] | string[]>,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);
const inFocus = ref(false);

const picked = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', toRaw(value));
  },
});

const el = ref(null as HTMLElement | null);

const tempKeys = ref({});
const keys = ref({});
let tempKeysTimeout;

function setTempState(state) {
  if (!Object.keys(tempKeys.value).length) {
    const tempState = { ...state };
    tempKeys.value = tempState;
    clearTimeout(tempKeysTimeout);
    tempKeysTimeout = setTimeout(() => {
      if (!Object.keys(keys.value).length) {
        picked.value = Object.keys(tempState);
      }
      tempKeys.value = {};
    }, 500);
  }
}
function keyDown(event) {
  if (!keys.value[event.keyCode]) con.log(`down${event.keyCode}`);
  keys.value[event.keyCode] = keyboardMap[event.keyCode];
  tempKeys.value = {};
}
function keyUp(event) {
  con.log(`up${event.keyCode}`);
  setTempState(keys.value);
  delete keys.value[event.keyCode];
}
function focusLost() {
  keys.value = {};
}

const recording = computed(() => Object.keys(keys.value).length);
const temporaryRecording = computed(() => Object.keys(tempKeys.value).length);

const display = computed(() => {
  let objKeys = picked.value;
  if (temporaryRecording.value) {
    objKeys = Object.keys(tempKeys.value);
  } else if (recording.value) {
    objKeys = Object.keys(keys.value);
  } else if (!objKeys || !objKeys.length) {
    return inFocus.value ? '' : api.storage.lang('settings_Shortcuts_Click');
  }
  return objKeys.map(val => keyboardMap[val]).join(' + ');
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
  min-width: 50px;
  max-width: 100%;
  border: 2px solid var(--cl-backdrop);
  background-color: var(--cl-foreground);
  padding: 0 10px;
  font-size: @normal-text;
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

  &.rec {
    border-color: red;
  }

  &.tempRec {
    border-color: orange;
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

  &.noFocus {
    .text-input {
      position: absolute;
      height: 0;
      width: 0;
    }
  }
}
</style>
