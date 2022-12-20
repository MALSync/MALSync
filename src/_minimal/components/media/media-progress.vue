<template>
  <span v-if="episode" :title="text"> [{{ episode }}] </span>
</template>

<script lang="ts" setup>
defineProps({
  episode: {
    type: Number,
    required: false,
    default: 0,
  },
  text: {
    type: String,
    required: false,
    default: '',
  },
});
</script>
