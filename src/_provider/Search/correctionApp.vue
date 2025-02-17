<template>
  <div v-if="syncPage" id="material">
    <div class="m-s-pill-section">
      <div class="m-s-pill">
        <a href="https://malsync.moe/pwa/#/settings" target="_blank">
          {{ lang('minimalApp_Settings') }}→
        </a>
      </div>
    </div>
    <div v-if="syncMode && minimized">
      <a style="cursor: pointer" @click="minimized = false"> Action required </a>
    </div>
    <div v-else class="scroll">
      <entry v-if="!syncMode" :obj="syncPage.singleObj"></entry>
      <rules :obj="rulesClass"></rules>

      <input-button
        v-if="!syncMode"
        label="URL"
        :state="searchClass.getUrl()"
        @clicked="setPage"
      ></input-button>

      <input-button
        v-if="!syncMode"
        :label="lang('correction_Offset')"
        :state="offset"
        type="number"
        @clicked="setOffset"
        @changed="val => (inputOffset = val)"
      ></input-button>
      <div v-if="inputOffset && inputOffset !== '0'" id="offsetUi">
        <div v-for="index in episodeWindow" :key="index" class="offsetBox">
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
        :keyword="searchClass.getSanitizedTitle()"
        :type="searchClass.getNormalizedType()"
        :sync-mode="Boolean(syncMode)"
        :current-id="searchClass.getId()"
        @clicked="setPage($event.url, $event.id)"
      ></search>
    </div>
    <a v-if="!(syncMode && minimized)" class="close" @click="close()">{{ lang('close') }}</a>
  </div>
</template>

<script lang="ts">
import search from './components/search.vue';
import inputButton from './components/inputButton.vue';
import entry from './components/entry.vue';
import rules from './components/rules.vue';
import { hideFloatbutton, showFloatbutton } from '../../floatbutton/init';

export default {
  components: {
    entry,
    inputButton,
    search,
    rules,
  },
  data: () => ({
    inputOffset: 0 as number | '0',
    minimized: false,
    syncMode: null,
    searchClass: null as any,
    unmountFnc: () => {
      // placeholder
    },
  }),
  computed: {
    syncPage() {
      return this.searchClass ? this.searchClass.getSyncPage() : null;
    },
    rulesClass() {
      return this.searchClass.rules;
    },
    currentStateEp() {
      if (this.syncPage && this.syncPage.curState && this.syncPage.curState.detectedEpisode) {
        return this.syncPage.curState.detectedEpisode;
      }
      return 1;
    },
    offset() {
      return this.searchClass.getOffset();
    },
    episodeWindow() {
      let start = this.currentStateEp + parseInt(this.inputOffset) - 2;
      if (start < 1) start = 1;
      return Array.from({ length: 5 }, (_, i) => i + start);
    },
  },
  created() {
    this.minimized = api.settings.get('minimizeBigPopup');
    if (api.settings.get('floatButtonCorrection')) hideFloatbutton(true);
  },
  unmounted() {
    this.unmountFnc();
    showFloatbutton();
  },
  methods: {
    lang: api.storage.lang,
    setPage(url, id = 0) {
      this.searchClass.setUrl(url, id);
      utils.flashm(api.storage.lang('correction_NewUrl', [url]));
      this.close();
    },
    setOffset(offset) {
      this.searchClass.setOffset(offset);
    },
    close() {
      this.$.appContext.app.unmount();
    },
    calcEpOffset(ep) {
      return parseInt(ep) - parseInt(this.inputOffset);
    },
  },
};
</script>

<style lang="less">
@import './correctionStyle.less';
</style>
