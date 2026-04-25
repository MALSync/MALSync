<template>
  <div ref="target" class="dynamic">{{ text }}</div>
</template>

<script lang="ts" setup>
import { computed, inject, PropType, Ref, ref } from 'vue';

const rootWindow = inject('rootWindow') as Window;

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  sizes: {
    type: Array as PropType<number[]>,
    default: () => [25, 22, 20, 18],
  },
  doubleRowSizes: {
    type: Array as PropType<number[]>,
    default: () => [18, 16, 14, 12],
  },
});

const target = ref(null) as Ref<HTMLElement | null>;

const length = computed(() => props.text.length);

const getCharWidth = (fontSize: number) => fontSize * 0.55;

const size = computed(() => {
  const fieldWidth = target.value
    ? target.value.clientWidth
    : Math.min(rootWindow.innerWidth, rootWindow.screen.width) - 310;

  let found = props.sizes.find(fontSize => {
    const charWidth = getCharWidth(fontSize);

    if (charWidth * length.value < fieldWidth) {
      return true;
    }
    return false;
  });

  if (!found) {
    found = props.doubleRowSizes.find(fontSize => {
      const charWidth = getCharWidth(fontSize);

      if (charWidth * length.value < fieldWidth * 2) {
        return true;
      }
      return false;
    });
  }

  if (!found) return props.doubleRowSizes[props.doubleRowSizes.length - 1];

  return found;
});

const style = computed(() => `${size.value}px`);
</script>

<style lang="less" scoped>
.dynamic {
  margin-top: 0;
  font-weight: 500;
  font-size: v-bind(style);
  line-height: 1.2;
}
</style>
