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

  display: inline-block;
  padding: 5px 10px;
  color: white;
  background-color: var(--cl-dark-background);
}
</style>
