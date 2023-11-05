<template>
  <div class="how">
    <Header :spacer="true"> 🔁 {{ lang('installPage_Howto') }}</Header>
    <Section>
      <p v-dompurify-html="lang('installPage_Howto_Description')"></p>
      <p>
        <strong>{{ lang('Anime') }}:</strong><br />
        {{ lang('installPage_Howto_Anime_Description') }}
      </p>
      <p>
        <strong>{{ lang('Manga') }}:</strong><br />
        {{ lang('installPage_Howto_Manga_Description') }}
      </p>
      <p>
        {{ lang('installPage_Howto_Notes').replace('-', '—') }}
      </p>
    </Section>
  </div>
</template>

<script lang="ts" setup>
import Header from '../header.vue';
import Section from '../section.vue';
</script>

<style lang="less" scoped>
.how:deep(a) {
  color: var(--cl-secondary-text);
  transition: color 0.2s ease-in-out;

  &:hover {
    color: var(--cl-secondary);
  }
}
</style>
