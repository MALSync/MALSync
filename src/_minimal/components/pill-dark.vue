<template>
  <div class="pill">
    <slot />
  </div>
</template>

<style lang="less" scoped>
@import '../less/_globals.less';
.pill {
  .border-pill();
  .block-select();

  white-space: nowrap;
  display: inline-block;
  padding: 5px 10px;
  color: white;
  background-color: var(--cl-dark-background);
}
</style>
