<template>
  <div>
    <div>
      MyAnimeList <br>
      {{listProvider.mal.text}} <br>
      <span v-if="listProvider.mal.list">List: {{listProvider.mal.list.length}}</span><br>
      <br>
    </div>
    <div>
      AniList <br>
      {{listProvider.anilist.text}} <br>
      <span v-if="listProvider.anilist.list">List: {{listProvider.anilist.list.length}}</span><br>
      <br>
    </div>
    <div>
      Kitsu <br>
      {{listProvider.kitsu.text}} <br>
      <span v-if="listProvider.kitsu.list">List: {{listProvider.kitsu.list.length}}</span><br>
      <br>
    </div>

    <div v-for="(item, index) in list" v-bind:key="index" style="border: 1px solid black; display: flex;">
      <div style="width: 50px; border-right: 1px solid black;">
        {{index}}
      </div>
      <div class="master" v-if="item.master && item.master.uid" style="background-color: #ffd5d5; border-right: 1px solid black; padding: 5px 10px; width: 70px;">
        ID: {{item.master.uid}}<br>
        EP: {{item.master.watchedEp}}
      </div>
      <div class="slave" v-for="slave in item.slaves" v-bind:key="slave.uid" style="border-right: 1px solid black; padding: 5px 10px; width: 70px;">
        ID: {{slave.uid}}<br>
        EP: {{slave.watchedEp}}
      </div>
    </div>


  </div>
</template>

<script type="text/javascript">
  import * as provider from "./../../../provider/provider.ts";
  import * as mal from "./../../../provider/MyAnimeList/entryClass.ts";
  import * as malUserList from "./../../../provider/MyAnimeList/userList.ts";
  import * as anilist from "./../../../provider/AniList/entryClass.ts";
  import * as anilistUserList from "./../../../provider/AniList/userList.ts";
  import * as kitsu from "./../../../provider/Kitsu/entryClass.ts";
  import * as kitsuUserList from "./../../../provider/Kitsu/userList.ts";

  export default {
    data: function(){
      return {
        listProvider: {
          mal: {
            text: 'Init',
            list: null
          },
          anilist: {
            text: 'Init',
            list: null
          },
          kitsu: {
            text: 'Init',
            list: null
          }
        },
        list: {},
      };
    },
    mounted: async function(){
      var type = 'anime';
      var listP = [];

      this.listProvider.mal.text = 'Loading';
      listP.push( getList(malUserList, type).then((list) => {
        this.listProvider.mal.list = list;
        this.listProvider.mal.text = 'Done';
      }) );

      this.listProvider.anilist.text = 'Loading';
      listP.push( getList(anilistUserList, type).then((list) => {
        this.listProvider.anilist.list = list;
        this.listProvider.anilist.text = 'Done';
      }) );

      this.listProvider.kitsu.text = 'Loading';
      listP.push( getList(kitsuUserList, type).then((list) => {
        this.listProvider.kitsu.list = list;
        this.listProvider.kitsu.text = 'Done';
      }) );

      await Promise.all(listP);

      this.mapToArray(this.listProvider.mal.list, this.list, true);
      this.mapToArray(this.listProvider.anilist.list, this.list, false);
      this.mapToArray(this.listProvider.kitsu.list, this.list, false);

    },
    destroyed: function(){
    },
    watch: {
    },
    methods: {
      lang: api.storage.lang,
      mapToArray: function(provierList, resultList, masterM = false){

        for (var i = 0; i < provierList.length; i++) {
          var el = provierList[i];
          var temp = resultList[el.malId];
          if(typeof temp === "undefined"){
            temp = {
              master: {},
              slaves: []
            };
          }

          if(masterM){
            temp.master = el;
          }else{
            temp.slaves.push(el);
          }
          this.$set(resultList, el.malId, temp);
        }
      }

    }
  }

  function getList(prov, type){
    return new Promise((resolve, reject) => {
      prov.userList(7, type, {fullListCallback: async function(list){
        con.log('list', list);
        resolve(list)
      }});
    });
  }


</script>
