<template>
  <div>
    <FormText v-model="query" class="searchField" icon="search" :clear-icon="true" type="search" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTypeContext } from '../../utils/state';
import FormText from '../form/form-text.vue';

const route = useRoute();
const router = useRouter();

const query = ref(route.query.s ? route.query.s.toString() : '');

let debounce;

watch(query, value => {
  clearTimeout(debounce);
  if (value) {
    debounce = setTimeout(() => {
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
    }, 300);
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
