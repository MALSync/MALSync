<template>
  <div class="how">
    <Header :spacer="true"> 🔁 {{ lang('installPage_Howto') }}</Header>
    <Section>
      <p v-dompurify-html="lang('installPage_Howto_Description')"></p>
      <p>
        <strong>For anime:</strong><br />
        The sync waits until 85% of the video is watched.
      </p>
      <p>
        <strong>For manga:</strong><br />
        The sync happens on page load.
      </p>
      <p>
        Synchronization can be configured in the settings later — feel free to customize it your way!
      </p>
    </Section>
  </div>
</template>

<script lang="ts" setup>
import Header from '../header.vue';
import Section from '../section.vue';
</script>

<style lang="less" scoped>
.how::v-deep a {
  color: var(--cl-secondary-text);
  transition: color 0.2s ease-in-out;

  &:hover {
    color: var(--cl-secondary);
  }
}
</style>
