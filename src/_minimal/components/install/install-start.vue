<template>
  <div>
    <Header :spacer="true"> 🎉 {{ lang('minimalClass_versionMsg_Text_1') }} </Header>
    <Section>
      <p>
        <strong> Let’s do a simple briefing to get you started — takes less than a minute! </strong>
      </p>
    </Section>
  </div>
</template>

<script lang="ts" setup>
import Header from '../header.vue';
import Section from '../section.vue';
</script>

<style lang="less" scoped></style>
