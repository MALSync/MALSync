<template>
  <div>
    <button class="mdl-button mdl-js-button mdl-button--primary refresh-updateCheck" @click="load()">
      {{ lang('updateCheck_Refresh') }}
    </button>
    <button class="mdl-button mdl-js-button mdl-button--accent startCheck-updateCheck" @click="startCheck()">
      {{ lang('updateCheck_StartCheck') }}
    </button>
    <button class="mdl-button mdl-js-button mdl-button--accent notification-updateCheck" @click="notificationTest()">
      {{ lang('updateCheck_NotificationCheck') }}
    </button>
    <select v-model="listType" style="float: right;" class="typeSelect-updateCheck">
      <option value="anime">Anime</option>
      <option value="manga">Manga</option>
    </select>
    <table
      class="mdl-data-table mdl-js-data-table mdl-data-table__cell--non-numeric mdl-shadow--2dp"
      style="white-space: normal;"
    >
      <tr>
        <th class="mdl-data-table__cell--non-numeric"></th>
        <th>{{ lang('updateCheck_Episode') }}</th>
        <th>{{ lang('updateCheck_Message') }}</th>
      </tr>
      <tr v-for="item in items" :key="item.uid" :style="{ backgroundColor: item.trColor }">
        <th class="mdl-data-table__cell--non-numeric">
          <button class="mdl-button mdl-js-button mdl-button--icon delete-updateCheck" @click="deleteItem(item)">
            <i class="material-icons">delete</i>
          </button>
          <a :href="item.url" style="color: black;">
            {{ item.title }}
          </a>
        </th>
        <th>{{ item.episode }}</th>
        <th>{{ item.error }}</th>
      </tr>
    </table>

    <div class="history">
      <h3>{{ lang('updateCheck_NotificationHistory') }}</h3>
      <a
        v-for="historyItem in history"
        :key="historyItem.id"
        :href="historyItem.url"
        class="mdl-cell bg-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--2dp mdl-grid"
        style="text-decoration: none !important; color: black;"
      >
        <img
          :src="historyItem.iconUrl"
          style="margin: -8px 0 -8px -8px; height: 100px; width: 64px; background-color: grey;"
        />
        <div style="flex-grow: 100; cursor: pointer; margin-top: 0; margin-bottom: 0;" class="mdl-cell">
          <span style="font-size: 20px; font-weight: 400; line-height: 1;">{{ historyItem.title }}</span>
          <p style="margin-bottom: 0; line-height: 20px; padding-top: 3px;">
            {{ historyItem.message }}
          </p>
          <p style="margin-bottom: 0; line-height: 20px;">
            {{ historyItem.timeDiff }}
          </p>
        </div>
      </a>
    </div>
  </div>
</template>

<script type="text/javascript">
import { getList } from '../../_provider/listFactory';

let interva;
export default {
  data() {
    return {
      listType: 'anime',
      items: [],
      history: [],
    };
  },
  watch: {
    listType() {
      this.load();
    },
  },
  mounted() {
    this.load();
    interva = setInterval(() => {
      this.load();
    }, 5000);
  },
  destroyed() {
    clearInterval(interva);
  },
  methods: {
    lang: api.storage.lang,
    async load() {
      const listProvider = await getList(1, this.listType);
      listProvider
        .getCompleteList()
        .then(async list => {
          for (let i = 0; i < list.length; i++) {
            const el = list[i];
            let episode = '';
            let error = '';
            let trColor = '';
            con.log('el', el);
            const elCache = await api.storage.get(`updateCheck/${this.listType}/${el.cacheKey}`);
            con.log('elCache', elCache);
            if (typeof elCache !== 'undefined') {
              episode = `${elCache.newestEp}/${el.totalEp}`;
              trColor = 'orange';
              if (elCache.finished) {
                error = 'finished';
                trColor = 'green';
              }
              if (typeof elCache.error !== 'undefined') {
                error = elCache.error;
                trColor = 'red';
              }
            }
            el.episode = episode;
            el.trColor = trColor;
            el.error = error;
          }
          this.items = list;
        })
        .catch(e => {
          con.error(e);
          listProvider.flashmError(e);
        });

      api.storage.get('notificationHistory').then(history => {
        history.forEach(entry => {
          let timeDiff = Date.now() - entry.timestamp;

          timeDiff = utils.timeDiffToText(timeDiff);
          timeDiff += 'ago';
          entry.timeDiff = timeDiff;
        });

        this.history = history.reverse();
      });
    },
    deleteItem(item) {
      const delPath = `updateCheck/${this.listType}/${item.cacheKey}`;
      con.log('delete', delPath, item);
      api.storage.remove(delPath);
      item.trColor = 'black';
    },
    notificationTest() {
      utils.notifications(
        'https://malsync.lolamtisch.de/',
        'MyAnimeList-Sync',
        'by lolamtisch',
        'https://cdn.myanimelist.net/images/anime/5/65187.jpg',
      );
    },
    startCheck() {
      chrome.alarms.create('updateCheckNow', {
        when: Date.now() + 1000,
      });
      utils.flashm('Check started');
    },
  },
};
</script>
