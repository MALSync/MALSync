<template>
  <div class="card">
    <div class="inner-card">
      <slot />
    </div>
  </div>
</template>

<style lang="less" scoped>
@import '../less/_globals.less';
.card {
  .border-radius();

  border: 2px solid var(--cl-backdrop);
  padding: @spacer-half;
  background-color: var(--cl-backdrop);

  .inner-card {
    --cl-foreground: var(--cl-background);
    --cl-backdrop: var(--cl-background);
  }
}
</style>
