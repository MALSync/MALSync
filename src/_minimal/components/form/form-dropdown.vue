<template>
  <button
    ref="triggerNode"
    class="dropdown"
    :class="`${size}`"
    :aria-current="picked"
    @blur="open = false"
  >
    <div class="selector" @click="open = !open">
      <slot name="select" :open="open" :current-title="currentTitle" :value="picked">
        <FormButton :tabindex="-1" :animation="false">
          <TextIcon :icon="open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" position="after">
            {{ currentTitle }}
          </TextIcon>
        </FormButton>
      </slot>
    </div>
    <div v-show="open" ref="popperNode" class="dropdown-pop">
      <div class="dropdown-pop-default" :style="`text-align: ${alignItems}`">
        <div
          v-for="option in options"
          :key="option.value"
          class="dropdown-pop-default-element"
          :class="{ active: option.value === picked }"
          @click="select(option)"
        >
          <slot name="option" :option="option">
            {{ option.title }}
          </slot>
        </div>
      </div>
    </div>
  </button>
</template>

<script lang="ts" setup>
import { computed, PropType, ref, watch } from 'vue';
import FormButton from './form-button.vue';
import TextIcon from '../text-icon.vue';
import { usePopper } from '../../composables/popper';

interface Option {
  value: string | number;
  title: string;
}

const props = defineProps({
  options: {
    type: Array as PropType<Option[]>,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    require: true,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  position: {
    type: String as PropType<
      | 'auto'
      | 'auto-start'
      | 'auto-end'
      | 'top'
      | 'top-start'
      | 'top-end'
      | 'bottom'
      | 'bottom-start'
      | 'bottom-end'
      | 'right'
      | 'right-start'
      | 'right-end'
      | 'left'
      | 'left-start'
      | 'left-end'
    >,
    default: 'bottom',
  },
  alignItems: {
    type: String as PropType<'left' | 'right' | 'center'>,
    default: 'center',
  },
  direction: {
    type: String as PropType<'column' | 'row'>,
    default: 'column',
  },
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium',
  },
});

const emit = defineEmits(['update:modelValue', 'close:popper', 'open:popper']);

const picked = ref(props.modelValue);
const open = ref(false);
const select = (option: Option) => {
  picked.value = option.value;
  open.value = false;
};
const currentTitle = computed(() => {
  const active = props.options.find(el => el.value === picked.value);
  if (!active) return props.placeholder;
  return active.title;
});

watch(picked, value => {
  emit('update:modelValue', value);
});
watch(
  () => props.modelValue,
  value => {
    picked.value = value;
  },
);

const popperNode = ref(null);
const triggerNode = ref(null);
const placement = ref(props.position);

const popper = usePopper({
  emit,
  placement,
  popperNode,
  triggerNode,
});

watch(open, value => {
  if (value) {
    popper.open();
  } else {
    popper.close();
  }
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.dropdown {
  .block-select();

  position: relative;
  display: inline-block;

  .selector {
    .click-move-down();
    .link();
  }

  .dropdown-pop {
    .border-radius();

    position: absolute;
    z-index: 9999;
    background-color: var(--cl-foreground-solid);
    padding: 15px 10px;
    box-shadow: 0 5px 20px rgb(0 0 0 / 15%);
    white-space: nowrap;
    &-default {
      .link();

      display: flex;
      flex-direction: v-bind(direction);
      gap: 5px;
      &-element {
        .border-radius();

        border: 2px solid transparent;
        padding: 5px 15px;
        &.active {
          background-color: var(--cl-foreground-active);
        }
        &:hover {
          border-color: var(--cl-border-hover);
        }
      }
    }
  }

  &.small .dropdown-pop {
    padding: 5px;
    &-default {
      gap: 0;
      &-element {
        padding: 0 5px;
      }
    }
  }
}
</style>
