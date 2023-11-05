<template>
  <div>
    <Header :spacer="true"> ⚒️ {{ lang('installPage_Wrong') }}</Header>
    <Section>
      <p>{{ lang('installPage_Wrong_Description') }}</p>
      <p class="correctionGif">
        <img
          id="hiddenimage"
          height="338"
          width="600"
          src="https://raw.githubusercontent.com/lolamtisch/KissAnimeList/master/Screenshots/Wrong%20recognition.gif"
          alt="Wrong recognition"
        />
      </p>
    </Section>
  </div>
</template>

<script lang="ts" setup>
import Header from '../header.vue';
import Section from '../section.vue';
</script>

<style lang="less" scoped>
#hiddenimage {
  width: 100%;
  height: auto;
}
</style>
