<template>
  <div class="mdl-grid bg-cell" style="display: block;">
    <h5>This script removes all malsync::xxxxx:: from your list.</h5>
    <button type="button" :disabled="animeLoading" @click="cleanTags()" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" style="margin-bottom: 20px;">Clean Up Mal-Sync Tags</button>
    <br>
    Anime:
    <span v-if="animeLoading && !animelistLength">Loading</span>
    <span v-if="animelistLength">{{animelistLength - animelist.length}}/{{animelistLength}}</span>
    <br>
    Manga:
    <span v-if="mangaLoading && !mangalistLength">Loading</span>
    <span v-if="mangalistLength">{{mangalistLength - mangalist.length}}/{{mangalistLength}}</span><br>

  </div>
</template>

<script type="text/javascript">
  import * as provider from "./../../../provider/provider.ts";
  import {getOnlyList} from "./../../../_provider/listFactory";

  export default {
    data: function(){
      return {
        animeLoading: false,
        animelist: null,
        animelistLength: null,
        mangaLoading: false,
        mangalist: null,
        mangalistLength: null,
      };
    },
    props: {
    },
    mounted: async function(){
    },
    destroyed: function(){
    },
    watch: {
    },
    computed: {
    },
    methods: {
      lang: api.storage.lang,
      cleanTags: function() {
        this.animeLoading = true;
        getList('anime').then(async (list) => {
          this.animelist = list;
          this.animelistLength = this.animelist.length;

          while(this.animelist.length){
            var anime = this.animelist.pop();
            var streamUrl = utils.getUrlFromTags(anime.tags);

            if(typeof streamUrl !== 'undefined'){
              console.log(streamUrl);
              await cleanTags(anime.url);
            }
          }
          return;
        }).then(() => {
          return getList('manga');
        }).then(async (list) => {
          this.mangalist = list;
          this.mangalistLength = this.mangalist.length;

          while(this.mangalist.length){
            var manga = this.mangalist.pop();
            var streamUrl = utils.getUrlFromTags(manga.tags);

            if(typeof streamUrl !== 'undefined'){
              await cleanTags(manga.url);
            }
          }
          return;
        });
      }
    }
  }

  async function cleanTags(url){
    var entryClass = new provider.entryClass(url, true, true);
    return entryClass.init().then( () => {
      entryClass.setStreamingUrl('');
      return entryClass.sync();
    });
  }

  function getList(type){
    var listProvider = getOnlyList(7, type);
    return listProvider.get().then( (list) => {return list;})
    .catch((e) => {
      con.error(e);
      throw listProvider.errorMessage(e);
    })
  }


</script>
