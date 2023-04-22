<template>
  <div>
    <Card>
      <Header :spacer="true">
        🔗 Choose preferred quicklinks — your favorite sites one-click away
      </Header>
      <Section spacer="none">
        <p>
          Quicklinks, basically, are buttons that open up your streaming/reading site of choice —
          they will be located on every overview page for any anime/manga.
        </p>
        <p>
          For example, if you like to watch anime on Crunchyroll, then Crunchyroll’s quicklink will
          appear on every anime page. It’s a convinient way to access your favorite sites with just
          one click!
        </p>
      </Section>
    </Card>
    <SettingsStreaming :short="true" />
  </div>
</template>

<script lang="ts" setup>
import Card from '../card.vue';
import Header from '../header.vue';
import Section from '../section.vue';
import SettingsStreaming from '../settings/settings-streaming.vue';
</script>

<style lang="less" scoped></style>
