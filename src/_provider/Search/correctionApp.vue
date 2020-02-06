<template>
  <div id="material">
    <div class="scroll">
      <input-button label="Url" :state="searchClass.getUrl()" v-on:clicked="setPage"></input-button>
      <input-button :label="lang('correction_Offset')" :state="searchClass.getOffset()" type="number" v-on:clicked="setOffset"></input-button>
      <search :keyword="searchClass.getSanitizedTitel()" :type="searchClass.getNormalizedType()" :syncMode="syncMode" v-on:clicked="setPage($event)"></search>
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
      },
      syncMode: function() {
        return this.$parent.syncMode;
      },
    },
    methods: {
      lang: api.storage.lang,
      setPage: function(url) {
        this.searchClass.setUrl(url);
        utils.flashm(api.storage.lang("correction_NewUrl",[url]) , false);
        this.$root.$destroy();
      },
      setOffset: function(offset) {
        this.searchClass.setOffset(offset);
      }
    }
  }
</script>
