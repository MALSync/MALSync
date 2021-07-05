<template>
  <div>
    <backbutton />
    <div class="mdl-grid" style="display: block;">
      <div class="mdl-cell bg-cell mdl-cell--12-col">
        <div v-for="page in pages" :key="page.name">
          <li class="mdl-list__item" style="padding-top: 0; padding-bottom: 0;">
            <span class="mdl-list__item-primary-content">
              <a :href="getDomain(page)">
                <img :src="favicon(getDomain(page))" height="16" width="16" style="margin-right: 5px;" />
                {{ page.name }}
              </a>
            </span>
            <span class="mdl-list__item-secondary-action">
              <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" :for="page.name">
                <input
                  :id="page.name"
                  type="checkbox"
                  class="mdl-switch__input"
                  :checked="getPageState(page)"
                  @change="setPageState(page, $event.target.checked)"
                />
              </label>
            </span>
          </li>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import { pages } from '../../pages/pages';
import backbutton from './components/backbutton.vue';

export default {
  components: {
    backbutton,
  },
  props: {},
  data() {
    return {
      pages,
    };
  },
  computed: {
    enablePages() {
      return api.settings.get('enablePages');
    },
  },
  watch: {},
  async mounted() {
    this.$root.updateDom();
  },
  methods: {
    favicon: utils.favicon,
    lang: api.storage.lang,
    getDomain(page) {
      let domain;
      if (typeof page.domain === 'object') {
        domain = page.domain[0];
      } else {
        // eslint-disable-next-line
        domain = page.domain;
      }
      return domain;
    },
    getPageState(page) {
      if (typeof this.enablePages[page.name] === 'undefined' || this.enablePages[page.name]) return true;
      return false;
    },
    setPageState(page, state) {
      const curState = JSON.parse(JSON.stringify(this.enablePages));
      curState[page.name] = state;
      api.settings.set('enablePages', curState);
    },
  },
};
</script>
