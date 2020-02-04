<template>
  <div id="material">
    <div>
      {{searchClass.getSanitizedTitel()}}
      <search :keyword="searchClass.getSanitizedTitel()" :type="searchClass.getNormalizedType()"></search>
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
    computed: {
      searchClass: function() {
        return this.$parent.searchClass;
      }
    },
    methods: {
      lang: api.storage.lang,
    }
  }
</script>
