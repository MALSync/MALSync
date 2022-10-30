<template>
  <span class="codeBlock"><slot /></span>
</template>

<style lang="less" scoped>
@import '../less/_globals.less';

.codeBlock {
  .border-radius-small();

  padding: 4px 5px;
  background-color: var(--cl-foreground);
}
</style>
