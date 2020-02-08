<template>
  <div id="material">
    <div class="scroll">
      <input-button v-if="!syncMode" label="Url" :state="searchClass.getUrl()" v-on:clicked="setPage"></input-button>

      <input-button v-if="!syncMode" :label="lang('correction_Offset')" :state="offset" type="number" v-on:clicked="setOffset" v-on:change="val => inputOffset = val"></input-button>
      <div id="offsetUi" v-if="inputOffset && inputOffset !== '0'">
        <div class="offsetBox" v-for="index in 5" :key="index">
          <div class="mdl-color--primary top">{{index}}</div>
          <div class="bottom" :class="{active: parseInt(currentStateEp) === calcEpOffset(index)}">{{calcEpOffset(index)}}</div>
        </div>
        <div class="offsetBox">
          <div class="mdl-color--primary top">...</div>
          <div class="bottom">...</div>
        </div>
        <div class="offsetBox">
          <div class="mdl-color--primary top">∞</div>
          <div class="bottom">∞</div>
        </div>
      </div>

      <search :keyword="searchClass.getSanitizedTitel()" :type="searchClass.getNormalizedType()" :syncMode="syncMode" :currentId="searchClass.getId()" v-on:clicked="setPage($event.url, $event.id)"></search>
    </div>
    <a class="close" @click="close()">CLOSE</a>
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
      inputOffset: 0,
    }),
    computed: {
      searchClass: function() {
        return this.$parent.searchClass;
      },
      syncPage: function() {
        return this.$parent.searchClass.getSyncPage();
      },
      currentStateEp: function() {
        if(this.syncPage && this.syncPage.curState && this.syncPage.curState.episode) {
          return this.syncPage.curState.episode;
        }
      },
      syncMode: function() {
        return this.$parent.syncMode;
      },
      offset: function() {
        return this.searchClass.getOffset();
      }
    },
    methods: {
      lang: api.storage.lang,
      setPage: function(url, id = 0) {
        this.searchClass.setUrl(url, id);
        utils.flashm(api.storage.lang("correction_NewUrl",[url]) , false);
        this.close();
      },
      setOffset: function(offset) {
        this.searchClass.setOffset(offset);
      },
      close: function() {
        this.$root.$destroy();
      },
      calcEpOffset: function (ep) {
        return parseInt(ep) - parseInt(this.inputOffset);
      }
    }
  }
</script>
