<template>
  <div>
    <FormText
      v-model="query"
      class="searchField"
      icon="search"
      :clear-icon="true"
      type="search"
      :autofocus="autofocus"
    />
  </div>
</template>

<script lang="ts" setup>
import { inject, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTypeContext } from '../../utils/state';
import FormText from '../form/form-text.vue';
import { setTyping } from './nav-search-state';

const route = useRoute();
const router = useRouter();

const query = ref(route.query.s ? route.query.s.toString() : '');
const autofocus = ref(false);

const rootHtml = inject('rootHtml') as HTMLElement;
if (rootHtml.getAttribute('mode') === 'popup' || query.value) {
  autofocus.value = true;
}

let debounce;

watch(query, value => {
  clearTimeout(debounce);
  if (value) {
    setTyping(true);
    debounce = setTimeout(() => {
      setTyping(false);
      const nextRoute = {
        name: 'Search',
        params: { type: getTypeContext().value },
        query: { s: value },
      };
      if (route.name === 'Search') {
        router.replace(nextRoute);
      } else {
        router.push(nextRoute);
      }
    }, 700);
  } else if (route.name === 'Search') {
    router.go(-1);
  }
});

watch(
  () => route.query.s,
  value => {
    if (value) query.value = value.toString();
  },
);
</script>

<style lang="less" scoped>
.searchField {
  width: 100%;
}
</style>
