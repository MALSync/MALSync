<template>
  <router-link :to="props.to" :href="absolute" rel="noopener">
    <slot />
  </router-link>
</template>

<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { RouteLocationRaw, useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  to: {
    type: [Object, String] as PropType<RouteLocationRaw>,
    required: true,
  },
});

const absolute = computed(() =>
  utils.absoluteLink(router.resolve(props.to).href, 'https://malsync.moe/pwa'),
);
</script>
