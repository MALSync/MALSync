<template>
  {{ episode ? episode : '?' }}
</template>

<script lang="ts" setup>
defineProps({
  episode: {
    type: Number,
    required: true,
  },
});
</script>
