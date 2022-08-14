<template>
  <div>{{ url }}</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Path, pathToUrl } from '../../utils/slugs';

const route = useRoute();

const url = computed(() => pathToUrl(route.params as Path));
</script>
