<template>
  <button class="dropdown" :aria-current="picked" @blur="open = false">
    <div class="selector" @click="open = !open">
      <slot name="select" :open="open" :current-title="currentTitle" :value="picked">
        <FormButton tabindex="-1" :animation="false">
          <TextIcon :icon="open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'" position="after">
            {{ currentTitle }}
          </TextIcon>
        </FormButton>
      </slot>
    </div>
    <div v-if="open" class="dropdown-pop">
      <div class="dropdown-pop-default">
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

interface Option {
  value: string;
  title: string;
}

const props = defineProps({
  options: {
    type: Array as PropType<Option[]>,
    required: true,
  },
  modelValue: {
    type: String,
    require: true,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

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
    margin-top: 10px;
    background-color: var(--cl-foreground-solid);
    padding: 15px 10px;
    box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.15);
    white-space: nowrap;
    &-default {
      .link();

      display: flex;
      flex-direction: column;
      gap: 5px;
      &-element {
        .border-radius();

        border: 1px solid transparent;
        padding: 5px 15px;
        &.active {
          background-color: var(--cl-backdrop);
        }
        &:hover {
          border-color: var(--cl-border-hover);
        }
      }
    }
  }
}
</style>
