<template>
  <div id="malsync-update-ui" :class="rootClass">
    <OverviewStreaming
      type="manga"
      :cache-key="cacheKey"
      :title="title"
      :alternative-title="alternativeTitle"
    />
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import OverviewStreaming from '../_minimal/components/overview/overview-streaming.vue';

const cacheKey = inject('cacheKey') as string;
const title = inject('title') as string;
const alternativeTitle = inject('alternativeTitle') as string[];
const rootClass = inject('rootClass') as string;
</script>

<style lang="less">
@import '../_minimal/less/_main.less';

.material-icons {
  /* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
}
</style>

<style lang="less" scoped>
@import '../_minimal/less/_globals.less';

#malsync-update-ui {
  --cl-primary: var(--color-primary);
  --cl-primary-contrast: var(--color-primary-foreground); //
  --cl-foreground: var(--color-background); //
  --cl-backdrop: var(--color-secondary);
  --cl-background: var(--color-secondary);
  --cl-background-solid: var(--color-secondary);
  --cl-foreground-solid: var(--color-popover); //
  --cl-foreground-active: var(--color-secondary);
  --size-spacer-half: calc(var(--spacing) * 4);
  --size-spacer: calc(var(--spacing) * 8);

  margin-top: calc(var(--spacing) * 3);
  &.dark {
    --cl-foreground: var(--color-secondary);
    --cl-foreground-solid: var(--color-secondary);
  }
}
</style>
