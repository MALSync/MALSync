<template>
  <div class="cutoff"><slot /></div>
</template>

<script lang="ts" setup>
defineProps({
  lines: {
    type: Number,
    default: 2,
  },
});
</script>

<style lang="less" scoped>
.cutoff {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: v-bind(lines);
  -webkit-box-orient: vertical;
}
</style>
