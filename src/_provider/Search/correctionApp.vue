<template>
  <div id="material">
    <div>
      {{searchClass.getUrl()}}
      <input-button :state="searchClass.getUrl()" v-on:clicked="setPage"></input-button>
      <search :keyword="searchClass.getSanitizedTitel()" :type="searchClass.getNormalizedType()" v-on:clicked="setPage($event)"></search>
    </div>
  </div>
</template>

<script type="text/javascript">
  import search from './components/search.vue'
  import inputButton from './components/inputButton.vue'

  export default {
    components: {
      inputButton,
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
      setPage: function(url) {
        this.searchClass.setUrl(url);
      }
    }
  }
</script>
