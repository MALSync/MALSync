<template>
  <div>
    <Card>
      <Header :spacer="true"> 🔗 {{ lang('installPage_Links').replace('-', '—') }} </Header>
      <Section spacer="none">
        <p>
          {{ lang('installPage_Description_paragraph1').replace('-', '—') }}
        </p>
        <p>
          {{ lang('installPage_Description_paragraph2') }}
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
