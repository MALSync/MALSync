<template>
  <div class="content">
    <Grid min-width="191">
      <imageLazy
        mode="cover"
        src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg"
      />
      <imageLazy src="" mode="cover" />
      <imageLazy src="https://s4.anilist.co/file/anilistcdn/medi" mode="cover" />
      <ImageFit
        mode="cover"
        src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg"
      />
      <ImageFit mode="cover" src="" />
      <ImageFit mode="cover" src="https://s4.anilist.co/file/anilistcdn/media/" />
    </Grid>

    <FormButton>Read More</FormButton>
    <FormButton padding="large">Load</FormButton>
    <ImageFit
      style="width: 600px; height: 300px"
      src="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx19815-bIo51RMWWhLv.jpg"
    />
  </div>
</template>

<script lang="ts" setup>
import imageLazy from './components/image-lazy.vue';
import ImageFit from './components/image-fit.vue';
import Grid from './components/grid.vue';
import FormButton from './components/form/form-button.vue';
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
