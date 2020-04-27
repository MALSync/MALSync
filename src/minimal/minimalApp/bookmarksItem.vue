<template>
  <div v-if="!listView" :title="prediction && prediction.text" class="mdl-cell mdl-cell--2-col mdl-cell--4-col-tablet mdl-cell--6-col-phone mdl-shadow--2dp mdl-grid bookEntry" style="position: relative; height: 250px; padding: 0; width: 210px; height: 293px;">
    <div class="data title" style=" background-color: #cdcdcd; width: 100%; position: relative; padding-top: 5px;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden;">
        <clazy-load :src="imageHi" margin="200px 0px" :threshold="0.1" :ratio="0.1" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden;">
          <img :src="imageHi" width="100%">
        </clazy-load>
      </div>
      <div v-if="prediction && prediction.text" class="mdl-shadow--2dp" style=" position: absolute; top: 0; right: 0; background-color: rgba(255, 255, 255, 0.9); padding: 0px 5px; margin: 5px 0; text-align: center;">
        {{preTexter}}
      </div>

      <div v-if="item.score" style=" position: absolute; top: 0; left: 0; padding: 0px 5px; margin: 5px 0; text-align: center;">
        <div style="width: 38px; height: 38px; position: relative;">
          <i class="material-icons" style="color: #3f51b5; position: absolute; left: 0; top: 0px; font-size: 38px;">star</i>
          <div style="color: white; position: absolute; left: 0; top: 0px; right: 0; bottom: 0px; text-align: center; line-height: 38px;padding-top: 1px;">{{item.score}}</div>
        </div>
      </div>

      <a :href="item.url" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;"></a>
      <span class="mdl-shadow--2dp" style="position: absolute; bottom: 0; display: block; background-color: rgba(255, 255, 255, 0.9); padding-top: 5px; display: inline-flex; align-items: center; justify-content: space-between; left: 0; right: 0; padding-right: 8px; padding-left: 8px; padding-bottom: 8px;">
        <a :href="item.url" style="color: black; text-decoration: none;">
          {{item.title}}
        </a>
        <div id="p1" class="mdl-progress" style="position: absolute; top: -4px; left: 0;">
          <div class="progressbar bar bar1" :style="progress"></div>
          <div v-if="hasTotalEp" class="bufferbar bar bar2" style="width: calc(100% + 1px);"></div>
          <div v-if="prediction && prediction.tagEpisode" class="predictionbar bar kal-ep-pre" :style="predictionBar"></div>
          <div class="auxbar bar bar3" style="width: 0%;"></div>
        </div>
        <div class="data progress mdl-chip mdl-chip--contact mdl-color--indigo-100" style="float: right; line-height: 20px; height: 20px; padding-right: 4px; margin-left: 5px;">
          <div class="link mdl-chip__contact mdl-color--primary mdl-color-text--white" style="line-height: 20px; height: 20px; margin-right: 0;" :title="'['+item.watchedEp+'/'+item.totalEp+']'">{{item.watchedEp}}</div>
          <a class="mal-sync-stream" v-if="streamUrl" :title="streamUrl.split('/')[2]" target="_blank" style="margin: 0 5px;" :href="streamUrl">
            <img :src="favicon(streamUrl.split('/')[2])">
          </a>
          <a v-if="continueUrl" class="nextStream" :title="lang('overview_Continue_'+item.type)" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" :href="continueUrl">
            <img :src="assetUrl('double-arrow-16px.png')" width="16" height="16">
          </a>
          <a v-if="resumeUrl" class="resumeStream" :title="lang('overview_Resume_Episode_'+item.type)" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" :href="resumeUrl">
            <img :src="assetUrl('arrow-16px.png')" width="16" height="16">
          </a>
        </div>
      </span>
    </div>
  </div>
  <tr v-else @click="openLink(item.url)" style="cursor: pointer;">
    <td style="width: 64px;">
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: -1px; overflow: hidden;">
        <clazy-load :src="imageHi" margin="200px 0px" :threshold="0.1" :ratio="0.1" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden;">
          <img :src="imageHi" width="100%">
        </clazy-load>
      </div>
    </td>
    <td class="mdl-data-table__cell--non-numeric" style="white-space: normal; position: relative; padding-left: 10px;">
      {{item.title}}
      <a class="mal-sync-stream" v-if="streamUrl" :title="streamUrl.split('/')[2]" target="_blank" style="margin: 0 5px;" :href="streamUrl">
        <img :src="favicon(streamUrl.split('/')[2])">
      </a>
      <a v-if="continueUrl" class="nextStream" :title="lang('overview_Continue_'+item.type)" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" :href="continueUrl">
        <img :src="assetUrl('double-arrow-16px.png')" width="16" height="16">
      </a>
      <a v-if="resumeUrl" class="resumeStream" :title="lang('overview_Resume_Episode_'+item.type)" target="_blank" style="margin: 0 5px 0 0; color: #BABABA;" :href="resumeUrl">
        <img :src="assetUrl('arrow-16px.png')" width="16" height="16">
      </a>

      <div id="p1" class="mdl-progress" style="position: absolute; bottom: 0px; left: 0px; right: 0px; width: auto; opacity: 0.5;">
        <div class="progressbar bar bar1" :style="progress"></div>
        <div v-if="hasTotalEp" class="bufferbar bar bar2" style="width: calc(100% + 1px);"></div>
        <div v-if="prediction && prediction.tagEpisode" class="predictionbar bar kal-ep-pre" :style="predictionBar"></div>
        <div class="auxbar bar bar3" style="width: 0%;"></div>
      </div>

    </td>
    <td style="width: 70px;">{{item.watchedEp}}/<template v-if="item.totalEp">{{item.totalEp}}</template>
      <template v-else>?</template></td>
    <td style="width: 57px;">
      <template v-if="item.score">{{item.score}}</template>
      <template v-else>-</template>
    </td>
  </tr>
</template>

<script type="text/javascript">
  import * as provider from "./../../provider/provider.ts";
  export default {
    data: function(){
      return {
        prediction: undefined,
        resumeUrl: null,
        continueUrl: null,
      }
    },
    props: {
      item: {
        type: Object,
      },
      listView: {
        type: Boolean,
        default: false
      }
    },
    mounted: async function(){
      if(typeof this.item.resume === 'undefined'){
        var resumeUrl = null;
        var continueUrl = null;
        var id = this.item.malId;
        var type = this.item.type;
        var resumeUrlObj = await utils.getResumeWaching(type, this.item.cacheKey);
        var continueUrlObj = await utils.getContinueWaching(type, this.item.cacheKey);
        var curEp = parseInt(this.item.watchedEp.toString());

        if(typeof continueUrlObj !== 'undefined' && continueUrlObj.ep === (curEp+1)){
          continueUrl = continueUrlObj.url;
        }else if(typeof resumeUrlObj !== 'undefined' && resumeUrlObj.ep === curEp){
          resumeUrl = resumeUrlObj.url;
        }
        this.resumeUrl = resumeUrl;
        this.continueUrl = continueUrl;
      }

      if(typeof this.prediction === 'undefined'){
        this.setPrediction();
        setInterval(() => {
          this.setPrediction();
        }, 60 * 1000);
      }
    },
    watch: {
    },
    computed: {
      imageHi: function(){
        var imageHi = this.item.image;
        var regexDimensions = /\/r\/\d*x\d*/g;
        if ( regexDimensions.test(imageHi) ) {
          imageHi = imageHi.replace(/v.jpg$/g, '.jpg').replace(regexDimensions, '');
        }
        return imageHi;
      },
      barTotal: function(){

        if(this.prediction && this.prediction.tagEpisode && !this.hasTotalEp){
          if(this.prediction.tagEpisode > this.item.watchedEp){
            return Math.ceil(this.prediction.tagEpisode * 1.2);
          }else{
            return Math.ceil(this.item.watchedEp * 1.2);
          }
        }

        return this.item.totalEp;
      },
      hasTotalEp: function(){
        return parseInt(this.item.totalEp) !== 0
      },
      progress: function(){
        var width = ( this.item.watchedEp / this.barTotal ) * 100;
        return 'width: '+width+'%; max-width: 100%;'
      },
      predictionBar: function(){
        var predictionProgress = ( this.prediction.tagEpisode / this.barTotal ) * 100;
        var color = 'orange';
        if(this.prediction.color !== ''){
          color = this.prediction.color;
        }
        return 'width: '+predictionProgress+'%; background-color: '+color;
      },
      streamUrl: function(){
        return utils.getUrlFromTags(this.item.tags);
      },
      preTexter: function(){
        var pre = this.prediction.prediction;
        var diffDays = pre.diffDays;
        var diffHours = pre.diffHours;
        var diffMinutes = pre.diffMinutes;
        //Round hours
        if(diffDays > 1 && diffHours > 12){
          diffDays++;
        }

        var text = '';
        if(diffDays > 1){
          return text+diffDays+' '+api.storage.lang("bookmarksItem_Days");
        }
        if(diffDays === 1){
          text += diffDays+' '+api.storage.lang("bookmarksItem_Day")+' ';
        }

        if(diffHours > 1){
          return text+diffHours+' '+api.storage.lang("bookmarksItem_Hours");
        }
        if(diffHours === 1){
          text += diffHours+' '+api.storage.lang("bookmarksItem_Hour")+' ';
        }

        return text+diffMinutes+' '+api.storage.lang("bookmarksItem_mins");
      },
    },
    methods: {
      lang: api.storage.lang,
      favicon: function(domain){
        return utils.favicon(domain);
      },
      assetUrl: function(asset){
        return api.storage.assetUrl(asset);
      },
      setPrediction: function(){
        utils.epPredictionUI(this.item.malId, this.item.cacheKey, this.item.type, (prediction) => {
          this.prediction = prediction;
        });
      },
      openLink: function(url){
        var link = document.createElement('a');
        link.href = url;
        document.getElementById("malList").appendChild(link);
        link.click();
      }
    }
  }
</script>
