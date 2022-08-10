<template>
  <div class="bookmarks">
    <Section class="controls">
      <FormSwitch
        v-model="type"
        :options="[
          {
            value: 'anime',
            title: lang('Anime'),
          },
          {
            value: 'manga',
            title: lang('Manga'),
          },
        ]"
      />
    </Section>
    <Spinner />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Spinner from '../components/spinner.vue';
import FormSwitch from '../components/form/form-switch.vue';
import { setStateContent } from '../utils/state';
import Section from '../components/section.vue';

const route = useRoute();
const router = useRouter();
const type = ref(route.params.type as 'anime' | 'manga');

watch(
  () => route.params.type,
  value => {
    if (route.name === 'Bookmarks') type.value = value as 'anime' | 'manga';
  },
);
watch(type, value => {
  router.push({ name: 'Bookmarks', params: { type: value } });
  setStateContent(value);
});
</script>

<style lang="less" scoped></style>
