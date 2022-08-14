<template>
  <router-link
    v-if="slugObj.path"
    class="media-link"
    :to="{ name: 'Overview', params: slugObj.path }"
    :href="slugObj.url"
    rel="noopener"
  >
    <slot />
  </router-link>
  <a v-else :href="slugObj.url" class="media-link" target="_blank" rel="noopener"><slot /></a>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { urlToSlug } from '../../utils/slugs';

const props = defineProps({
  href: {
    type: String,
    required: true,
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
