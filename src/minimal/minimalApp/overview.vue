<template>
  <div class="page-content">
    <div v-show="xhr == ''" id="loadOverview" class="mdl-progress mdl-js-progress mdl-progress__indeterminate" style="width: 100%; position: absolute;"></div>
    <div class="mdl-grid" v-if="xhr != ''">
      <div v-html="statistics" class="mdl-cell mdl-cell--1-col mdl-cell--8-col-tablet mdl-cell--6-col-phone mdl-shadow--4dp stats-block malClear" style="min-width: 120px;"></div>
      <div class="mdl-grid mdl-cell mdl-shadow--4dp coverinfo malClear" style="display:block; flex-grow: 100; min-width: 70%;">
        <div class="mdl-card__media mdl-cell mdl-cell--2-col" style="background-color: transparent; float:left; padding-right: 16px;">
          <img class="malImage malClear" style="width: 100%; height: auto;" :src="image"></img>
        </div>
        <div class="mdl-cell mdl-cell--12-col">
          <a class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect malClear malLink" :href="displayUrl" style="float: right;" target="_blank"><i class="material-icons">open_in_new</i></a>
          <h1 class="malTitle mdl-card__title-text malClear" style="padding-left: 0px; overflow:visible;">{{title}}</h1>
          <div v-html="altTitle" class="malAltTitle mdl-card__supporting-text malClear" style="padding: 10px 0 0 0px; overflow:visible;"></div>
        </div>
        <div class="malDescription malClear mdl-cell mdl-cell--10-col" style="overflow: hidden;">
          <p v-html="description" style="color: black;">
          </p>
          <div v-show="streaming" v-html="streaming" class="mdl-card__actions mdl-card--border" style="padding-left: 0;"></div>
        </div>
      </div>
      <div v-html="myinfo" class="mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp data-block mdl-grid mdl-grid--no-spacing malClear"></div>
      <div v-show="related" class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp related-block alternative-list mdl-grid malClear">
        <ul class="mdl-list">
          <li class="mdl-list__item mdl-list__item--two-line" v-for="relatedType in related">
            <span class="mdl-list__item-primary-content">
              <span>
                {{relatedType.type}}
              </span>
              <span class="mdl-list__item-sub-title">
                <div v-for="link in relatedType.links">
                  <a :href="link.url">{{link.title}}</a>
                </div>
              </span>
            </span>
          </li>
        </ul>
      </div>
      <div v-show="kiss2mal" class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp mdl-grid alternative-list stream-block malClear">
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
      <div v-show="characters" v-html="characters" class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col mdl-shadow--4dp characters-block mdl-grid malClear"></div>
      <div v-html="info" class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col mdl-shadow--4dp info-block mdl-grid malClear"></div>
    </div>
  </div>
</template>

<script type="text/javascript">
  import {entryClass} from "./../../provider/provider";
  export default {
    data: function(){
      return {
        xhr: '',
        mal: {
          malObj: null,
          resumeUrl: null,
          continueUrl: null
        },
        kiss2mal: {},
        related: [],
      }
    },
    props: {
      url: {
        type: String,
        default: ''
      },
    },
    watch: {
      url: async function(url){
        this.xhr = '';
        this.mal.malObj = null;
        this.mal.resumeUrl = null;
        this.mal.continueUrl = null;
        this.kiss2mal = {};
        this.related = [];

        api.request.xhr('GET', this.url).then((response) => {
          this.xhr = response.responseText;
          this.related = this.getRelated();
        });

        var malObj = entryClass(this.url, true);
        malObj.init().then(async() => {
          this.mal.malObj = malObj;
          this.mal.resumeUrl = await malObj.getResumeWaching();
          this.mal.continueUrl = await malObj.getContinueWaching();
        });

        if(this.url.split('').length > 3){
          utils.getMalToKissArray(utils.urlPart(this.url, 3), utils.urlPart(this.url, 4)).then((links) => {
            con.log(links);
            this.kiss2mal = links;
          });
        }
      }
    },
    computed: {
      statistics: function(){
        var stats = '';
        try{
            var statsBlock = this.xhr.split('<h2>Statistics</h2>')[1].split('<h2>')[0];
            // @ts-ignore
            var tempHtml = j.$.parseHTML( statsBlock );
            var statsHtml = '<ul class="mdl-list mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col" style="display: flex; justify-content: space-around;">';
            j.$.each(j.$(tempHtml).filter('div').slice(0,5), function( index, value ) {
                statsHtml += '<li class="mdl-list__item mdl-list__item--two-line" style="padding: 0; padding-left: 10px; padding-right: 3px; min-width: 18%;">';
                    statsHtml += '<span class="mdl-list__item-primary-content">';
                        statsHtml += '<span>';
                            statsHtml += j.$(value).find('.dark_text').text();
                        statsHtml += '</span>';
                        statsHtml += '<span class="mdl-list__item-sub-title">';
                            statsHtml += j.$(value).find('span[itemprop=ratingValue]').height() != null ? j.$(value).find('span[itemprop=ratingValue]').text() : j.$(value).clone().children().remove().end().text();
                        statsHtml += '</span>';
                    statsHtml += '</span>';
                statsHtml += '</li>';
            });
            statsHtml += '</ul>';
            stats = statsHtml;
        }catch(e) {console.log('[iframeOverview] Error:',e);}
        return stats;
      },
      displayUrl: function(){
        if(this.mal.malObj != null){
          return this.mal.malObj.getDisplayUrl()
        }
        return this.url;
      },
      image: function(){
        var image = '';
        try{
            image = this.xhr.split('js-scrollfix-bottom')[1].split('<img src="')[1].split('"')[0];
        }catch(e) {console.log('[iframeOverview] Error:',e);}
        return image;
      },
      title: function(){
        var title = '';
        try{
            title = this.xhr.split('itemprop="name">')[1].split('<')[0];
        }catch(e) {console.log('[iframeOverview] Error:',e);}
        return title;
      },
      description: function(){
        var description  = '';
        try{
            description = this.xhr.split('itemprop="description">')[1].split('</span')[0];
        }catch(e) {console.log('[iframeOverview] Error:',e);}
        return description;
      },
      altTitle: function(){
        var altTitle = '';
        try{
            altTitle = this.xhr.split('<h2>Alternative Titles</h2>')[1].split('<h2>')[0];
            altTitle = altTitle.replace(/spaceit_pad/g,'mdl-chip" style="margin-right: 5px;');
            altTitle = altTitle.replace(/<\/span>/g,'</span><span class="mdl-chip__text">');
            altTitle = altTitle.replace(/<\/div>/g,'</span></div>');
        }catch(e) {console.log('[iframeOverview] Error:',e);}
        return altTitle;
      },
      streaming: function(){
        var streamhtml = null;
        var malObj = this.mal.malObj;
        if(malObj == null) return null;
        var streamUrl = malObj.getStreamingUrl();
        if(typeof streamUrl !== 'undefined'){

          streamhtml =
          `
            <div class="data title progress" style="display: inline-block; position: relative; top: 2px; margin-left: -2px;">
              <a class="stream mdl-button mdl-button--colored mdl-js-button mdl-button--raised" title="${streamUrl.split('/')[2]}" target="_blank" style="margin: 0px 5px; color: white;" href="${streamUrl}">
                <img src="${utils.favicon(streamUrl.split('/')[2])}" style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;">Continue ${utils.watching(malObj.type)}
              </a>`;

          con.log('Resume', this.mal.resumeUrl, 'Continue', this.mal.continueUrl);
          if(typeof this.mal.continueUrl !== 'undefined' && this.mal.continueUrl && this.mal.continueUrl.ep === (malObj.getEpisode()+1)){
            streamhtml +=
              `<a class="nextStream mdl-button mdl-button--colored mdl-js-button mdl-button--raised" title="Continue watching" target="_blank" style="margin: 0px 5px 0px 0px; color: white;" href="${this.mal.continueUrl.url}">
                <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16" style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;">Next Episode
              </a>`;
          }else if(typeof this.mal.resumeUrl !== 'undefined' && this.mal.resumeUrl && this.mal.resumeUrl.ep === malObj.getEpisode()){
            streamhtml +=
              `<a class="resumeStream mdl-button mdl-button--colored mdl-js-button mdl-button--raised" title="Resume watching" target="_blank" style="margin: 0px 5px 0px 0px; color: white;" href="${this.mal.resumeUrl.url}">
                <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16" style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;">Resume Episode
              </a>`;
          }

          streamhtml +=
            `</div>
          `;

        }
        return streamhtml;
      },
      myinfo: function(){
        var myinfo = '';
        try{
          var localType = utils.urlPart(this.url, 3);
          myinfo +=
          ` <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tbody>
                <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
                  <span class="mdl-list__item-primary-content">
                    <span>Status:</span>
                    <span class="mdl-list__item-text-body">
                      <select name="myinfo_status" id="myinfo_status" class="inputtext js-anime-status-dropdown mdl-textfield__input" style="outline: none; visibility: hidden;">
                        <option selected="selected" value="1">${utils.watching(localType)}</option>
                        <option value="2">Completed</option>
                        <option value="3">On-Hold</option>
                        <option value="4">Dropped</option>
                        <option value="6">${utils.planTo(localType)}</option>
                      </select>
                    </span>
                  </span>
                </li>
                <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
                  <span class="mdl-list__item-primary-content">
                    <span>${utils.episode(localType)}:</span>
                    <span class="mdl-list__item-text-body">
                      <input type="text" id="myinfo_watchedeps" name="myinfo_watchedeps" size="3" class="inputtext mdl-textfield__input" value="6" style="width: 35px; display: inline-block; visibility: hidden;"> / <span id="curEps" style="visibility: hidden;">?</span>
                      <a href="javascript:void(0)" class="js-anime-increment-episode-button" target="_blank">
                        <i class="fa fa-plus-circle ml4">
                        </i>
                      </a>
                    </span>
                  </span>
                </li>
            `;
            if(localType == 'manga'){
              myinfo +=`
                <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
                  <span class="mdl-list__item-primary-content">
                    <span>Volume:</span>
                    <span class="mdl-list__item-text-body">
                      <input type="text" id="myinfo_volumes" name="myinfo_volumes" size="3" class="inputtext mdl-textfield__input" value="6" style="width: 35px; display: inline-block; visibility: hidden;"> / <span id="curVolumes" style="visibility: hidden;">?</span>
                      <a href="javascript:void(0)" class="js-anime-increment-episode-button" target="_blank">
                        <i class="fa fa-plus-circle ml4">
                        </i>
                      </a>
                    </span>
                  </span>
                </li>
              `;
            }
            myinfo +=`
                <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
                  <span class="mdl-list__item-primary-content">
                    <span>Your Score:</span>
                    <span class="mdl-list__item-text-body">
                      <select name="myinfo_score" id="myinfo_score" class="inputtext mdl-textfield__input" style="outline: none; visibility: hidden;">
                        <option value="" selected="selected">Select</option>
                        <option value="10">(10) Masterpiece</option>
                        <option value="9">(9) Great</option>
                        <option value="8">(8) Very Good</option>
                        <option value="7">(7) Good</option>
                        <option value="6">(6) Fine</option>
                        <option value="5">(5) Average</option>
                        <option value="4">(4) Bad</option>
                        <option value="3">(3) Very Bad</option>
                        <option value="2">(2) Horrible</option>
                        <option value="1">(1) Appalling</option>
                      </select>
                    </span>
                  </span>
                </li>
                <li class="mdl-list__item" style="width: 100%;">
                  <input type="button" name="myinfo_submit" value="Update" class="inputButton btn-middle flat js-anime-update-button mdl-button mdl-js-button mdl-button--raised mdl-button--colored" style="margin-right: 5px;" data-upgraded=",MaterialButton">
                  <small>
                    <a href="https://myanimelist.net/ownlist/${localType}/${utils.urlPart(this.url, 4)}/edit" target="_blank">Edit Details</a>
                  </small>
                </li>

              </tbody>
            </table>
          `;
        }catch(e) {console.log('[iframeOverview] Error:',e);}
        return myinfo;
      },
      characters: function(){
        var html = '';
        try{
          var characterBlock = this.xhr.split('detail-characters-list')[1].split('</h2>')[0];
          var charHtml = j.$.parseHTML( '<div class="detail-characters-list '+characterBlock );
          var temphtml = '';
          var charFound = 0;
          var tempWrapHtml = '\
          <div class="mdl-card__actions clicker" >\
            <h1 class="mdl-card__title-text" style="float: left;">Characters</h1>\
          </div>\
          <div class="mdl-grid mdl-card__actions mdl-card--border" id="characterList" style="justify-content: space-between; ">';

          j.$.each(j.$(charHtml).find(':not(td) > table'), ( index, value ) => {
            if(!index) charFound = 1;
            var regexDimensions = /\/r\/\d*x\d*/g;
            var charImg = j.$(value).find('img').first().attr("data-src");
            if ( regexDimensions.test(charImg)){
              charImg = charImg.replace(regexDimensions, '');
            }else{
              charImg = 'https://myanimelist.cdn-dena.com/images/questionmark_23.gif';
            }

            charImg = utils.handleMalImages(charImg);

            tempWrapHtml += '<div>';
              tempWrapHtml += '<div class="mdl-grid" style="width: 126px;">';
                tempWrapHtml += '<div style="width: 100%; height: auto;">';
                  tempWrapHtml += '<img style="height: auto; width: 100%;"src="'+charImg+'">';
                tempWrapHtml += '</div>';
                tempWrapHtml += '<div class="">';
                  tempWrapHtml += j.$(value).find('.borderClass .spaceit_pad').first().parent().html();
                tempWrapHtml += '</div>';
              tempWrapHtml += '</div>';
            tempWrapHtml += '</div>';

          });
          for(var i=0; i < 10; i++){
            tempWrapHtml +='<div class="listPlaceholder" style="height: 0;"><div class="mdl-grid" style="width: 126px;"></div></div>';
          }
          tempWrapHtml += '</div>';
          if(charFound) html += tempWrapHtml;

        }catch(e) {console.log('[iframeOverview] Error:',e);}
        return html;
      },
      info: function(){
        var html = '';
        try{
          var infoBlock = this.xhr.split('<h2>Information</h2>')[1].split('<h2>')[0];
          var infoData = j.$.parseHTML( infoBlock );
          var infoHtml = '<ul class="mdl-grid mdl-grid--no-spacing mdl-list mdl-cell mdl-cell--12-col">';
          j.$.each(j.$(infoData).filter('div'), ( index, value ) => {
            if((index + 4) % 4 == 0 && index != 0){
            //infoHtml +='</ul><ul class="mdl-list mdl-cell mdl-cell--3-col mdl-cell--4-col-tablet">';
            }
            infoHtml += '<li class="mdl-list__item mdl-list__item--three-line mdl-cell mdl-cell--3-col mdl-cell--4-col-tablet">';
              infoHtml += '<span class="mdl-list__item-primary-content">';
                infoHtml += '<span>';
                  infoHtml += j.$(value).find('.dark_text').text();
                infoHtml += '</span>';
                infoHtml += '<span class="mdl-list__item-text-body">';
                  j.$(value).find('.dark_text').remove();
                  infoHtml += j.$(value).html();
                  //j.$(value).find('*').each(function(){infoHtml += j.$(value)[0].outerHTML});
                  //infoHtml += j.$(value).find('span[itemprop=ratingValue]').height() != null ? j.$(value).find('span[itemprop=ratingValue]').text() : j.$(value).clone().children().remove().end().text();
                infoHtml += '</span>';
            infoHtml += '</span>';
            infoHtml += '</li>';
          });
          infoHtml += '</ul>';
          html += '<div class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col mdl-shadow--4dp info-block mdl-grid malClear">'+infoHtml+'</div>';
        }catch(e) {console.log('[iframeOverview] Error:',e);}
        return html;
      },
    },
    methods: {
      getMal2KissFavicon: function(streams){
        return utils.favicon(streams[Object.keys(streams)[0]].url.split('/')[2]);
      },
      getRelated: function(){
        var html = '';
        var el = [];
        try{
          var relatedBlock = this.xhr.split('Related ')[1].split('</h2>')[1].split('<h2>')[0];
          var related = j.$.parseHTML( relatedBlock );
          j.$.each(j.$(related).filter('table').find('tr'), function( index, value ) {
            var links = [];
            j.$(value).find('.borderClass').last().find('a').each(function( index, value ) {
              links.push({
                url: j.$(value).attr('href'),
                title: j.$(value).text(),
                statusTag: ''
              });
            });
            el.push({
              type: j.$(value).find('.borderClass').first().text(),
              links: links
            })
          });
        }catch(e) {console.log('[iframeOverview] Error:',e);}
        return el;
      }
    }
  }
</script>
