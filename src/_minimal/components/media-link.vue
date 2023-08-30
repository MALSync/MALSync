<template>
  <router-link
    v-if="slugObj.path && !forceLink"
    class="media-link"
    :class="[color].join(' ') + (focusState ? ' focus-state' : ' no-focus')"
    :to="{ name: 'Overview', params: slugObj.path }"
    :href="slugObj.url"
    rel="noopener"
  >
    <slot />
  </router-link>
  <a
    v-else-if="slugObj.url"
    :href="slugObj.url"
    class="media-link"
    :class="[color].join(' ') + (focusState ? ' focus-state' : ' no-focus')"
    :target="target"
    rel="noopener"
  >
    <slot />
  </a>
  <span v-else class="media-link"><slot /></span>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { urlToSlug } from '../../utils/slugs';

const props = defineProps({
  href: {
    type: String,
    required: true,
  },
  forceLink: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String as PropType<'primary' | 'secondary' | 'none'>,
    default: 'none',
  },
  target: {
    type: String,
    default: '_blank',
  },
  focusState: {
    type: Boolean,
    default: true,
  },
});

const slugObj = computed(() => urlToSlug(props.href));
</script>

<style lang="less" scoped>
@import '../less/_globals.less';
.media-link {
  .stop-click-through();

  color: inherit;
  font-size: inherit;
  text-decoration: none;

  &.no-focus:focus {
    outline: none;
  }

  &.secondary {
    color: var(--cl-secondary-text);
    transition: color 0.2s ease-in-out;

    &:hover {
      color: var(--cl-secondary);
    }
  }
}

.custom .media-link {
  &.secondary {
    color: inherit;
    border-bottom: 3px solid var(--cl-secondary-text);

    &:hover {
      border-color: var(--cl-secondary);
    }
  }
}
</style>
