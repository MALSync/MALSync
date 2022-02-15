<template>
  <div class="backbutton-settings bg-cell mdl-grid" @click="click">
    <span class="material-icons">arrow_back</span>
    {{ lang('minimalApp_Settings') }}
  </div>
</template>

<script lang="ts">
export default {
  methods: {
    lang: api.storage.lang,
    click() {
      this.$root.selectTab('settings');
    },
  },
};
</script>
