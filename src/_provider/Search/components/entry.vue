<template>
  <div class="entry" v-if="obj">
    <a class="result" :href="obj.getDisplayUrl()" target="_blank" style="cursor: pointer;">
      <div class="image"><img v-if="image" :src="image"></div>
      <div class="right">
        <span class="title">{{obj.name}}</span>
        <p v-if="!obj.addAnime">{{lang("UI_Status")}} {{statusText(status)}}</p>
        <p v-if="!obj.addAnime">{{lang("UI_Score")}} {{score}}</p>
        <p v-if="!obj.addAnime">
          {{utilsepisode(obj.type)}} {{episode}}<span id="curEps" v-if="obj.totalEp">/{{obj.totalEp}}</span><span v-else>/?</span>
        </p>
      </div>
    </a>

  </div>
</template>

<script type="text/javascript">
  export default {
    data: function(){
      return {
        image: '',
      }
    },
    props: {
      obj: {
        type: Object,
        default: undefined
      }
    },
    mounted: function(){
    },
    computed: {
      status: {
        get: function () {
          if(this.obj && this.obj.login){
            if(this.obj.getScore() === 0) return 1;
            return this.obj.getStatus()
          }
          return null;
        },
        set: function (value) {
          if(this.obj && this.obj.login){
            this.obj.setStatus(value);
          }
        }
      },
      episode: {
        get: function () {
          if(this.obj && this.obj.login){
            if(this.obj.addAnime) return null;
            return this.obj.getEpisode();
          }
          return null;
        },
        set: function (value) {
          if(this.obj && this.obj.login){
            this.obj.setEpisode(value);
          }
        }
      },
      volume: {
        get: function () {
          if(this.obj && this.obj.login){
            if(this.obj.addAnime) return null;
            return this.obj.getVolume();
          }
          return null;
        },
        set: function (value) {
          if(this.obj && this.obj.login){
            this.obj.setVolume(value);
          }
        }
      },
      score: {
        get: function () {
          if(this.obj && this.obj.login){
            if(this.obj.getScore() === 0) return '';
            return this.obj.getScore()
          }
          return null;
        },
        set: function (value) {
          if(this.obj && this.obj.login){
            this.obj.setScore(value);
          }
        }
      },
    },
    watch: {
      obj: {
        deep: true,
        immediate: true,
        handler(val, oldVal) {
          if(!oldVal || oldVal.url !== val.url) {
            var tempUrl = val.url;
            val.getImage().then((img) => {
              if(this.obj.url === tempUrl) {
                this.image = img;
              }
            })
          }
        }
      }
    },
    methods: {
      lang: api.storage.lang,
      utilsepisode: utils.episode,
      statusText: function(state){
        switch(state) {
          case 1:
            return api.storage.lang("UI_Status_watching_"+this.obj.type)
            break;
          case 2:
            return api.storage.lang("UI_Status_Completed")
            break;
          case 3:
            return api.storage.lang("UI_Status_OnHold")
            break;
          case 4:
            return api.storage.lang("UI_Status_Dropped")
            break;
          case 6:
            return api.storage.lang("UI_Status_planTo_"+this.obj.type)
            break;
          default:
            return ''
        }
      }
    }
  }
</script>
