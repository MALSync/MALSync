<template>
  <div class="content">
    <imageLazy
      mode="cover"
      src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg"
      style="width: 300px"
    />
    <imageLazy src="" mode="cover" style="width: 300px" />
    <imageLazy src="https://s4.anilist.co/file/anilistcdn/medi" mode="cover" style="width: 300px" />
    <ImageFit
      style="width: 600px; height: 300px"
      src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg"
    />
    <ImageFit
      style="width: 300px"
      mode="cover"
      src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg"
    />
    <ImageFit style="width: 300px" mode="cover" src="" />
    <ImageFit
      style="width: 300px"
      mode="cover"
      src="https://s4.anilist.co/file/anilistcdn/media/"
    />
  </div>
</template>

<script lang="ts" setup>
import imageLazy from './components/image-lazy.vue';
import ImageFit from './components/image-fit.vue';
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
