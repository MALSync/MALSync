<template>
  <div>
    <div
      v-show="loading"
      id="loadMalSearchPop"
      class="mdl-progress mdl-js-progress mdl-progress__indeterminate"
      style="width: 100%; position: fixed; z-index: 30; max-width: 1377px; margin-left: auto; margin-right: auto;"
    >
      <div class="progressbar bar bar1" style="width: 0%;"></div>
      <div class="bufferbar bar bar2" style="width: 100%;"></div>
      <div class="auxbar bar bar3" style="width: 0%;"></div>
    </div>
    <slot></slot>
    <span
      v-if="!loading && !items.length && !errorText"
      class="mdl-chip"
      style="margin: auto; margin-top: 16px; display: table;"
      ><span class="mdl-chip__text">{{ lang('NoEntries') }}</span></span
    >

    <template v-if="!listView">
      <div v-if="!(cache && errorText)" id="malList" class="mdl-grid" style="justify-content: space-around;">
        <template v-for="item in items">
          <bookmarksItem :ref="item.uid" :key="item.uid" :item="item" />
        </template>

        <div
          v-for="n in 10"
          :key="n"
          class="listPlaceholder mdl-cell mdl-cell--2-col mdl-cell--4-col-tablet mdl-cell--6-col-phone mdl-shadow--2dp mdl-grid "
          style="cursor: pointer; padding: 0; width: 210px; height: 0; margin-top:0; margin-bottom:0; visibility: hidden;"
        ></div>
      </div>
    </template>
    <div v-else style="padding: 0 20px 20px 20px">
      <table
        v-if="!(cache && errorText)"
        id="malList"
        class="mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp bg-cell"
        style="width: 100%;"
      >
        <tbody>
          <template v-for="item in items">
            <bookmarksItem :ref="item.uid" :key="item.uid" :item="item" :list-view="listView" />
          </template>
        </tbody>
      </table>
    </div>

    <span
      v-if="errorText"
      class="mdl-chip"
      style="margin: 16px auto 70px auto; display: table; padding-right: 5px; border: 2px solid red;"
      @click="!loading ? load() : ''"
    >
      <span v-dompurify-html="errorText" class="mdl-chip__text"></span>
      <button type="button" class="mdl-chip__action">
        <i class="material-icons">autorenew</i>
      </button>
    </span>
  </div>
</template>

<script type="text/javascript">
import { getList } from '../../_provider/listFactory';
import bookmarksItem from './bookmarksItem.vue';

let cb;

export default {
  components: {
    bookmarksItem,
  },
  props: {
    listType: {
      type: String,
      default: 'anime',
    },
    state: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      items: [],
      loading: true,
      errorText: null,
      cache: false,
      destroyTimer: undefined,
      reload: false,
    };
  },
  computed: {
    listView: {
      get() {
        return api.settings.get('bookMarksList');
      },
      set(value) {
        api.settings.set('bookMarksList', value);
      },
    },
  },
  watch: {
    listType(type) {
      this.load();
    },
    state(state) {
      this.load();
    },
  },
  mounted() {
    this.load();
    this.$parent.registerScroll('books', this.handleScroll);
    clearTimeout(this.destroyTimer);
  },
  activated() {
    this.$nextTick(() => {
      j.$(this.$el)
        .closest('html')
        .find('head')
        .click();
    });
    clearTimeout(this.destroyTimer);
    this.$parent.registerScroll('books', this.handleScroll);
    if (this.reload) {
      this.reload = false;
      this.load();
    }
  },
  deactivated() {
    this.$parent.unregisterScroll('books');
    clearTimeout(this.destroyTimer);
    this.destroyTimer = setTimeout(() => {
      this.items = [];
      this.reload = true;
    }, 30 * 1000);
  },
  methods: {
    lang: api.storage.lang,
    async load() {
      this.loading = true;
      this.cache = true;
      this.errorText = null;
      cb = undefined;
      const listProvider = await getList(this.state, this.listType);

      const listError = e => {
        con.error(e);
        this.errorText = listProvider.errorMessage(e);
        this.loading = false;
      };

      listProvider.modes.cached = true;

      listProvider.getCached().then(list => {
        this.items = list;
      });

      if (this.state !== 1 && this.state !== '1') {
        listProvider.callbacks = {
          // eslint-disable-next-line consistent-return
          continueCall: list => {
            this.loading = false;
            this.cache = false;
            this.items = list;
            if (!listProvider.isDone()) {
              return new Promise(resolve => {
                cb = () => {
                  resolve();
                };
              });
            }
          },
        };
        listProvider.get().catch(listError);
      } else {
        listProvider.modes.sortAiring = true;
        listProvider
          .get()
          .then(list => {
            this.loading = false;
            this.cache = false;
            this.items = list;
          })
          .catch(listError);
      }
    },
    handleScroll(pos) {
      if (pos.pos + pos.elHeight + 1000 > pos.height) {
        if (typeof cb !== 'undefined') {
          this.loading = true;
          cb();
          cb = undefined;
        }
      }
    },
  },
};
</script>
