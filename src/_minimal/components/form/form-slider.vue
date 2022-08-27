<template>
  <div class="slider-bar" :class="color">
    <vue-slider
      v-model="picked"
      :lazy="true"
      :data="options"
      :height="10"
      :dot-size="16"
      :hide-label="true"
      :min="min"
      :max="max"
      :interval="interval"
      :disabled="disabled"
      data-value="value"
      :data-label="options && options.length && options[0].title ? 'title' : 'label'"
    />
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, watch } from 'vue';

import VueSlider from 'vue-slider-component';

const props = defineProps({
  options: {
    type: Array as PropType<{ value: string; title?: string; label?: string }[]>,
    required: false,
    default: null,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  interval: {
    type: Number,
    default: 1,
  },
  modelValue: {
    type: [String, Number],
    require: true,
    default: '',
  },
  color: {
    type: String as PropType<'default' | 'blue' | 'violet'>,
    default: 'default',
  },
  disabled: {
    type: Boolean,
    default: false,
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
      background-color: var(--slider-body);
      filter: brightness(0.8);

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
  --slider-body: var(--cl-primary);
  .link();

  &:hover {
    .vue-slider-dot-handle {
      opacity: 1;
    }
  }

  .vue-slider-disabled {
    .vue-slider-dot-handle,
    .vue-slider-dot-tooltip {
      opacity: 0;
    }
  }

  &.blue {
    --slider-body: #56ccf2;
  }

  &.violet {
    --slider-body: #bb6bd9;
  }
}
</style>
