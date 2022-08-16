<template>
  <div>
    <Header :spacer="true" class="head">Streaming [TODO]</Header>
    Streaming
  </div>
</template>

<script lang="ts" setup>
import Header from '../header.vue';
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.__breakpoint-desktop__( {
  .head {
    display: none;
  }
});
</style>
