<template>
  <div id="malkiss" class="simkltvdetailonline" :class="{ Minimized: classes.minimized, Search: classes.search }">
    <div class="malsync-page-relation">
      <a v-for="page in pageRelation" :key="page.title" :href="page.link" target="_blank" :title="page.name">
        <img :src="page.icon" width="16" height="16" />
      </a>
    </div>
    <div class="simkltvdetailonlinehead">
      <div class="simkltvdetailonlineheadleft">
        <div class="simkltvdetailonlineheadtitle">Stream online:</div>
        <a
          v-if="streamUrl"
          :href="streamUrl"
          target="_blank"
          class="simkltvdetailonlineheadbutton simkltvdetailonlineheadbuttonstream"
        >
          <div class="simkltvdetailonlineheadbuttonimage">
            <img :src="favicon(streamUrl.split('/')[2])" alt="" :title="streamUrl.split('/')[2]" />
          </div>
        </a>
        <a v-if="continueUrl" :href="continueUrl" target="_blank" class="simkltvdetailonlineheadbutton">
          <div class="simkltvdetailonlineheadbuttontitle">
            Watch next episode
          </div>
          <div class="simkltvdetailonlineheadbuttonico" style="margin-top: -4px;"></div>
        </a>
        <a v-if="resumeUrl && !continueUrl" :href="resumeUrl" target="_blank" class="simkltvdetailonlineheadbutton">
          <div class="simkltvdetailonlineheadbuttontitle">Resume episode</div>
          <img :src="assetUrl('arrow-16px.png')" width="16" height="16" style="filter: invert(1); margin-top: -1px;" />
        </a>
        <div
          v-if="links === null || Object.keys(links).length"
          class="simkltvdetailonlineheadbutton Sources"
          @click="toggleMinimized()"
        >
          <div v-if="links !== null && Object.keys(links).length" class="simkltvdetailonlineheadbuttontitle">
            {{ Object.keys(links).length }} streaming sources
          </div>
          <div v-else class="simkltvdetailonlineheadbuttontitle">Loading</div>
          <div class="simkltvdetailonlineheadbuttonicoarrow"></div>
        </div>
        <div v-if="pageSearch !== null" class="simkltvdetailonlineheadbutton Search" @click="toggleSearch()">
          <div class="simkltvdetailonlineheadbuttontitle">Search</div>
          <div class="simkltvdetailonlineheadbuttonicoarrow"></div>
        </div>
      </div>
      <div class="simkltvdetailonlineheadright" @click="pressMinimized()">
        <div class="simkltvdetailonlineheadrightclose">
          <div class="simkltvdetailonlineheadrightname" style="--data-online-block-title:'MAL-Sync';"></div>
          <div class="simkltvdetailonlineheadrightcloseico"></div>
        </div>
      </div>
    </div>
    <div class="simkltvdetailonlineitems Search">
      <div v-for="page in pageSearch" :key="page.search" class="simkltvdetailonlineitemsearch">
        <a :href="page.search" target="_blank" class="simkltvdetailonlineitemsearchhref">
          <div class="simkltvdetailonlineitemsearchico">
            <img :src="page.favicon" class="simkltvdetailonlineitemsearchicoimg" />
          </div>
          <div class="simkltvdetailonlineitemsearchtitle">{{ page.name }}</div>
        </a>
        <a
          v-if="page.googleSeach.length"
          :href="page.googleSeach"
          target="_blank"
          class="simkltvdetailonlineitemsearchgoogle"
        ></a>
      </div>
    </div>
    <div class="simkltvdetailonlineitems Links">
      <div v-if="links === null">Loading</div>

      <div v-for="page in links" :key="page.name" class="simkltvdetailonlineitem">
        <div class="simkltvdetailonlineitemtop">
          <div class="simkltvdetailonlineitemico">
            <img :src="getMal2KissFavicon(page.domain)" alt="" />
          </div>
          <div class="simkltvdetailonlineitemname">{{ page.name }}</div>
          <div class="simkltvdetailonlineitemclose" @click="removeSource(page)"></div>
        </div>
        <div class="simkltvdetailonlineitemlinks">
          <a
            v-for="stream in page.links"
            :key="stream.url"
            target="_blank"
            :href="stream.url"
            class="simkltvdetailonlineitemhref"
            >{{ stream.name }}</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import { removeFromOptions } from '../utils/quicklinksBuilder';

const STORAGE_KEY = 'SIMKL-MAL-SYNC';
export default {
  data: () => ({
    streamUrl: undefined,
    continueUrl: null,
    resumeUrl: null,
    links: null,
    pageSearch: null,
    pageRelation: null,
    classes: {
      minimized: true,
      search: false,
    },
  }),
  watch: {
    streamUrl(url) {
      if (url) {
        this.classes.minimized = true;
        this.classes.search = false;
      }
    },
  },
  created() {
    const classes = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (classes) {
      this.classes = classes;
    }
  },
  methods: {
    lang: api.storage.lang,
    favicon: utils.favicon,
    assetUrl: api.storage.assetUrl,
    getMal2KissFavicon(url) {
      try {
        return utils.favicon(url);
      } catch (e) {
        con.error(e);
        return '';
      }
    },
    toggleSearch() {
      this.classes.search = !this.classes.search;
      this.saveClasses();
    },
    pressMinimized() {
      if (this.links === null || Object.keys(this.links).length) {
        this.toggleMinimized();
      } else {
        this.toggleSearch();
      }
      this.saveClasses();
    },
    toggleMinimized() {
      this.classes.minimized = !this.classes.minimized;
      if (this.classes.search && this.classes.minimized) this.toggleSearch();
      this.saveClasses();
    },
    removeSource(key) {
      removeFromOptions(String(key.name));
      window.location.reload();
    },
    saveClasses() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.classes));
    },
  },
};
</script>

<style lang="less" scoped>
.Sources {
  min-width: 178px;
}
.simkltvdetailonlineheadbuttonstream {
  width: auto;
  min-width: auto;
}
#malkiss {
  position: relative;
}
.malsync-page-relation {
  display: flex;
  position: absolute;
  bottom: -1px;
  right: -1px;
  & > a {
    margin-left: 5px;
  }
}
</style>
