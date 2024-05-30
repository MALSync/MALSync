<template>
  <button
    ref="triggerNode"
    tabindex="-1"
    class="dropdown"
    :class="`${size} ${disabled ? 'disabled' : ''}`"
    @blur="blur()"
    @keydown="keyDown($event)"
  >
    <div
      tabindex="0"
      class="selector"
      :class="{ animate }"
      @mousedown.prevent
      @click="
        open = !open;
        $el.focus();
      "
      @keypress:enter="
        open = !open;
        $el.focus();
      "
    >
      <slot
        name="select"
        :open="open"
        :current-title="currentTitle"
        :value="picked"
        :meta="currentMeta"
      >
        <FormButton :tabindex="-1" :animation="false" class="form-button">
          <TextIcon
            :icon="open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            position="after"
            mode="space-between"
            class="icon-text"
          >
            {{ currentTitle }}
          </TextIcon>
        </FormButton>
      </slot>
    </div>
    <div v-show="open" ref="popperNode" class="dropdown-pop">
      <OverlayScrollbarsComponent
        class="dropdown-pop-scroll"
        :options="{ scrollbars: { theme: 'os-theme-custom' } }"
        defer
      >
        <div class="dropdown-pop-default" :style="`text-align: ${alignItems}`">
          <template v-for="option in options" :key="option.value">
            <Hr
              v-if="option.title === '-_-_-' || option.label === '-_-_-'"
              direction="both"
              padding="half"
            />
            <div
              v-else
              class="dropdown-pop-default-element"
              :class="{
                active: compareFunc(option.value, picked),
                focus: activeKey === option.value,
              }"
              @click="select(option)"
              @mouseover="activeKey = option.value"
            >
              <slot name="option" :option="option">
                {{ option.title || option.label }}
              </slot>
            </div>
          </template>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  </button>
</template>

<script lang="ts" setup>
import { computed, PropType, ref, watch, nextTick } from 'vue';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue';
import FormButton from './form-button.vue';
import TextIcon from '../text-icon.vue';
import Hr from '../hr.vue';
import { usePopper } from '../../composables/popper';

interface Option {
  value: string | number;
  title?: string;
  label?: string;
  meta?: any;
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
    default: 'auto',
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
  animate: {
    type: Boolean,
    default: true,
  },
  compareFunc: {
    type: Function as PropType<(el: string | number, picked: string | number) => boolean>,
    default: (el: string | number, picked: string | number) => el.toString() === picked.toString(),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'close:popper', 'open:popper']);

const picked = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const open = ref(false);
const select = (option: Option) => {
  picked.value = option.value;
  open.value = false;
};
const currentTitle = computed(() => {
  const active = props.options.find(el => props.compareFunc(el.value, picked.value));
  if (!active) return props.placeholder;
  return active.title || active.label;
});
const currentMeta = computed(() => {
  const active = props.options.find(el => props.compareFunc(el.value, picked.value));
  if (!active) return {};
  return active.meta;
});

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

const activeKey = ref('_-_' as string | number);

function getActiveKeyIndex() {
  return props.options.findIndex(el => props.compareFunc(el.value, activeKey.value));
}

function scrollFocusIntoView() {
  nextTick(() => {
    if (popperNode.value) {
      const el = $(popperNode.value as HTMLElement)
        .find('.focus')
        .first()
        .get(0);

      if (el) {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  });
}

function keyDown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowUp': {
      const activeIndex = getActiveKeyIndex();
      if (activeIndex > 0) {
        activeKey.value = props.options[activeIndex - 1].value;
        scrollFocusIntoView();
      }
      break;
    }

    case 'ArrowDown': {
      const activeIndex = getActiveKeyIndex();
      if (activeIndex < props.options.length - 1) {
        activeKey.value = props.options[activeIndex + 1].value;
        scrollFocusIntoView();
      }
      break;
    }

    case 'Enter': {
      if (!open.value) {
        open.value = true;
        break;
      }
      if (activeKey.value !== '_-_') {
        picked.value = activeKey.value;
      }
      open.value = false;
      break;
    }

    case 'Escape': {
      open.value = false;
      activeKey.value = '_-_';
      break;
    }

    default:
      open.value = false;
      activeKey.value = '_-_';
      return;
  }

  event.preventDefault();
}

function blur() {
  nextTick().then(() => {
    open.value = false;
  });
}
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.dropdown {
  .block-select();

  position: relative;
  display: inline-block;

  &:focus-visible {
    outline: none;
  }

  .selector {
    .link();
    &.animate {
      .click-move-down();
    }

    &:focus-visible {
      .focus-outline();
    }
  }

  .form-button {
    width: 100%;
  }

  .icon-text {
    display: flex;
    align-items: center;
  }

  .dropdown-pop {
    .border-radius();
    .big-shadow();

    position: absolute;
    z-index: 9999;
    width: max-content;
    white-space: normal;
    display: flex;
    overflow: hidden;
    &-scroll {
      padding: 15px 10px;
      background-color: var(--cl-foreground-solid);
    }

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

        &.focus {
          border-color: var(--cl-border-hover);
        }
      }
    }
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  &.small .dropdown-pop {
    padding: 5px;
    &-default {
      gap: 5px;
      &-element {
        padding: 0 5px;
      }
    }
  }
}
</style>
