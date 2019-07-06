<template>
  <div class="simkltvdetailonline" id="malkiss" v-bind:class="{ Minimized: classes.minimized, Search: classes.search }">
    <div class="simkltvdetailonlinehead">
      <div class="simkltvdetailonlineheadleft">
        <div class="simkltvdetailonlineheadtitle">Stream online:</div>
        <a href="#" target="_blank" class="simkltvdetailonlineheadbutton">
          <div class="simkltvdetailonlineheadbuttonimage"><img src="https://www.google.com/s2/favicons?domain=www.crunchyroll.com" alt=""></div>
          <div class="simkltvdetailonlineheadbuttontitle">Watch next episode</div>
          <div class="simkltvdetailonlineheadbuttonico"></div>
        </a>
        <div class="simkltvdetailonlineheadbutton Sources" @click="toggleMinimized()" v-if="links === null || Object.keys(links).length">
          <div class="simkltvdetailonlineheadbuttontitle" v-if="links !== null && Object.keys(links).length">{{Object.keys(links).length}} streaming sources</div>
          <div class="simkltvdetailonlineheadbuttontitle" v-else>Loading</div>
          <div class="simkltvdetailonlineheadbuttonicoarrow"></div>
        </div>
        <div class="simkltvdetailonlineheadbutton Search" @click="toggleSearch()">
          <div class="simkltvdetailonlineheadbuttontitle">Search</div>
          <div class="simkltvdetailonlineheadbuttonicoarrow"></div>
        </div>
      </div>
      <div class="simkltvdetailonlineheadright" @click="toggleMinimized()">
        <div class="simkltvdetailonlineheadrightclose">
          <div class="simkltvdetailonlineheadrightname" style="--data-online-block-title:'MAL-Sync';"></div>
          <div class="simkltvdetailonlineheadrightcloseico"></div>
        </div>
      </div>
    </div>
    <div class="simkltvdetailonlineitems Search">
      <div class="simkltvdetailonlineitemsearch">
        <a href="#" class="simkltvdetailonlineitemsearchhref">
          <div class="simkltvdetailonlineitemsearchico"><img src="https://www.google.com/s2/favicons?domain=www2.9anime.to" alt="" class="simkltvdetailonlineitemsearchicoimg"></div>
          <div class="simkltvdetailonlineitemsearchtitle">9anime</div>
        </a>
        <a href="#" target="_blank" class="simkltvdetailonlineitemsearchgoogle"></a>
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


  <!--<div id="malkiss">
    <div>
      streamUrl: {{streamUrl}}
    </div>
    <div>
      continueUrl: {{continueUrl}}
    </div>
    <div>
      resumeUrl: {{resumeUrl}}
    </div>
    <div v-show="links && Object.keys(links).length">
      <ul>
        <li class="mdl-list__item mdl-list__item--three-line" v-for="(streams, page) in links">
          <span class="mdl-list__item-primary-content">
            <span>
              <img style="padding-bottom: 3px;" :src="getMal2KissFavicon(streams)">
              {{ page }}
            </span>
            <span id="KissAnimeLinks" class="mdl-list__item-text-body">
              <div class="mal_links" v-for="stream in streams">
                <a target="_blank" :href="stream.url">{{stream.title}}</a>
              </div>
            </span>
          </span>
        </li>
      </ul>
    </div>
  </div>-->
</template>

<script type="text/javascript">
  export default {
    data: () => ({
      streamUrl: null,
      continueUrl: null,
      resumeUrl: null,
      links: null,
      classes: {
        minimized: true,
        search: false,
      }
    }),
    methods: {
      lang: api.storage.lang,
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
