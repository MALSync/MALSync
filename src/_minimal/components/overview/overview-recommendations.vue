<template>
  <div>
    <Header :spacer="true">{{ lang('minimalApp_Recommendations') }}</Header>
    <div>{{ malUrl }}</div>
  </div>
</template>

<script lang="ts" setup>
import Header from '../header.vue';

const props = defineProps({
  malUrl: {
    type: String,
    required: true,
  },
});
</script>
