<template>
  <div id="quicklinkedit">
    <backbutton />
    <div class="mdl-cell bg-cell mdl-cell--12-col" style="padding: 10px 15px;">
      <input v-model="search" type="text" class="mdl-textfield__input" placeholder="Search" />
    </div>
    <div class="quicklinks mdl-cell bg-cell mdl-cell--12-col" style="padding: 15px;">
      <div
        v-for="link in linksWithState"
        :key="link.name"
        class="mdl-chip quicklink"
        :class="{
          active: link.active,
          custom: link.custom,
          database: link.database,
          search: link.search && !(link.search.anime === 'home' || link.search.manga === 'home'),
          home: link.search && (link.search.anime === 'home' || link.search.manga === 'home'),
        }"
        @click="toggleLink(link)"
      >
        <img style="padding-bottom: 3px; margin-right: 5px;" :src="favicon(link.domain)" height="16" width="16" />
        {{ link.name }}
      </div>
    </div>
    <div class="custom mdl-cell bg-cell mdl-cell--12-col">
      <div class="mdl-card__title mdl-card--border">
        <h2 class="mdl-card__title-text">Custom Searchlinks</h2>
      </div>
      <li class="mdl-list__item">
        <table>
          <tr>
            <td><span class="darkbox">{searchterm}</span></td>
            <td>=> <span class="darkbox">no%20game%20no%20life</span></td>
          </tr>
          <tr>
            <td><span class="darkbox">{searchtermPlus}</span></td>
            <td>=> <span class="darkbox">no+game+no+life</span></td>
          </tr>
          <tr>
            <td><span class="darkbox">{searchtermRaw}</span></td>
            <td>=> <span class="darkbox">no game no life</span></td>
          </tr>
        </table>
      </li>
      <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
        <span class="mdl-list__item-primary-content">
          <span>Name: </span>
          <span class="mdl-list__item-text-body">
            <input v-model="custom_name" type="text" class="mdl-textfield__input" style="outline: none;" />
          </span>
        </span>
      </li>
      <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
        <span class="mdl-list__item-primary-content">
          <span>Anime Search Url: </span>
          <span class="mdl-list__item-text-body">
            <input v-model="custom_anime" type="text" class="mdl-textfield__input" style="outline: none;" />
          </span>
        </span>
      </li>
      <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
        <span class="mdl-list__item-primary-content">
          <span>Manga Search Url: </span>
          <span class="mdl-list__item-text-body">
            <input v-model="custom_manga" type="text" class="mdl-textfield__input" style="outline: none;" />
          </span>
        </span>
      </li>

      <input
        :disabled="!this.custom_name"
        type="button"
        value="Add"
        class="inputButton btn-middle flat js-anime-update-button mdl-button mdl-js-button mdl-button--raised mdl-button--colored"
        style="margin: 15px;"
        @click="addCustom"
      />
    </div>
  </div>
</template>

<script type="text/javascript">
// eslint-disable-next-line import/no-unresolved
import quicklinks from '../../../utils/quicklinks.json';
import backbutton from './backbutton.vue';
import { removeOptionKey } from '../../../utils/quicklinksBuilder';

export default {
  components: {
    backbutton,
  },
  data() {
    return {
      quicklinks,
      search: '',
      custom_name: '',
      custom_anime: '',
      custom_manga: '',
    };
  },
  computed: {
    linksWithState() {
      return [...this.quicklinks, ...this.value.filter(el => typeof el === 'object' && el)]
        .filter(el => {
          if (!this.search) return true;
          return el.name.toLowerCase().includes(this.search.toLowerCase());
        })
        .map(el => {
          el.active = this.value.includes(el.name) || el.custom;
          return el;
        })
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => {
          return this.stateNumber(a) - this.stateNumber(b);
        });
    },
    value: {
      get() {
        return api.settings.get('quicklinks');
      },
      set(value) {
        api.settings.set('quicklinks', value);
        this.$emit('changed', value);
      },
    },
  },
  methods: {
    lang: api.storage.lang,
    favicon(url) {
      try {
        return utils.favicon(url);
      } catch (e) {
        con.error(e);
        return '';
      }
    },
    toggleLink(link) {
      if (link.active) {
        if (link.custom) {
          this.custom_name = link.name;
          this.custom_anime = link.search.anime;
          this.custom_manga = link.search.manga;
        }
        this.value = removeOptionKey(this.value, link.name);
      } else {
        this.value.push(link.name);
      }
      this.value = [...this.value];
    },
    stateNumber(link) {
      if (link.custom) return 0;
      if (link.database) return 1;
      if (link.search && !(link.search.anime === 'home' || link.search.manga === 'home')) return 2;
      return 10;
    },
    addCustom() {
      let domain = '';
      if (this.custom_anime || this.custom_manga) {
        let domainParts;
        if (this.custom_anime) {
          domainParts = this.custom_anime.split('/');
        } else {
          domainParts = this.custom_manga.split('/');
        }
        if (domainParts.length > 2) {
          domain = `${domainParts[0]}//${domainParts[2]}/`;
        }
      }

      if (!domain) {
        utils.flashm('Something is wrong', { error: true });
        return;
      }

      const res = {
        name: this.custom_name,
        custom: true,
        domain,
        search: {
          anime: this.custom_anime ? this.custom_anime : null,
          manga: this.custom_manga ? this.custom_manga : null,
        },
      };

      this.value = [...this.value, res];
      this.custom_name = '';
      this.custom_anime = '';
      this.custom_manga = '';
    },
  },
};
</script>
