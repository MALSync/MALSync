<template>
  <div class="section">
    <slot />
  </div>
</template>

<style lang="less" scoped>
@import '../less/_globals.less';

.section {
  margin-bottom: @spacer;
}
</style>
