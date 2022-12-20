<template>
  <component
    :is="tag"
    class="lazy-image"
    :class="classes"
    :src="realSrc"
    loading="lazy"
    @load="imageLoaded"
    @error="imageError"
  />
</template>

<script lang="ts" setup>
import { computed, ref, watch, PropType } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: false,
    default: null,
  },
  mode: {
    type: String as PropType<'' | 'cover' | 'object-fit'>,
    default: '',
  },
});

const realSrc = computed(() => props.src.replace(/^\/\//g, 'https://'));

const error = ref(false);

watch(
  () => props.src,
  () => {
    error.value = false;
    if (props.src === 'error') {
      error.value = true;
    }
  },
);

const tag = computed(() => {
  return props.src && props.src !== 'error' && !error.value ? 'img' : 'div';
});

const classes = computed(() => {
  const classArray: string[] = [];
  if (props.mode) classArray.push(`mode-${props.mode}`);
  if (error.value) {
    classArray.push('error');
  } else if (!props.src) {
    classArray.push('empty');
  }
  return classArray.join(' ');
});

const emit = defineEmits(['load', 'error']);
function imageLoaded(event: Event) {
  emit('load', event);
}
function imageError(event: Event) {
  error.value = true;
  emit('error', event);
}
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.lazy-image {
  display: inline-block;
  background-color: var(--cl-backdrop);
  max-width: 100%;

  &.empty {
    background-image: url(@endless-clouds);
  }

  &.error {
    background-image: url(@hideout);
  }

  &.mode-cover,
  &.mode-object-fit {
    object-fit: cover;
  }

  &.mode-cover {
    aspect-ratio: @aspect-ratio-cover;
  }
}
</style>
