<template>
  <span v-if="!discordRequest.loading && discordRequest.data.online" class="pillN">
    {{ discordRequest.data.online }} online
  </span>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { createRequest } from '../../utils/reactive';

const discordRequest = createRequest(
  ref(),
  () =>
    api.request
      .xhr('GET', 'https://api.malsync.moe/static/discord/stats')
      .then(async response => JSON.parse(response.responseText)),
  {
    cache: {
      prefix: 'discord',
      ttl: 2 * 60 * 60 * 1000,
      refetchTtl: 7 * 24 * 60 * 60 * 1000,
      keyFn: () => 'users',
    },
  },
);
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.pillN {
  .border-pill();

  margin-inline-start: @spacer-half;
  background-color: var(--cl-primary);
  color: var(--cl-primary-contrast);
  padding: 5px 10px;
  white-space: nowrap;
  margin-top: -5px;
  margin-bottom: -5px;
  font-size: @normal-text;
}
</style>
