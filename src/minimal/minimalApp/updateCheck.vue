<template>
  <div>
    <button @click="load()" class="mdl-button mdl-js-button mdl-button--primary refresh-updateCheck">
      Refresh
    </button>
    <button @click="startCheck()" class="mdl-button mdl-js-button mdl-button--accent startCheck-updateCheck">
      Start Check
    </button>
    <button @click="notificationTest()" class="mdl-button mdl-js-button mdl-button--accent notification-updateCheck">
      Notification Check
    </button>
    <select v-model="listType" style="float: right;" class="typeSelect-updateCheck">
      <option value="anime">Anime</option>
      <option value="manga">Manga</option>
    </select>
    <table class="mdl-data-table mdl-js-data-table mdl-data-table__cell--non-numeric mdl-shadow--2dp">
      <tr>
        <th class="mdl-data-table__cell--non-numeric"></th>
        <th>Episode</th>
        <th>Message</th>
      </tr>
      <tr v-for="item in items" :key="item.id" v-bind:style="{ backgroundColor: item.trColor}">
        <th class="mdl-data-table__cell--non-numeric">
          <button @click="deleteItem(item)" class="mdl-button mdl-js-button mdl-button--icon delete-updateCheck" ><i class="material-icons">delete</i></button>
          <a :href="item.url" style="color: black;">
            {{item.title}}
          </a>
        </th>
        <th>{{item.episode}}</th>
        <th>{{item.error}}</th>
      </tr>
    </table>
  </div>
</template>

<script type="text/javascript">
  import * as provider from "./../../provider/provider.ts";
  var interva;
  export default {
    data: function(){
      return {
        items: [],
      }
    },
    props: {
      listType: {
        type: String,
        default: 'anime'
      }
    },
    mounted: function(){
      this.load();
      interva = setInterval(() => {
        this.load();
      }, 5000);
    },
    destroyed: function(){
      clearInterval(interva);
    },
    watch: {
      listType: function(type){
        this.load();
      },
    },
    methods: {
      load: function(){
        provider.userList(1, this.listType, {
          fullListCallback: async (list) => {
            for (var i = 0; i < list.length; i++) {
              var el = list[i];
              var episode = '';
              var error = '';
              var trColor = '';
              con.log('el', el);
              var elCache = await api.storage.get('updateCheck/'+this.listType+'/'+el.id);
              con.log('elCache', elCache);
              if(typeof elCache != 'undefined'){
                episode = elCache['newestEp']+'/'+el.totalEp;
                trColor = 'orange';
                if(elCache['finished']){
                  error = 'finished';
                  trColor = 'green';
                }
                if(typeof elCache['error'] != 'undefined'){
                  error = elCache['error'];
                  trColor = 'red';
                }
              }
              el.episode = episode;
              el.trColor = trColor;
              el.error = error;
            }
            this.items = list;
          }
        });
      },
      deleteItem(item){
        var delPath = 'updateCheck/'+this.listType+'/'+item.id;
        con.log('delete', delPath, item);
        api.storage.remove(delPath);
        item.trColor = 'black';
      },
      notificationTest(){
        utils.notifications(
          'https://malsync.lolamtisch.de/',
          'MyAnimeList-Sync',
          'by lolamtisch',
          'https://cdn.myanimelist.net/images/anime/5/65187.jpg'
        );
      },
      startCheck(){
        chrome.alarms.create("updateCheckNow", {
          when: Date.now() + 1000
        });
        utils.flashm("Check started");
      }
    }
  }
</script>
