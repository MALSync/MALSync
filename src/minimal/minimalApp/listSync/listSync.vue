<template>
  <div>
    <backbutton />
    <div class="mdl-grid bg-cell" style="display: block; margin: 10px;">
      <div style="margin-bottom: 20px;">
        This feature is still in beta. Use at your own risk. More info
        <a href="https://github.com/MALSync/MALSync/wiki/List-Sync">Here</a>
      </div>

      <div>
        <slot></slot>
      </div>

      <div
        :style="getTypeColor(getType('myanimelist.net'))"
        style="display: inline-block; margin-right: 40px; padding-left: 10px; margin-bottom: 20px;"
      >
        MyAnimeList <span v-if="listProvider.mal.master">(Master)</span><br />
        <span v-dompurify-html="listProvider.mal.text"></span><br />
        <span v-if="listProvider.mal.list">List: {{ listProvider.mal.list.length }}</span
        ><br />
        <br />
      </div>
      <div
        :style="getTypeColor(getType('anilist.co'))"
        style="display: inline-block; margin-right: 40px; padding-left: 10px; margin-bottom: 20px;"
      >
        AniList <span v-if="listProvider.anilist.master">(Master)</span><br />
        <span v-dompurify-html="listProvider.anilist.text"></span> <br />
        <span v-if="listProvider.anilist.list">List: {{ listProvider.anilist.list.length }}</span
        ><br />
        <br />
      </div>
      <div
        :style="getTypeColor(getType('kitsu.io'))"
        style="display: inline-block; margin-right: 40px; padding-left: 10px; margin-bottom: 20px;"
      >
        Kitsu <span v-if="listProvider.kitsu.master">(Master)</span><br />
        <span v-dompurify-html="listProvider.kitsu.text"></span><br />
        <span v-if="listProvider.kitsu.list">List: {{ listProvider.kitsu.list.length }}</span
        ><br />
        <br />
      </div>
      <div
        :style="getTypeColor(getType('simkl.com'))"
        style="display: inline-block; margin-right: 40px; padding-left: 10px; margin-bottom: 20px;"
      >
        Simkl <span v-if="listProvider.simkl.master">(Master)</span><br />
        <span v-dompurify-html="listProvider.simkl.text"></span><br />
        <span v-if="listProvider.simkl.list">List: {{ listProvider.simkl.list.length }}</span
        ><br />
        <br />
      </div>
      <br />

      <button
        type="button"
        :disabled="!listReady"
        class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
        style="margin-bottom: 20px;"
        @click="syncList()"
      >
        Sync
      </button>

      <button
        v-if="apiType() == 'webextension'"
        type="button"
        class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
        style="margin-bottom: 20px; float: right;"
        @click="backgroundClick()"
      >
        <template v-if="isBackgroundEnabled">
          Background Sync Enabled
        </template>
        <template v-else>
          Sync in Background
        </template>
      </button>

      <span v-if="listLength">{{ listLength - listSyncLength }}/{{ listLength }}</span>

      <div
        v-for="(item, index) in listDiff"
        :key="index"
        style="border: 1px solid black; display: flex; flex-wrap: wrap; margin-bottom: 10px;"
      >
        <div style="width: 100%; border-bottom: 1px solid black; padding: 0 5px;">
          {{ item.master.title }}
        </div>
        <div style="width: 50px; border-right: 1px solid black; padding: 5px;">
          {{ index }}
        </div>
        <div
          v-if="item.master && item.master.uid"
          class="master"
          :style="getTypeColor(getType(item.master.url))"
          style="background-color: #ffd5d5; border-right: 1px solid black; padding: 5px 10px; width: 70px;"
        >
          ID: <a target="_blank" :href="item.master.url">{{ item.master.uid }}</a
          ><br />
          EP: {{ item.master.watchedEp }}<br />
          Status: {{ item.master.status }}<br />
          Score: {{ item.master.score }}
        </div>
        <div
          v-for="slave in item.slaves"
          :key="slave.uid"
          class="slave"
          :style="getTypeColor(getType(slave.url))"
          style="border-right: 1px solid black; padding: 5px 10px; width: 100px;"
        >
          ID: <a target="_blank" :href="slave.url">{{ slave.uid }}</a
          ><br />
          EP: {{ slave.watchedEp }}
          <span v-if="slave.diff && slave.diff.watchedEp" style="color: green;">→ {{ slave.diff.watchedEp }}</span
          ><br />
          Status: {{ slave.status }}
          <span v-if="slave.diff && slave.diff.status" style="color: green;">→ {{ slave.diff.status }}</span
          ><br />
          Score: {{ slave.score }}
          <span v-if="slave.diff && slave.diff.score" style="color: green;">→ {{ slave.diff.score }}</span>
        </div>
      </div>

      <div v-if="missing.length">
        <h2>Missing</h2>
        <div
          v-for="item in missing"
          :key="item.url"
          style="border: 1px solid black; display: flex; flex-wrap: wrap; margin-bottom: 10px;"
        >
          <div style="width: 50px; border-right: 1px solid black; padding: 5px;">
            <a target="_blank" :href="item.url">{{ item.malId }}</a>
          </div>
          <div :style="getTypeColor(item.syncType)" style="padding: 5px 10px;">
            {{ item.title }}<br />
            EP: {{ item.watchedEp }}<br />
            Status: {{ item.status }}<br />
            Score: {{ item.score }}
          </div>
          <div v-if="item.error" style="color: red; width: 100%; border-top: 1px solid;">
            {{ item.error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import * as sync from './syncHandler';
import backbutton from '../components/backbutton.vue';

export default {
  components: {
    backbutton,
  },
  props: {
    listType: {
      type: String,
      default: 'anime',
    },
  },
  data() {
    return {
      listProvider: {
        mal: {
          text: 'Init',
          list: null,
          master: false,
        },
        anilist: {
          text: 'Init',
          list: null,
          master: false,
        },
        kitsu: {
          text: 'Init',
          list: null,
          master: false,
        },
        simkl: {
          text: 'Init',
          list: null,
          master: false,
        },
      },
      listReady: false,
      listLength: 0,
      list: {},
      missing: [],
      isBackgroundEnabled: false,
    };
  },
  computed: {
    listSyncLength() {
      return Object.values(this.list).filter(el => el.diff).length;
    },
    listDiff() {
      const res = {};
      for (const key in this.list) {
        if (Object.prototype.hasOwnProperty.call(this.list, key) && this.list[key].diff) {
          res[key] = this.list[key];
        }
      }
      return res;
    },
  },
  watch: {},
  async mounted() {
    sync.background.isEnabled().then(state => {
      this.isBackgroundEnabled = state;
    });
    const type = this.listType;
    const mode = 'mirror';

    const providerList = sync.getListProvider({
      mal: this.listProvider.mal,
      anilist: this.listProvider.anilist,
      kitsu: this.listProvider.kitsu,
      simkl: this.listProvider.simkl,
    });

    const listOptions = await sync.retriveLists(providerList, type, sync.getList);

    sync.generateSync(listOptions.master, listOptions.slaves, mode, listOptions.typeArray, this.list, this.missing);
    this.list = { ...this.list };

    this.listReady = true;
  },
  methods: {
    lang: api.storage.lang,
    getType: sync.getType,
    apiType() {
      return api.type;
    },
    getTypeColor(type) {
      if (type === 'ANILIST') return 'border-left: 5px solid #02a9ff';
      if (type === 'KITSU') return 'border-left: 5px solid #f75239';
      if (type === 'SIMKL') return 'border-left: 5px solid #ffbf00';
      return 'border-left: 5px solid #2e51a2';
    },

    async syncList() {
      this.listReady = false;
      this.listLength = this.listSyncLength;

      sync.syncList(this.list, this.missing);
    },

    async backgroundClick() {
      if (await sync.background.isEnabled()) {
        sync.background.disable();
        this.isBackgroundEnabled = false;
      } else {
        sync.background.enable();
        this.isBackgroundEnabled = true;
      }
    },
  },
};
</script>
