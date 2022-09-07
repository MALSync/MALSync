<template>
  <div>
    <Header :spacer="true">Related</Header>
    <div class="grid">
      <FormButton v-for="relation in related" :key="relation.type" class="related-item">
        <div class="type">{{ relation.type }}</div>
        <div v-for="link in relation.links" :key="link.id" class="title">
          <MediaLink :href="link.url" class="link">
            <StateDot :status="link.list ? link.list.status : 0" />
            <span>{{ link.title }}</span>
          </MediaLink>
        </div>
      </FormButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import { Overview } from '../../../_provider/metaOverviewAbstract';
import Header from '../header.vue';
import MediaLink from '../media-link.vue';
import StateDot from '../state-dot.vue';
import FormButton from '../form/form-button.vue';

defineProps({
  related: {
    type: Array as PropType<Overview['related']>,
    required: false,
    default: () => [],
  },
});
</script>

<style lang="less" scoped>
@import '../../less/_globals.less';
.grid {
  grid-gap: 20px;
  display: flex;
  flex-direction: column;
  .__breakpoint-desktop__( {
    display: grid;
    grid-template-columns: repeat(2, 2fr);
    gap: 30px;
  });

  .related-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .type {
    font-weight: bold;
  }

  .link {
    display: flex;
    align-items: center;
  }
}
</style>
