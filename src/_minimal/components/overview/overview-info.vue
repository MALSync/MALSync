<template>
  <div>
    <Header :spacer="true">Information</Header>
    <div class="flex">
      <div v-for="item in info" :key="item.title" class="item">
        <div class="type">{{ item.title }}</div>
        <div class="content">
          <template v-for="(link, index) in item.body" :key="link.text">
            <MediaLink v-if="link.url" :href="link.url" class="link">{{ link.text }}</MediaLink>
            <span v-else>
              {{ link.text }}
            </span>
            <span v-if="Number(index) + 1 < item.body.length">, </span>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { Overview } from '../../../_provider/metaOverviewAbstract';
import Header from '../header.vue';
import MediaLink from '../media-link.vue';

defineProps({
  info: {
    type: Array as PropType<Overview['info']>,
    default: () => [],
  },
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';

.flex {
  grid-gap: 15px;
  display: flex;
  flex-direction: column;
}

.item {
  display: flex;

  .__breakpoint-desktop__({
    flex-direction: column;
    gap: 3px;
  });

  .type {
    margin-right: 10px;
    font-weight: bold;
    white-space: nowrap;
  }

  .content {
    flex-grow: 1;
    width: 100%;
    line-height: 1.3;
  }

  .link {
    color: var(--cl-secondary-text);
  }
}
</style>
