<template>
  <div class="mdl-grid bg-cell" style="display: block;">
    <button type="button" :disabled="animeLoading" @click="cleanTags()" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" style="margin-bottom: 20px;">Clean Up Mal-Sync Tags</button><br>
    Anime:
    <span v-if="animeLoading && !animelistLength">Loading</span>
    <span v-if="animelistLength">{{animelistLength - animelist.length}}/{{animelistLength}}</span>
    <br>
    Manga:
    <span v-if="mangaLoading && !mangalistLength">Loading</span>
    <span v-if="mangalistLength">{{mangalistLength - mangalist.length}}/{{mangalistLength}}</span>

  </div>
</template>

<script type="text/javascript">
  import * as provider from "./../../../provider/provider.ts";

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
    return entryClass.init();
  }

  function getList(type){
    return new Promise((resolve, reject) => {
      provider.userList(7, type, {
        fullListCallback: async (list) => {
          con.log('list', list);
          resolve(list)
        }
      });
    });
  }


</script>
