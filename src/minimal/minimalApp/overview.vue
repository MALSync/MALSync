<template>
  <div class="page-content">
    <div v-show="!metaObj" id="loadOverview" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
    <div class="mdl-grid" v-if="metaObj">
      <div v-show="statistics.length" class="mdl-cell bg-cell mdl-cell--1-col mdl-cell--8-col-tablet mdl-cell--6-col-phone mdl-shadow--4dp stats-block malClear" style="min-width: 120px;">
        <ul class="mdl-list mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col" style="display: flex; justify-content: space-around;">
          <li v-for="stat in statistics" class="mdl-list__item mdl-list__item--two-line" style="padding: 0; padding-left: 10px; padding-right: 3px; min-width: 18%;">
            <span class="mdl-list__item-primary-content">
              <span>
                  {{stat.title}}
              </span>
              <span v-html="stat.body" class="mdl-list__item-sub-title">
              </span>
            </span>
          </li>
        </ul>
      </div>
      <div class="mdl-grid mdl-cell bg-cell mdl-shadow--4dp coverinfo malClear" style="display:block; flex-grow: 100; min-width: 70%;">
        <div class="mdl-card__media mdl-cell mdl-cell--2-col" style="background-color: transparent; float:left; padding-right: 16px;">
          <clazy-load :src="image" class="malImage malClear" style="width: 100%; height: auto;">
            <img :src="image" style="height: auto; width: 100%;">
          </clazy-load>
        </div>
        <div class="mdl-cell mdl-cell--12-col">
          <a class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect malClear malLink" :href="displayUrl" style="float: right;" target="_blank"><i class="material-icons">open_in_new</i></a>
          <h1 v-html="title" class="malTitle mdl-card__title-text malClear" style="padding-left: 0px; overflow:visible;"></h1>
          <div class="malAltTitle mdl-card__supporting-text malClear" style="padding: 10px 0 0 0px; overflow:visible;">
            <div v-for="altTitl in altTitle" class="mdl-chip" style="margin-right: 5px;">
              <span class="mdl-chip__text">{{altTitl}}</span>
            </div>
          </div>
        </div>
        <div class="malDescription malClear mdl-cell mdl-cell--10-col" style="overflow: hidden;">
          <p v-html="description" style="color: black;">
          </p>
          <div v-show="streaming" v-html="streaming" class="mdl-card__actions mdl-card--border" style="padding-left: 0;"></div>
        </div>
      </div>
      <div class="mdl-cell bg-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp data-block mdl-grid mdl-grid--no-spacing malClear">
        <li v-if="prediction && prediction.prediction.airing" class="mdl-list__item" style="width: 100%;">{{prediction.text}}</li>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tbody>
            <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
              <span class="mdl-list__item-primary-content">
                <span>{{lang("UI_Status")}} </span>
                <span class="mdl-list__item-text-body">
                  <select v-model="malStatus" :disabled="!this.renderObj || !this.renderObj.login" name="myinfo_status" id="myinfo_status" class="inputtext js-anime-status-dropdown mdl-textfield__input" style="outline: none;">
                    <option selected="selected" value="1">{{lang("UI_Status_watching_"+renderObj.type)}}</option>
                    <option value="2">{{lang("UI_Status_Completed")}}</option>
                    <option value="3">{{lang("UI_Status_OnHold")}}</option>
                    <option value="4">{{lang("UI_Status_Dropped")}}</option>
                    <option value="6">{{lang("UI_Status_planTo_"+renderObj.type)}}</option>
                  </select>
                </span>
              </span>
            </li>
            <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
              <span class="mdl-list__item-primary-content">
                <span>{{utils.episode(renderObj.type)}}</span>
                <span class="mdl-list__item-text-body">
                  <input v-model="malEpisode" :disabled="!this.renderObj || !this.renderObj.login" type="text" id="myinfo_watchedeps" name="myinfo_watchedeps" size="3" class="inputtext mdl-textfield__input" value="6" style="width: 35px; display: inline-block;"> / <span v-html="prediction.tag" v-if="prediction"/> <span id="curEps" v-if="renderObj && renderObj.totalEp">{{renderObj.totalEp}}</span><span v-else>?</span></span>
                  <a href="javascript:void(0)" class="js-anime-increment-episode-button" target="_blank">
                    <i class="fa fa-plus-circle ml4">
                    </i>
                  </a>
                </span>
              </span>
            </li>
            <li v-show="renderObj.type == 'manga'" class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
              <span class="mdl-list__item-primary-content">
                <span>{{lang("UI_Volume")}}</span>
                <span class="mdl-list__item-text-body">
                  <input v-model="malVolume" :disabled="!this.renderObj || !this.renderObj.login" type="text" id="myinfo_volumes" name="myinfo_volumes" size="3" class="inputtext mdl-textfield__input" value="6" style="width: 35px; display: inline-block;"> / <span id="curVolumes" v-if="renderObj && renderObj.totalVol">{{renderObj.totalVol}}</span><span v-else>?</span></span>
                  <a href="javascript:void(0)" class="js-anime-increment-episode-button" target="_blank">
                    <i class="fa fa-plus-circle ml4">
                    </i>
                  </a>
                </span>
              </span>
            </li>
            <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
              <span class="mdl-list__item-primary-content">
                <span>{{lang("UI_Score")}} </span>
                <span class="mdl-list__item-text-body">
                  <select v-model="malScore" :disabled="!this.renderObj || !this.renderObj.login" name="myinfo_score" id="myinfo_score" class="inputtext mdl-textfield__input" style="outline: none;">
                    <option value="" selected="selected">{{lang("UI_Score_Not_Rated")}}</option>
                    <option value="10">{{lang("UI_Score_Masterpiece")}}</option>
                    <option value="9">{{lang("UI_Score_Great")}}</option>
                    <option value="8">{{lang("UI_Score_VeryGood")}}</option>
                    <option value="7">{{lang("UI_Score_Good")}}</option>
                    <option value="6">{{lang("UI_Score_Fine")}}</option>
                    <option value="5">{{lang("UI_Score_Average")}}</option>
                    <option value="4">{{lang("UI_Score_Bad")}}</option>
                    <option value="3">{{lang("UI_Score_VeryBad")}}</option>
                    <option value="2">{{lang("UI_Score_Horrible")}}</option>
                    <option value="1">{{lang("UI_Score_Appalling")}}</option>
                  </select>
                </span>
              </span>
            </li>
            <li class="mdl-list__item" style="width: 100%;">

              <input @click="malSync()" v-if="renderObj && renderObj.addAnime" type="button" name="myinfo_submit" value="Add" class="inputButton btn-middle flat js-anime-update-button mdl-button mdl-js-button mdl-button--raised mdl-button--accent" style="margin-right: 5px;" data-upgraded=",MaterialButton" :disabled="!renderObj || !renderObj.login">
              <input @click="malSync()" v-else type="button" name="myinfo_submit" :value="lang('Update')" class="inputButton btn-middle flat js-anime-update-button mdl-button mdl-js-button mdl-button--raised mdl-button--colored" style="margin-right: 5px;" data-upgraded=",MaterialButton" :disabled="!renderObj || !renderObj.login">
              <small v-if="editUrl && renderObj">
                <a :href="editUrl" target="_blank">{{lang("overview_EditDetails")}}</a>
              </small>
              <input v-if="!(renderObj && renderObj.addAnime) && (typeof renderObj.delete !== 'undefined')" @click="remove()" type="button" class="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" style="margin-left: 5px; margin-left: auto;" :value="lang('Remove')">
            </li>
          </tbody>
        </table>
      </div>
      <div v-show="related.length" class="mdl-grid mdl-grid--no-spacing mdl-cell bg-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp related-block alternative-list mdl-grid malClear">
        <ul class="mdl-list">
          <li class="mdl-list__item mdl-list__item--two-line" v-for="relatedType in related">
            <span class="mdl-list__item-primary-content">
              <span>
                {{relatedType.type}}
              </span>
              <span class="mdl-list__item-sub-title">
                <div v-for="link in relatedType.links">
                  <a :href="link.url">{{link.title}}</a>
                  <span v-html="link.statusTag"></span>
                </div>
              </span>
            </span>
          </li>
        </ul>
      </div>
      <div v-show="kiss2mal && Object.keys(kiss2mal).length" class="mdl-grid mdl-grid--no-spacing bg-cell mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp mdl-grid alternative-list stream-block malClear">
        <ul class="mdl-list stream-block-inner">
          <li class="mdl-list__item mdl-list__item--three-line" v-for="(streams, page) in kiss2mal">
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
      <div v-show="characters.length > 0" class="mdl-grid mdl-grid--no-spacing mdl-cell bg-cell mdl-cell--12-col mdl-shadow--4dp characters-block mdl-grid malClear">
        <div class="mdl-card__actions clicker" >
          <h1 class="mdl-card__title-text" style="float: left;">{{lang("overview_Characters")}}</h1>
        </div>
        <div class="mdl-grid mdl-card__actions mdl-card--border" id="characterList" style="justify-content: space-between; ">
          <div v-for="character in characters">
            <div class="mdl-grid" style="width: 126px;">
              <clazy-load :src="character.img" margin="200px 0px" :threshold="0.1" :ratio="0.1" style="width: 100%; height: auto;">
                <img :src="character.img" style="height: auto; width: 100%;">
              </clazy-load>
              <div class="" v-html="character.html">
              </div>
            </div>
          </div>
          <div v-for="n in 10" class="listPlaceholder" style="height: 0;"><div class="mdl-grid" style="width: 126px;"></div></div>
        </div>
      </div>

      <div v-if="openingSongs.length || endingSongs.length" class="mdl-grid mdl-cell bg-cell mdl-cell--12-col mdl-shadow--4dp info-block mdl-grid malClear">
        <li v-if="openingSongs.length" class="mdl-list__item mdl-list__item--three-line mdl-cell mdl-cell--6-col mdl-cell--12-col-tablet" style="padding: 0; height: auto;">
          <span class="mdl-list__item-primary-content" style="height: auto;">
              <span>{{lang("overview_OpeningTheme")}}</span>
              <span class="mdl-list__item-text-body" style="height: auto;">
                <span v-for="openingSong in openingSongs" style="display: block; color: rgb(255,64,129);">
                  {{ openingSong }}
                </span>
            </span>
          </span>
        </li>
        <li v-if="endingSongs.length" class="mdl-list__item mdl-list__item--three-line mdl-cell mdl-cell--6-col mdl-cell--12-col-tablet" style="padding: 0; height: auto;">
          <span class="mdl-list__item-primary-content" style="height: auto;">
              <span>{{lang("overview_EndingTheme")}}</span>
              <span class="mdl-list__item-text-body" style="height: auto;">
                <span v-for="endingSong in endingSongs" style="display: block; color: rgb(255,64,129);">
                  {{ endingSong }}
                </span>
            </span>
          </span>
        </li>
      </div>

      <div v-show="info.length" class="mdl-grid mdl-grid--no-spacing mdl-cell bg-cell mdl-cell--12-col mdl-shadow--4dp info-block mdl-grid malClear">
        <div class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col mdl-shadow--4dp info-block mdl-grid malClear">
          <ul class="mdl-grid mdl-grid--no-spacing mdl-list mdl-cell mdl-cell--12-col">
            <li v-for="inf in info" class="mdl-list__item mdl-list__item--three-line mdl-cell mdl-cell--3-col mdl-cell--4-col-tablet">
              <span class="mdl-list__item-primary-content">
                <span>
                  {{inf.title}}
                </span>
                <span class="mdl-list__item-text-body" v-html="inf.body">
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
  import {entryClass} from "./../../provider/provider";
  import {metadata} from "./../../provider/MyAnimeList/metadata";
  export default {
    data: function(){
      return {
        metaObj: null,
        imageTemp: null,
        mal: {
          resumeUrl: null,
          continueUrl: null
        },
        kiss2mal: {},
        related: [],
        prediction: null,
        utils,
      }
    },
    props: {
      renderObj: {
        type: Object,
        default: null
      },
    },
    watch: {
      renderObj: async function(renderObj){

        this.metaObj = null;

        this.mal.resumeUrl = null;
        this.mal.continueUrl = null;
        this.kiss2mal = {};
        this.related = [];
        this.prediction = null;
        this.imageTemp = null;

        if(renderObj == null) return;

        if(renderObj.getMalUrl() !== null){
          this.metaObj = await new metadata(renderObj.getMalUrl()).init();
          this.related = this.getRelated();
          if(renderObj.login){
            this.updateStatusTags();
          }


          if(renderObj.getMalUrl().split('').length > 3){
            utils.getMalToKissArray(renderObj.type, renderObj.id).then((links) => {
              this.kiss2mal = links;
            });
          }

        }else{

        }
        if(typeof this.renderObj.renderNoImage === 'undefined' || !this.renderObj.renderNoImage){
          this.imageTemp = await this.renderObj.getImage();
        }

        this.mal.resumeUrl = await renderObj.getResumeWaching();
        this.mal.continueUrl = await renderObj.getContinueWaching();

        utils.epPredictionUI(renderObj.id, renderObj.getCacheKey(), renderObj.type, (prediction) => {
          this.prediction = prediction;
        });
      }
    },
    computed: {
      editUrl: function(){
        if(typeof this.renderObj.getDetailUrl !== 'undefined') return this.renderObj.getDetailUrl();
        return null;
      },
      malStatus: {
        get: function () {
          if(this.renderObj && this.renderObj.login){
            if(this.renderObj.getScore() === 0) return 1;
            return this.renderObj.getStatus()
          }
          return null;
        },
        set: function (value) {
          if(this.renderObj && this.renderObj.login){
            this.renderObj.setStatus(value);
          }
        }
      },
      malEpisode: {
        get: function () {
          if(this.renderObj && this.renderObj.login){
            if(this.renderObj.addAnime) return null;
            return this.renderObj.getEpisode();
          }
          return null;
        },
        set: function (value) {
          if(this.renderObj && this.renderObj.login){
            this.renderObj.setEpisode(value);
          }
        }
      },
      malVolume: {
        get: function () {
          if(this.renderObj && this.renderObj.login){
            if(this.renderObj.addAnime) return null;
            return this.renderObj.getVolume();
          }
          return null;
        },
        set: function (value) {
          if(this.renderObj && this.renderObj.login){
            this.renderObj.setVolume(value);
          }
        }
      },
      malScore: {
        get: function () {
          if(this.renderObj && this.renderObj.login){
            if(this.renderObj.getScore() === 0) return '';
            return this.renderObj.getScore()
          }
          return null;
        },
        set: function (value) {
          if(this.renderObj && this.renderObj.login){
            this.renderObj.setScore(value);
          }
        }
      },
      statistics: function(){
        return this.metaObj.getStatistics();
      },
      displayUrl: function(){
        if(this.renderObj != null){
          return this.renderObj.getDisplayUrl()
        }
        return this.renderObj.url;
      },
      image: function(){
        var image = '';
        try{
            image = this.metaObj.getImage();
        }catch(e) {console.log('[iframeOverview] Error:',e);}
        try{
            if(this.imageTemp !== null && this.imageTemp !== ''){
              image = this.imageTemp;
            }
        }catch(e) {console.log('[iframeOverview] Error:',e);}
        return image;
      },
      title: function(){
        var title = '';
        try{
            title = this.metaObj.getTitle();
        }catch(e) {console.log('[iframeOverview] Error:',e);}
        try{
            title = this.renderObj.name;
        }catch(e) {console.log('[iframeOverview] Error:',e);}
        return title;
      },
      description: function(){
        return this.metaObj.getDescription();
      },
      altTitle: function(){
        return this.metaObj.getAltTitle();
      },
      streaming: function(){
        var streamhtml = null;
        var malObj = this.renderObj;
        if(malObj == null || !malObj.login) return null;
        var streamUrl = malObj.getStreamingUrl();
        if(typeof streamUrl !== 'undefined'){

          streamhtml =
          `
            <div class="data title progress" style="display: inline-block; position: relative; top: 2px; margin-left: -2px;">
              <a class="stream mdl-button mdl-button--colored mdl-js-button mdl-button--raised" title="${streamUrl.split('/')[2]}" target="_blank" style="margin: 0px 5px; color: white;" href="${streamUrl}">
                <img src="${utils.favicon(streamUrl.split('/')[2])}" style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;">${api.storage.lang('overview_Continue_'+malObj.type)}
              </a>`;

          con.log('Resume', this.mal.resumeUrl, 'Continue', this.mal.continueUrl);
          if(typeof this.mal.continueUrl !== 'undefined' && this.mal.continueUrl && this.mal.continueUrl.ep === (malObj.getEpisode()+1)){
            streamhtml +=
              `<a class="nextStream mdl-button mdl-button--colored mdl-js-button mdl-button--raised" title="${api.storage.lang('overview_Next_Episode_'+malObj.type)}" target="_blank" style="margin: 0px 5px 0px 0px; color: white;" href="${this.mal.continueUrl.url}">
                <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16" style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;">${api.storage.lang('overview_Next_Episode_'+malObj.type)}
              </a>`;
          }else if(typeof this.mal.resumeUrl !== 'undefined' && this.mal.resumeUrl && this.mal.resumeUrl.ep === malObj.getEpisode()){
            streamhtml +=
              `<a class="resumeStream mdl-button mdl-button--colored mdl-js-button mdl-button--raised" title="${api.storage.lang('overview_Resume_Episode_'+malObj.type)}" target="_blank" style="margin: 0px 5px 0px 0px; color: white;" href="${this.mal.resumeUrl.url}">
                <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16" style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;">${api.storage.lang('overview_Resume_Episode_'+malObj.type)}
              </a>`;
          }

          streamhtml +=
            `</div>
          `;

        }
        return streamhtml;
      },
      characters: function(){
        return this.metaObj.getCharacters();
      },
      info: function(){
        return this.metaObj.getInfo();
      },
      openingSongs: function(){
        return this.metaObj.getOpeningSongs();
      },
      endingSongs: function(){
        return this.metaObj.getEndingSongs();
      }
    },
    methods: {
      lang: api.storage.lang,
      malSync: function(){
        this.renderObj.sync()
          .then(function(){
            utils.flashm('Updated');
          }, function(){
            utils.flashm( "Update failed" , {error: true});
          });
      },
      remove: function(){
        this.renderObj.delete().then(() => {
            utils.flashm('Removed');
            this.renderObj.update();
          }, () => {
            utils.flashm( "Removing failed" , {error: true});
            this.renderObj.update();
          });
      },
      getMal2KissFavicon: function(streams){
        try{
          return utils.favicon(streams[Object.keys(streams)[0]].url.split('/')[2]);
        }catch(e){
          con.error(e);
          return '';
        }
      },
      getRelated: function(){
        return this.metaObj.getRelated();
      },
      updateStatusTags: async function(){
        for(var relatedKey in this.related){
          var relate = this.related[relatedKey];
          for(var linkKey in relate.links){
            var link = relate.links[linkKey];
            var url = utils.absoluteLink(link.url, 'https://myanimelist.net');
            if(typeof url != 'undefined'){

              var tag = await utils.timeCache('MALTAG/'+url, async function(){
                var malObj = entryClass(url, true, true);
                await malObj.init();
                return utils.statusTag(malObj.getStatus(), malObj.type, malObj.id);
              }, 1 * 60 * 60 * 1000);

              if(tag){
                this.related[relatedKey].links[linkKey].statusTag = tag;
              }
            }
          }
        }
      }
    }
  }
</script>
