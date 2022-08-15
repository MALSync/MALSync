<template>
  <div class="overview">
    <Section>
      <OverviewImage
        class="image"
        :src="metaRequest.data?.image || ''"
        :loading="metaRequest.loading"
      />
    </Section>
    <Section>
      <Header :loading="metaRequest.loading">
        <StateDot :status="0" />{{ metaRequest.data?.title }}
      </Header>
    </Section>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Path, pathToUrl } from '../../utils/slugs';
import { getOverview } from '../../_provider/metaDataFactory';
import { createRequest } from '../utils/reactive';
import OverviewImage from '../components/overview/overview-image.vue';
import Section from '../components/section.vue';
import Header from '../components/header.vue';
import StateDot from '../components/state-dot.vue';

const route = useRoute();

const url = computed(() => (route.params.slug ? pathToUrl(route.params as Path) : ''));

const parameters = ref({
  url,
  type: route.params.type as 'anime' | 'manga',
});

const metaRequest = createRequest(parameters, async param => {
  const ov = await getOverview(param.value.url, param.value.type).init();
  return ov.getMeta();
});
</script>

<style lang="less" scoped>
.overview {
  .image {
    height: 200px;
  }
}
</style>
