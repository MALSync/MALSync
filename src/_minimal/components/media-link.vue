<template>
  <router-link
    v-if="slugObj.path && !forceLink"
    class="media-link"
    :to="{ name: 'Overview', params: slugObj.path }"
    :href="slugObj.url"
    rel="noopener"
  >
    <slot />
  </router-link>
  <a v-else-if="slugObj.url" :href="slugObj.url" class="media-link" target="_blank" rel="noopener">
    <slot />
  </a>
  <span v-else class="media-link"><slot /></span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
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
}
</style>
