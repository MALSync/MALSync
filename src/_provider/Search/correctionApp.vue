<template>
  <div id="material">
    <div v-if="syncMode && minimized">
      <a style="cursor: pointer;" @click="minimized = false">
        Action required
      </a>
    </div>
    <div v-else class="scroll">
      <entry v-if="!syncMode" :obj="syncPage.singleObj"></entry>
      <rules :obj="rulesClass"></rules>

      <input-button v-if="!syncMode" label="URL" :state="searchClass.getUrl()" @clicked="setPage"></input-button>

      <input-button
        v-if="!syncMode"
        :label="lang('correction_Offset')"
        :state="offset"
        type="number"
        @clicked="setOffset"
        @change="val => (inputOffset = val)"
      ></input-button>
      <div v-if="inputOffset && inputOffset !== '0'" id="offsetUi">
        <div v-for="index in 5" :key="index" class="offsetBox">
          <div class="mdl-color--primary top">{{ index }}</div>
          <div
            class="bottom"
            :class="{
              active: parseInt(currentStateEp) === calcEpOffset(index),
            }"
          >
            {{ calcEpOffset(index) }}
          </div>
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

      <search
        :keyword="searchClass.getSanitizedTitel()"
        :type="searchClass.getNormalizedType()"
        :sync-mode="syncMode"
        :current-id="searchClass.getId()"
        @clicked="setPage($event.url, $event.id)"
      ></search>
    </div>
    <a v-if="!(syncMode && minimized)" class="close" @click="close()">{{ lang('close') }}</a>
  </div>
</template>

<script type="text/javascript">
import search from './components/search.vue';
import inputButton from './components/inputButton.vue';
import entry from './components/entry.vue';
import rules from './components/rules.vue';

export default {
  components: {
    entry,
    inputButton,
    search,
    rules,
  },
  data: () => ({
    inputOffset: 0,
    minimized: false,
  }),
  computed: {
    searchClass() {
      return this.$parent.searchClass;
    },
    syncPage() {
      return this.$parent.searchClass.getSyncPage();
    },
    rulesClass() {
      return this.searchClass.rules;
    },
    currentStateEp() {
      if (this.syncPage && this.syncPage.curState && this.syncPage.curState.episode) {
        return this.syncPage.curState.episode;
      }
      return undefined;
    },
    syncMode() {
      return this.$parent.syncMode;
    },
    offset() {
      return this.searchClass.getOffset();
    },
  },
  created() {
    this.minimized = api.settings.get('minimizeBigPopup');
  },
  methods: {
    lang: api.storage.lang,
    setPage(url, id = 0) {
      this.searchClass.setUrl(url, id);
      utils.flashm(api.storage.lang('correction_NewUrl', [url]), false);
      this.close();
    },
    setOffset(offset) {
      this.searchClass.setOffset(offset);
    },
    close() {
      this.$root.$destroy();
    },
    calcEpOffset(ep) {
      return parseInt(ep) - parseInt(this.inputOffset);
    },
  },
};
</script>
