<template>
  <div class="mdl-grid" style="display: block;">
    <div class="mdl-cell bg-cell mdl-cell--12-col">
    <div v-for="page in pages" v-bind:key="page.name">

      <li class="mdl-list__item">
        <span class="mdl-list__item-primary-content">
          <a :href="getDomain(page)">
            <img :src="'https://www.google.com/s2/favicons?domain='+getDomain(page)" height="16" width="16" style="margin-right: 5px;">
            {{page.name}}
          </a>
        </span>
        <span class="mdl-list__item-secondary-action">
          <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" :for="page.name">
            <input :id="page.name" type="checkbox" class="mdl-switch__input" />
          </label>
        </span>
      </li>

    </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  import {pages} from "./../../pages/pages";

  export default {
    data: function(){
      return {
        pages,
      };
    },
    props: {
    },
    mounted: async function(){
      this.$root.updateDom();
    },
    destroyed: function(){
    },
    watch: {
    },
    computed: {
    },
    methods: {
      lang: api.storage.lang,
      getDomain: function(page) {
        if(typeof page.domain === 'object') {
          var domain = page.domain[0];
        }else{
          var domain = page.domain;
        }
        return domain
      }
    }
  }


</script>
