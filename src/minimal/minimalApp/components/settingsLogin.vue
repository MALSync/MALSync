<template>
  <li class="mdl-list__item">
    <span class="mdl-list__item-primary-content" @click="init()">
      {{pageName}}
      <i class="material-icons" v-if="username">check_circle_outline</i>
      <i class="material-icons wrong" v-else>highlight_off</i>

    </span>
    <span class="mdl-list__item-secondary-action">
      <a target="_blank" :href="pageAuth">
        <template v-if="username">
          {{username}}
        </template>
        <template v-else>
          {{lang("settings_Authenticate")}}
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
  import {getListbyType} from "./../../../_provider/listFactory";

  export default {
    data: function(){
      return{
        username: '',
        listObj: null,
      }
    },
    props: {
      option: {
        type: String
      },
    },
    mounted: function(){
      this.init();
    },
    computed: {
      mode: {
        get: function () {
          return api.settings.get(this.option);
        },
        set: function (value) {
          return;
        }
      },
      pageName() {
        if(this.listObj) return this.listObj.name;
        return 'Loading'
      },
      pageAuth() {
        if(this.listObj) return this.listObj.authenticationUrl;
        return '';
      }
    },
    methods: {
      lang: api.storage.lang,
      init() {
        this.username = '';
        this.listObj = getListbyType(this.mode);
        return this.listObj.getUsername().then((username) => {
          this.username = username;
        });
      }
    },
    watch: {
      mode() {
        this.init();
      }
    }
  }
</script>
