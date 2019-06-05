<template>
  <div>
    <div :style="getTypeColor(getType('myanimelist.net'))" style="display: inline-block; margin-right: 40px; padding-left: 10px; margin-bottom: 20px;">
      MyAnimeList <br>
      {{listProvider.mal.text}} <br>
      <span v-if="listProvider.mal.list">List: {{listProvider.mal.list.length}}</span><br>
      <br>
    </div>
    <div :style="getTypeColor(getType('anilist.co'))" style="display: inline-block; margin-right: 40px; padding-left: 10px; margin-bottom: 20px;">
      AniList <br>
      {{listProvider.anilist.text}} <br>
      <span v-if="listProvider.anilist.list">List: {{listProvider.anilist.list.length}}</span><br>
      <br>
    </div>
    <div :style="getTypeColor(getType('kitsu.io'))" style="display: inline-block; margin-right: 40px; padding-left: 10px; margin-bottom: 20px;">
      Kitsu <br>
      {{listProvider.kitsu.text}} <br>
      <span v-if="listProvider.kitsu.list">List: {{listProvider.kitsu.list.length}}</span><br>
      <br>
    </div><br>

    <button type="button" :disabled="!listReady" @click="syncList()" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" style="margin-bottom: 20px;">Sync</button>
    <span v-if="listLength">{{listLength - listSyncLength}}/{{listLength}}</span>

    <div v-if="item.diff" v-for="(item, index) in list" v-bind:key="index" style="border: 1px solid black; display: flex;">
      <div style="width: 50px; border-right: 1px solid black;">
        {{index}}
      </div>
      <div class="master" v-if="item.master && item.master.uid" :style="getTypeColor(getType(item.master.url))" style="background-color: #ffd5d5; border-right: 1px solid black; padding: 5px 10px; width: 70px;">
        ID: <a target="_blank" :href="item.master.url">{{item.master.uid}}</a><br>
        EP: {{item.master.watchedEp}}<br>
        Status: {{item.master.status}}<br>
        Score: {{item.master.score}}
      </div>
      <div class="slave" v-for="slave in item.slaves" v-bind:key="slave.uid" :style="getTypeColor(getType(slave.url))" style="border-right: 1px solid black; padding: 5px 10px; width: 100px;">
        ID: <a target="_blank" :href="slave.url">{{slave.uid}}</a><br>
        EP: {{slave.watchedEp}}
          <span v-if="slave.diff && slave.diff.watchedEp" style="color: green;">→ {{slave.diff.watchedEp}}</span><br>
        Status: {{slave.status}}
          <span v-if="slave.diff && slave.diff.status" style="color: green;">→ {{slave.diff.status}}</span><br>
        Score: {{slave.score}}
          <span v-if="slave.diff && slave.diff.score" style="color: green;">→ {{slave.diff.score}}</span>
      </div>
    </div>

    <div v-if="missing.length">
      <h2>Missing</h2>
      <div v-for="item in missing"  style="border: 1px solid black; display: flex;">
        <div style="width: 50px; border-right: 1px solid black;">
          {{item.malId}}
        </div>
        <div :style="getTypeColor(item.syncType)" style="padding: 5px 10px;">
          {{item.title}}<br>
          EP: {{item.watchedEp}}<br>
          Status: {{item.status}}<br>
          Score: {{item.score}}
        </div>
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
        listReady: false,
        listLength: 0,
        list: {},
        missing: [],
      };
    },
    mounted: async function(){
      var type = 'anime';
      var mode = 'mirror';
      var typeArray = ['MAL', 'ANILIST', 'KITSU'];
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

      for (var i in this.list) {
        changeCheck(this.list[i], mode);
        missingCheck(this.list[i], this.missing, typeArray, mode);
      }

      this.listReady = true;
    },
    destroyed: function(){
    },
    watch: {
    },
    computed: {
      listSyncLength: function(){
        return Object.values(this.list).filter(el => el.diff).length;
      }
    },
    methods: {
      lang: api.storage.lang,
      getType: getType,
      getTypeColor: function(type){
        if(type == 'ANILIST') return 'border-left: 5px solid #02a9ff';
        if(type == 'KITSU') return 'border-left: 5px solid #f75239';
        return 'border-left: 5px solid #2e51a2';
      },
      mapToArray: function(provierList, resultList, masterM = false){

        for (var i = 0; i < provierList.length; i++) {
          var el = provierList[i];
          var temp = resultList[el.malId];
          if(typeof temp === "undefined"){
            temp = {
              diff: false,
              master: {},
              slaves: []
            };
          }

          if(masterM){
            temp.master = el;
          }else{
            el.diff = {};
            temp.slaves.push(el);
          }
          this.$set(resultList, el.malId, temp);
        }
      },

      syncList: async function(){
        this.listReady = false;
        this.listLength = this.listSyncLength;

        for (var i in this.list) {
          var el = this.list[i];
          if(el.diff){
            await syncListItem(el);
            el.diff = false;
          }
        }

        var missing = this.missing.slice();
        for (var i in missing) {
          var miss = missing[i];
          con.log("Sync missing", miss);
          await syncMissing(miss)
            .then(() => {
              this.missing.splice(this.missing.indexOf(miss), 1);
            })
            .catch((e) => {
              con.error('Error', e)
            });
        }
      },

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

  async function syncListItem(item){
    for (var i = 0; i < item.slaves.length; i++) {
      var slave = item.slaves[i];
      await syncItem(slave, getType(slave.url));
    }
  }

  async function syncMissing(item){
    item.diff = {
      watchedEp: item.watchedEp,
      status: item.status,
      score: item.score
    };
    return syncItem(item, item.syncType);
  }

  function syncItem(slave, pageType){
    if(Object.keys(slave.diff).length !== 0){
      if(pageType == 'MAL'){
        var entryClass = new mal.entryClass(slave.url);
      }else if(pageType == 'ANILIST'){
        var entryClass = new anilist.entryClass(slave.url);
      }else if(pageType == 'KITSU'){
        var entryClass = new kitsu.entryClass(slave.url);
      }else{
        throw('No sync type');
      }

      return entryClass.init().then(() => {
        if(typeof slave.diff.watchedEp !== "undefined") entryClass.setEpisode(slave.diff.watchedEp);
        if(typeof slave.diff.status !== "undefined") entryClass.setStatus(slave.diff.status);
        if(typeof slave.diff.score !== "undefined") entryClass.setScore(slave.diff.score);
        //return entryClass.sync();
      });
    }
  }

  function changeCheck(item, mode){
    if(item.master && item.master.uid){;
      for (var i = 0; i < item.slaves.length; i++) {
        var slave = item.slaves[i];
        if(slave.watchedEp !== item.master.watchedEp){
          item.diff = true;
          slave.diff.watchedEp = item.master.watchedEp;
        }
        if(slave.status !== item.master.status){
          item.diff = true;
          slave.diff.status = item.master.status;
        }
        if(slave.rating !== item.master.rating){
          item.diff = true;
          slave.diff.rating = item.master.rating;
        }
      }
    }

  }

  function missingCheck(item, missing, types, mode){
    if(item.master && item.master.uid){
      var tempTypes = [];
      tempTypes.push(getType(item.master.url));
      for (var i = 0; i < item.slaves.length; i++) {
        var slave = item.slaves[i];
        tempTypes.push(getType(slave.url));
      }
      for (var t in types) {
        var type = types[t];
        if(!tempTypes.includes(type)){
          missing.push({
            'title': item.master.title,
            'syncType': type,
            'malId': item.master.malId,
            'watchedEp': item.master.watchedEp,
            'score': item.master.score,
            'status': item.master.status,
            'url': 'https://myanimelist.net/'+item.master.type+'/'+item.master.malId
          })
        }
      }
    }
  }

  function getType(url){
    if(url.indexOf('anilist.co') !== -1) return 'ANILIST';
    if(url.indexOf('kitsu.io') !== -1) return 'KITSU';
    return 'MAL';
  }

</script>
