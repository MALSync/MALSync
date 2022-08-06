<template>
  <a :href="href" class="media-link"><slot /></a>
</template>

<script lang="ts" setup>
defineProps({
  href: {
    type: String,
    required: true,
  },
});
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
