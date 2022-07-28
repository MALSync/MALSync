<template>
  <div class="content">
    <lazyImage
      mode="cover"
      src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg"
      style="width: 300px"
    />
    <lazyImage src="" mode="cover" style="width: 300px" />
    <lazyImage src="https://s4.anilist.co/file/anilistcdn/medi" mode="cover" style="width: 300px" />
  </div>
</template>

<script lang="ts" setup>
import lazyImage from './components/lazy-image.vue';
</script>

<style lang="less">
@import './less/_main.less';
</style>

<style lang="less" scoped>
@import './less/_globals.less';
.content {
  padding: 0 @spacer;
}
</style>
