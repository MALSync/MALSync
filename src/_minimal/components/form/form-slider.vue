<template>
  <div class="slider-bar" :class="color">
    <vue-slider
      v-model="picked"
      :lazy="true"
      :data="options"
      :height="10"
      :dot-size="16"
      :hide-label="true"
      data-value="value"
      data-label="title"
    />
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';

import VueSlider from 'vue-slider-component';

const props = defineProps({
  options: {
    type: Array as PropType<{ value: string; title: string }[]>,
    required: true,
  },
  modelValue: {
    type: String,
    require: true,
    default: '',
  },
  color: {
    type: String as PropType<'blue' | 'violet'>,
    default: 'blue',
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
</script>

<style lang="less">
@import '../../less/modules/vue-slider-component.less';
@import '../../less/_globals.less';

.vue-slider {
  .vue-slider-rail {
    background-color: var(--cl-backdrop);

    .vue-slider-process {
      background-color: var(--slider-body);
    }
  }

  .vue-slider-mark-step {
    display: none;
  }

  .vue-slider-dot {
    transition: opacity @fast-transition;

    .vue-slider-dot-handle {
      opacity: 0;
      box-shadow: none;
      background-color: var(--slider-dot);

      &.vue-slider-dot-handle-focus {
        opacity: 1;
      }
    }
  }

  .vue-slider-dot-tooltip {
    .vue-slider-dot-tooltip-inner {
      background-color: var(--slider-body);
      border-color: var(--slider-body);
    }
  }
}

.slider-bar {
  .link();

  &:hover {
    .vue-slider-dot-handle {
      opacity: 1;
    }
  }
  --slider-body: #56ccf2;
  --slider-dot: #92e2fc;

  &.violet {
    --slider-body: #bb6bd9;
    --slider-dot: #cd9bdf;
  }
}
</style>
