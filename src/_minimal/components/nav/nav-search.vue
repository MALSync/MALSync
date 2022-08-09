<template>
  <div>
    <FormText class="searchField" icon="search" :clear-icon="true" type="search" />
  </div>
</template>

<script lang="ts" setup>
import FormText from '../form/form-text.vue';
</script>

<style lang="less" scoped>
.searchField {
  width: 100%;
}
</style>
