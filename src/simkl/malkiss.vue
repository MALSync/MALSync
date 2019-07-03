<template>
  <div>
    <div>
      streamUrl: {{streamUrl}}
    </div>
    <div>
      continueUrl: {{continueUrl}}
    </div>
    <div>
      resumeUrl: {{resumeUrl}}
    </div>
    <div v-show="links && Object.keys(links).length">
      <ul>
        <li class="mdl-list__item mdl-list__item--three-line" v-for="(streams, page) in links">
          <span class="mdl-list__item-primary-content">
            <span>
              <img style="padding-bottom: 3px;" :src="getMal2KissFavicon(streams)">
              {{ page }}
            </span>
            <span id="KissAnimeLinks" class="mdl-list__item-text-body">
              <div class="mal_links" v-for="stream in streams">
                <a target="_blank" :href="stream.url">{{stream.title}}</a>
              </div>
            </span>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script type="text/javascript">
  export default {
    data: () => ({
      streamUrl: null,
      continueUrl: null,
      resumeUrl: null,
      links: {}
    }),
    methods: {
      lang: api.storage.lang,
      getMal2KissFavicon: function(streams){
        try{
          return utils.favicon(streams[Object.keys(streams)[0]].url.split('/')[2]);
        }catch(e){
          con.error(e);
          return '';
        }
      },
    }
  }
</script>

<style lang="less" scoped>
  div{
    background-color: red;
  }
</style>
