<template>
  <div ref="target" class="dynamic">{{ text }}</div>
</template>

<script lang="ts" setup>
import { computed, Ref, ref } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
});

const target = ref(null) as Ref<HTMLElement | null>;

const sizes = [25, 22, 20, 18];

const doubleRowSizes = [18, 16, 14, 12];

const length = computed(() => props.text.length);

const getCharWidth = (fontSize: number) => fontSize * 0.55;

const size = computed(() => {
  const fieldWidth = target.value ? target.value.clientWidth : window.innerWidth - 310;

  let found = sizes.find(fontSize => {
    const charWidth = getCharWidth(fontSize);

    if (charWidth * length.value < fieldWidth) {
      return true;
    }
    return false;
  });

  if (!found) {
    found = doubleRowSizes.find(fontSize => {
      const charWidth = getCharWidth(fontSize);

      if (charWidth * length.value < fieldWidth * 2) {
        return true;
      }
      return false;
    });
  }

  if (!found) return doubleRowSizes[doubleRowSizes.length - 1];

  return found;
});

const style = computed(() => `${size.value}px`);
</script>

<style lang="less" scoped>
.dynamic {
  margin-top: 0;
  font-weight: bold;
  font-size: v-bind(style);
  line-height: 1.2;
}
</style>
