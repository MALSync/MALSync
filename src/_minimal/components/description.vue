<template>
  <div
    class="description"
    :class="{ close: !open && overflow, loading, fade, dynamic: height === 'dynamic' }"
  >
    <template v-if="!loading">
      <div ref="inner" class="open-gradient" dir="auto">
        <slot></slot>
      </div>
      <FormButton
        v-if="!open && overflow"
        class="open-button"
        :animation="false"
        @click="open = true"
      >
        {{ lang('settings_read_more') }}
      </FormButton>
      <div v-if="open" class="close-button-box">
        <FormButton class="close-button" :animation="false" @click="open = false">
          {{ lang('settings_read_less') }}
        </FormButton>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, PropType, Ref, ref, watch } from 'vue';

import FormButton from './form/form-button.vue';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  fade: {
    type: Boolean,
    default: false,
  },
  height: {
    type: [Number, String] as PropType<number | 'dynamic'>,
    default: 240,
  },
  minheight: {
    type: String,
    default: '150px',
  },
});

const open = ref(false);
const overflow = ref(true);

const inner = ref(null) as Ref<HTMLElement | null>;

const calcOverflow = () => {
  overflow.value = true;
  if (inner.value) {
    const { scrollHeight, clientHeight } = inner.value;
    overflow.value = Boolean(scrollHeight > clientHeight);
  }
};

const heightstyle = computed(() => {
  if (props.height === 'dynamic') return 'auto';
  return `${props.height}px`;
});

onMounted(() => {
  calcOverflow();
});

watch(
  () => props.loading,
  () => calcOverflow(),
);

watch(inner, () => calcOverflow());
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.description {
  position: relative;

  .open-button {
    position: absolute;
    bottom: 1px;
    left: 50%;
    transform: translateX(-50%);
    font-weight: 500;
  }

  .close-button-box {
    display: flex;
    justify-content: center;
    margin-top: @spacer-half;
    font-weight: 500;
  }

  &.close {
    overflow: hidden;

    .open-gradient {
      max-height: v-bind(heightstyle);
      mask-image: linear-gradient(180deg, #000 60%, transparent);
      /* stylelint-disable-next-line property-no-vendor-prefix */
      -webkit-mask-image: linear-gradient(180deg, #000 60%, transparent);
    }
  }

  &.loading {
    .skeleton-text-block();

    height: v-bind(heightstyle);

    &.fade {
      .skeleton-text-block-fade();
    }
  }

  &.dynamic {
    height: 100%;
    min-height: v-bind(minheight);
    position: relative;
    &.close .open-gradient {
      max-height: 100%;
      height: 100%;
      position: absolute;
    }
  }
}
</style>
