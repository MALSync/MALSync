<template>
  <div class="cutoff"><slot /></div>
</template>

<style lang="less" scoped>
.cutoff {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-height: 21px;
  max-height: 48px;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
