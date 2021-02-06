<template>
  <li class="mdl-list__item">
    <span class="mdl-list__item-primary-content" @click="init()">
      {{ pageName }}
      <i v-if="username" class="material-icons">check_circle_outline</i>
      <i v-else class="material-icons wrong">highlight_off</i>
    </span>
    <span class="mdl-list__item-secondary-action">
      <template v-if="username && listObj.deauth">
        <i
          class="material-icons"
          style="color: black; cursor: pointer; vertical-align: middle; margin-top: -4px;"
          @click="deauth()"
        >
          eject
        </i>
      </template>
      <a target="_blank" :href="pageAuth">
        <template v-if="username">
          {{ username }}
        </template>
        <template v-else>
          {{ lang('settings_Authenticate') }}
        </template>
      </a>
    </span>
  </li>
</template>

<style lang="less" scoped>
.material-icons {
  margin-left: 5px;
  &.wrong {
    color: red;
    cursor: pointer;
  }
}
</style>

<script type="text/javascript">
import { getListbyType } from '../../../_provider/listFactory';

export default {
  props: {
    option: {
      type: String,
    },
  },
  data() {
    return {
      username: '',
      listObj: null,
    };
  },
  computed: {
    mode: {
      get() {
        return api.settings.get(this.option);
      },
      set() {},
    },
    pageName() {
      if (this.listObj) return this.listObj.name;
      return 'Loading';
    },
    pageAuth() {
      if (this.listObj) return this.listObj.authenticationUrl;
      return '';
    },
  },
  watch: {
    mode() {
      this.init();
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    lang: api.storage.lang,
    init() {
      this.username = '';
      this.listObj = getListbyType(this.mode);
      return this.listObj.getUsername().then(username => {
        this.username = username;
      });
    },
    deauth() {
      this.listObj
        .deauth()
        .then(() => {
          this.init();
        })
        .catch(() => {
          alert('Failed');
        });
    },
  },
};
</script>
