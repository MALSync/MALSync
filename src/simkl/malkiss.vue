<template>
  <div class="simkltvdetailonline" id="malkiss" v-bind:class="{ Minimized: classes.minimized, Search: classes.search }">
    <div class="simkltvdetailonlinehead">
      <div class="simkltvdetailonlineheadleft">
        <div class="simkltvdetailonlineheadtitle">Stream online:</div>
        <a :href="streamUrl" v-if="streamUrl" target="_blank" class="simkltvdetailonlineheadbutton">
          <div class="simkltvdetailonlineheadbuttonimage"><img :src="favicon(streamUrl.split('/')[2])" alt="" :title="streamUrl.split('/')[2]"></div>
        </a>
        <a :href="continueUrl" v-if="continueUrl" target="_blank" class="simkltvdetailonlineheadbutton">
          <div class="simkltvdetailonlineheadbuttontitle">Watch next episode</div>
          <div class="simkltvdetailonlineheadbuttonico" style="margin-top: -4px;"></div>
        </a>
        <a :href="resumeUrl" v-if="resumeUrl && !continueUrl" target="_blank" class="simkltvdetailonlineheadbutton">
          <div class="simkltvdetailonlineheadbuttontitle">Resume episode</div>
          <img :src="assetUrl('arrow-16px.png')" width="16" height="16" style="filter: invert(1); margin-top: -1px;">
        </a>
        <div class="simkltvdetailonlineheadbutton Sources" @click="toggleMinimized()" v-if="links === null || Object.keys(links).length">
          <div class="simkltvdetailonlineheadbuttontitle" v-if="links !== null && Object.keys(links).length">{{Object.keys(links).length}} streaming sources</div>
          <div class="simkltvdetailonlineheadbuttontitle" v-else>Loading</div>
          <div class="simkltvdetailonlineheadbuttonicoarrow"></div>
        </div>
        <div class="simkltvdetailonlineheadbutton Search" @click="toggleSearch()"  v-if="pageSearch !== null">
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

      <div class="simkltvdetailonlineitemsearch" v-for="(page) in pageSearch">
        <a :href="page.search" target="_blank" class="simkltvdetailonlineitemsearchhref">
          <div class="simkltvdetailonlineitemsearchico"><img :src="page.favicon" class="simkltvdetailonlineitemsearchicoimg"></div>
          <div class="simkltvdetailonlineitemsearchtitle">{{page.name}}</div>
        </a>
        <a v-if="page.googleSeach.length" :href="page.googleSeach" target="_blank" class="simkltvdetailonlineitemsearchgoogle"></a>
      </div>

    </div>
    <div class="simkltvdetailonlineitems Links">

      <div class="simkltvdetailonlineitem" v-for="(streams, page) in links">
        <div class="simkltvdetailonlineitemtop">
          <div class="simkltvdetailonlineitemico"><img :src="getMal2KissFavicon(streams)" alt=""></div>
          <div class="simkltvdetailonlineitemname">{{page}}</div>
          <div class="simkltvdetailonlineitemclose" @click="removeSource(page)"></div>
        </div>
        <div class="simkltvdetailonlineitemlinks">
          <a v-for="stream in streams" target="_blank" :href="stream.url" class="simkltvdetailonlineitemhref">{{stream.title}}</a>
        </div>
      </div>

    </div>
  </div>
</template>

<script type="text/javascript">
  export default {
    data: () => ({
      streamUrl: null,
      continueUrl: null,
      resumeUrl: null,
      links: null,
      pageSearch: null,
      classes: {
        minimized: true,
        search: false,
      }
    }),
    methods: {
      lang: api.storage.lang,
      favicon: utils.favicon,
      assetUrl: api.storage.assetUrl,
      getMal2KissFavicon: function(streams){
        try{
          return utils.favicon(streams[Object.keys(streams)[0]].url.split('/')[2]);
        }catch(e){
          con.error(e);
          return '';
        }
      },
      toggleSearch: function(){
        this.classes.search = !this.classes.search;
      },
      pressMinimized: function(){
        if(this.links === null || Object.keys(this.links).length){
          this.toggleMinimized();
        }else{
          this.toggleSearch();
        }
      },
      toggleMinimized: function(){
        this.classes.minimized = !this.classes.minimized;
        if(this.classes.search && this.classes.minimized) this.toggleSearch();
      },
      removeSource: function(key){
        api.settings.set(key, false);
        this.$delete(this.links, key);
      }
    }
  }
</script>

<style lang="less" scoped>
  .Sources{
    min-width: 178px;
  }
</style>
