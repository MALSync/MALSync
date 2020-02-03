<template>
  <div id="material">
    <div>
      <search></search>
    </div>
  </div>
</template>

<script type="text/javascript">
  import search from './components/search.vue'

  export default {
    components: {
      search
    },
    data: () => ({
    }),
    methods: {
      lang: api.storage.lang,
    }
  }
</script>
