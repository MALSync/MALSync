<template>
  <div>
    <button @click="load()" class="mdl-button mdl-js-button mdl-button--primary refresh-updateCheck">
      {{lang("updateCheck_Refresh")}}
    </button>
    <button @click="startCheck()" class="mdl-button mdl-js-button mdl-button--accent startCheck-updateCheck">
      {{lang("updateCheck_StartCheck")}}
    </button>
    <button @click="notificationTest()" class="mdl-button mdl-js-button mdl-button--accent notification-updateCheck">
      {{lang("updateCheck_NotificationCheck")}}
    </button>
    <select v-model="listType" style="float: right;" class="typeSelect-updateCheck">
      <option value="anime">Anime</option>
      <option value="manga">Manga</option>
    </select>
    <table class="mdl-data-table mdl-js-data-table mdl-data-table__cell--non-numeric mdl-shadow--2dp">
      <tr>
        <th class="mdl-data-table__cell--non-numeric"></th>
        <th>{{lang("updateCheck_Episode")}}</th>
        <th>{{lang("updateCheck_Message")}}</th>
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
    <div class="history">
      <h3>{{lang("updateCheck_NotificationHistory")}}</h3>
      <a  v-for="historyItem in history" :key="historyItem.id" :href="historyItem.url" class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--2dp mdl-grid" style="text-decoration: none !important; color: black;">
        <img :src="historyItem.iconUrl" style="margin: -8px 0px -8px -8px; height: 100px; width: 64px; background-color: grey;">
        <div style="flex-grow: 100; cursor: pointer; margin-top: 0; margin-bottom: 0;" class="mdl-cell">
          <span style="font-size: 20px; font-weight: 400; line-height: 1;">{{historyItem.title}}</span>
          <p style="margin-bottom: 0; line-height: 20px; padding-top: 3px;">{{historyItem.message}}</p>
          <p style="margin-bottom: 0; line-height: 20px;">{{historyItem.timeDiff}}</p>
        </div>
      </a>
    </div>
  </div>
</template>

<script type="text/javascript">
  import * as provider from "./../../provider/provider.ts";
  var interva;
  export default {
    data: function(){
      return {
        items: [],
        history: [],
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
      lang: api.storage.lang,
      load: function(){
        provider.userList(1, this.listType, {
          fullListCallback: async (list) => {
            for (var i = 0; i < list.length; i++) {
              var el = list[i];
              var episode = '';
              var error = '';
              var trColor = '';
              con.log('el', el);
              var elCache = await api.storage.get('updateCheck/'+this.listType+'/'+el.malId);
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
        api.storage.get('notificationHistory').then((history) => {
          var historyHtml = '<h3>Notification History</h3>';
          history.forEach((entry) => {
            var timeDiff = Date.now() - entry.timestamp;

            timeDiff = utils.timeDiffToText(timeDiff);
            timeDiff += 'ago';
            entry.timeDiff = timeDiff;
          });

          this.history = history.reverse();
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
