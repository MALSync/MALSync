<template>
  <component :is="Teleport" :to="rootHtml">
    <transition name="fade-shrink-in" appear>
      <div v-if="state" class="modal" @click="state = false">
        <div class="content" @click.stop>
          <slot></slot>
        </div>
      </div>
    </transition>
  </component>
</template>

<script lang="ts" setup>
import {
  Teleport as teleport_,
  type TeleportProps,
  type VNodeProps,
  ref,
  watch,
  inject,
} from 'vue';

const rootHtml = inject('rootHtml') as HTMLElement;

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

// https://github.com/vuejs/core/issues/2855
const Teleport = teleport_ as {
  new (): {
    $props: VNodeProps & TeleportProps;
  };
};
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
