<template>
  <div class="horizontal-scroller" :class="{ open }" @click="open = !open"><slot /></div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const open = ref(false);
</script>

<style lang="less" scoped>
@import '../less/_globals.less';

.horizontal-scroller {
  white-space: nowrap;
  overflow: hidden;
  @media (hover: none) {
    @gradient: linear-gradient(270deg, transparent, #000 100px);

    white-space: nowrap !important;
    overflow-x: auto;
    padding-right: 30px;
    mask-image: @gradient;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-mask-image: @gradient;
  }

  @media (hover: hover) {
    @gradient: linear-gradient(270deg, transparent, #000 100px);
    .link();

    line-height: 1.5;
    mask-image: @gradient;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-mask-image: @gradient;
  }

  &.open {
    white-space: inherit;
    mask-image: none;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-mask-image: none;
  }
}
</style>
