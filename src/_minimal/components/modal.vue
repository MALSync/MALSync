<template>
  <teleport to="html">
    <transition name="fade-shrink-in" appear>
      <div v-if="state" class="modal" @click="state = false">
        <div class="content" @click.stop>
          <slot></slot>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const state = ref(props.modelValue);
watch(state, value => {
  emit('update:modelValue', value);
});

watch(
  () => props.modelValue,
  value => {
    state.value = value;
  },
);
</script>

<style lang="less" scoped>
.modal {
  z-index: 20;
  background-color: rgb(0 0 0 / 45.9%);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .content {
    display: inline-block;
    background-color: var(--cl-white);
    max-width: min(95%, 800px);
    max-height: 90%;
    overflow: auto;
  }
}
</style>
