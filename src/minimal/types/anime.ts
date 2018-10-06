import {mal} from "./../../utils/mal";

export class animeType{
  private vars;

  constructor(public url){

  }

  init(){
    var This = this;
    return new Promise((resolve, reject) => {
      return api.request.xhr('GET', This.url).then((response) => {
        This.vars = response.responseText;
        resolve();
      });
    });
  }

  overview(minimal){
    return new Promise((resolve, reject) => {
      var data = this.vars;
      var html = '';

      var image = '';
      var title = '';
      var description  = '';
      var altTitle = '';
      var stats = '';

      try{
          image = data.split('js-scrollfix-bottom')[1].split('<img src="')[1].split('"')[0];
      }catch(e) {console.log('[iframeOverview] Error:',e);}

      try{
          title = data.split('itemprop="name">')[1].split('<')[0];
      }catch(e) {console.log('[iframeOverview] Error:',e);}

      try{
          description = data.split('itemprop="description">')[1].split('</span')[0];
      }catch(e) {console.log('[iframeOverview] Error:',e);}

      try{
          altTitle = data.split('<h2>Alternative Titles</h2>')[1].split('<h2>')[0];
          altTitle = altTitle.replace(/spaceit_pad/g,'mdl-chip" style="margin-right: 5px;');
          altTitle = altTitle.replace(/<\/span>/g,'</span><span class="mdl-chip__text">');
          altTitle = altTitle.replace(/<\/div>/g,'</span></div>');
      }catch(e) {console.log('[iframeOverview] Error:',e);}

      try{
          var statsBlock = data.split('<h2>Statistics</h2>')[1].split('<h2>')[0];
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

      html += overviewElement(this.url, title, image, description, altTitle, stats);
      try{
        html +=
        `<div class="mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp data-block mdl-grid mdl-grid--no-spacing malClear">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tbody>
              <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
                <span class="mdl-list__item-primary-content">
                  <span>Status:</span>
                  <span class="mdl-list__item-text-body">
                    <select name="myinfo_status" id="myinfo_status" class="inputtext js-anime-status-dropdown mdl-textfield__input" style="outline: none; visibility: hidden;">
                      <option selected="selected" value="1">Watching</option>
                      <option value="2">Completed</option>
                      <option value="3">On-Hold</option>
                      <option value="4">Dropped</option>
                      <option value="6">Plan to Watch</option>
                    </select>
                  </span>
                </span>
              </li>
              <li class="mdl-list__item mdl-list__item--three-line" style="width: 100%;">
                <span class="mdl-list__item-primary-content">
                  <span>Eps Seen:</span>
                  <span class="mdl-list__item-text-body">
                    <input type="text" id="myinfo_watchedeps" name="myinfo_watchedeps" size="3" class="inputtext mdl-textfield__input" value="6" style="width: 35px; display: inline-block; visibility: hidden;"> / <span id="curEps" style="visibility: hidden;">12</span>
                    <a href="javascript:void(0)" class="js-anime-increment-episode-button" target="_blank">
                      <i class="fa fa-plus-circle ml4">
                      </i>
                    </a>
                  </span>
                </span>
              </li>
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
                  <a href="https://myanimelist.net/ownlist/anime/${utils.urlPart(this.url, 4)}/edit" target="_blank">Edit Details</a>
                </small>
              </li>

            </tbody>
          </table>
        </div>`;
      }catch(e) {console.log('[iframeOverview] Error:',e);}

      try{
        var relatedBlock = data.split('Related ')[1].split('</h2>')[1].split('<h2>')[0];
        var related = j.$.parseHTML( relatedBlock );
        var relatedHtml = '<ul class="mdl-list">';
        j.$.each(j.$(related).filter('table').find('tr'), function( index, value ) {
          relatedHtml += '<li class="mdl-list__item mdl-list__item--two-line">';
            relatedHtml += '<span class="mdl-list__item-primary-content">';
              relatedHtml += '<span>';
                relatedHtml += j.$(value).find('.borderClass').first().text();
              relatedHtml += '</span>';
              relatedHtml += '<span class="mdl-list__item-sub-title">';
                                j.$(value).find('.borderClass').last().each(function( index, value){
                                   j.$(value).html(j.$(value).children());
                                })
                relatedHtml += j.$(value).find('.borderClass').last().html();
              relatedHtml += '</span>';
            relatedHtml += '</span>';
          relatedHtml += '</li>';
        });
        relatedHtml += '</ul>';

        html += `<div class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp related-block alternative-list mdl-grid malClear">
                  ${relatedHtml}
                </div>`
      }catch(e) {console.log('[iframeOverview] Error:',e);}

      try{
        html += `<div style="display: none;" class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp mdl-grid alternative-list stream-block malClear">
                  <ul class="mdl-list stream-block-inner">
                  </ul>
                </div>`;
      }catch(e) {console.log('[iframeOverview] Error:',e);}

      try{
        var characterBlock = data.split('detail-characters-list')[1].split('</h2>')[0];
        var charHtml = j.$.parseHTML( '<div class="detail-characters-list '+characterBlock );
        var temphtml = '';
        var charFound = 0;
        var tempWrapHtml = '<div class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col mdl-shadow--4dp characters-block mdl-grid malClear">\
        <div class="mdl-card__actions clicker" style="display: none;">\
          <h1 class="mdl-card__title-text" style="float: left;">Characters</h1>\
          <i class="material-icons mdl-accordion__icon mdl-animation--default remove" style="float: right; margin-top: 3px;">expand_more</i>\
        </div>\
        <div class="mdl-grid mdl-card__actions mdl-card--border" id="characterList" style="justify-content: space-between; display: none;">';

        j.$.each(j.$(charHtml).find(':not(td) > table'), ( index, value ) => {
          if(!index) charFound = 1;
          var regexDimensions = /\/r\/\d*x\d*/g;
          var charImg = j.$(value).find('img').first().attr("data-src");
          if ( regexDimensions.test(charImg!)){
            charImg = charImg!.replace(regexDimensions, '');
          }else{
            charImg = 'https://myanimelist.cdn-dena.com/images/questionmark_23.gif';
          }

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
        tempWrapHtml += '</div></div>';
        if(charFound) html += tempWrapHtml;

      }catch(e) {console.log('[iframeOverview] Error:',e);}

      try{
          var infoBlock = data.split('<h2>Information</h2>')[1].split('<h2>')[0];
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

      resolve('<div class="mdl-grid">'+html+'</div>');
    });
  }

  async lazyLoadOverview(minimal){
    //minimal.find('.characters-block .clicker').one('click', function(){
      minimal.find('#characterList').show();
      minimal.find('.characters-block .remove').remove();
    //});

    try{
      utils.epPredictionUI(utils.urlPart(this.url, 4), function(prediction){
        con.log(prediction);
        minimal.find('[id="curEps"]').before(prediction.tag+' ');
        if(!prediction.prediction.airing){
          minimal.find('.data-block').prepend('<li class="mdl-list__item" style="width: 100%;">'+prediction.text+'</li>');
        }
      });
    }catch(e) {console.log('[iframeOverview] Error:',e);}

    try{
      con.log('Streaming UI');
      var malObj = new mal(this.url);
      await malObj.init();

      minimal.find('#myinfo_status').val(malObj.getStatus()).css('visibility', 'visible');
      minimal.find('#myinfo_watchedeps').val(malObj.getEpisode()).css('visibility', 'visible');
      minimal.find('#curEps').html(malObj.totalEp).css('visibility', 'visible');
      minimal.find('#myinfo_score').val(malObj.getScore()).css('visibility', 'visible');

      minimal.find('.inputButton').click(function(){
        malObj.setStatus(minimal.find('#myinfo_status').val());
        malObj.setEpisode( minimal.find('#myinfo_watchedeps').val());
        malObj.setScore(minimal.find('#myinfo_score').val());
        malObj.sync()
          .then(function(){
            utils.flashm('Updated');
          }, function(){
            utils.flashm( "Anime update failed" , {error: true});
          });
      });


      var streamUrl = malObj.getStreamingUrl();
      if(typeof streamUrl !== 'undefined'){

        var streamhtml =
        `<div class="mdl-card__actions mdl-card--border" style="padding-left: 0;">
          <div class="data title progress" style="display: inline-block; position: relative; top: 2px; margin-left: -2px;">
            <a class="stream mdl-button mdl-button--colored mdl-js-button mdl-button--raised" title="${streamUrl.split('/')[2]}" target="_blank" style="margin: 0px 5px; color: white;" href="${streamUrl}">
              <img src="https://www.google.com/s2/favicons?domain=${streamUrl.split('/')[2]}" style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;">Continue Watching
            </a>`;

        var resumeUrlObj = await malObj.getResumeWaching();
        var continueUrlObj = await malObj.getContinueWaching();
        con.log('Resume', resumeUrlObj, 'Continue', continueUrlObj);
        if(typeof continueUrlObj !== 'undefined' && continueUrlObj.ep === (malObj.getEpisode()+1)){
          streamhtml +=
            `<a class="nextStream mdl-button mdl-button--colored mdl-js-button mdl-button--raised" title="Continue watching" target="_blank" style="margin: 0px 5px 0px 0px; color: white;" href="${continueUrlObj.url}">
              <img src="${api.storage.assetUrl('double-arrow-16px.png')}" width="16" height="16" style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;">Next Episode
            </a>`;
        }else if(typeof resumeUrlObj !== 'undefined' && resumeUrlObj.ep === malObj.getEpisode()){
          streamhtml +=
            `<a class="resumeStream mdl-button mdl-button--colored mdl-js-button mdl-button--raised" title="Resume watching" target="_blank" style="margin: 0px 5px 0px 0px; color: white;" href="${resumeUrlObj.url}">
              <img src="${api.storage.assetUrl('arrow-16px.png')}" width="16" height="16" style="padding-bottom: 3px; padding-right: 6px; margin-left: -3px;">Resume Episode
            </a>`;
        }

        streamhtml +=
          `</div>
        </div>`;

        minimal.find('.malDescription').first().append(streamhtml);
      }

    }catch(e) {console.log('[iframeOverview] Error:',e);}

    try{
      utils.getMalToKissArray(utils.urlPart(this.url, 3), utils.urlPart(this.url, 4)).then((links) => {
        var Kisshtml = '';
        for(var pageKey in links){
          var page = links[pageKey];

          var tempHtml = '';
          var tempUrl = '';
          for(var streamKey in page){
            var stream = page[streamKey];
            tempHtml += '<div class="mal_links"><a target="_blank" href="'+stream['url']+'">'+stream['title']+'</a></div>';
            tempUrl = stream['url'];
          }

          Kisshtml += `<li class="mdl-list__item mdl-list__item--three-line">
                        <span class="mdl-list__item-primary-content">
                          <span>
                            <img style="padding-bottom: 3px;" src="https://www.google.com/s2/favicons?domain=${tempUrl.split('/')[2]}">
                            ${pageKey}
                          </span>
                          <span id="KissAnimeLinks" class="mdl-list__item-text-body">
                            ${tempHtml}
                          </span>
                        </span>
                       </li>`;

        }
        minimal.find('.stream-block').show().find('.stream-block-inner').prepend(Kisshtml);
      })
    }catch(e) {console.log('[iframeOverview] Error:',e);}

  }

  async reviews(minimal){
    return new Promise((resolve, reject) => {
      con.info('Loading reviews');
      var data = this.vars;
      try{
          var reviews = data.split('Reviews</h2>')[1].split('<h2>')[0];
          var reviewsData = j.$.parseHTML( reviews );
          var reviewsHtml = '<div class="mdl-grid">';
          j.$.each(j.$(reviewsData).filter('.borderDark'), ( index, value ) => {
            reviewsHtml += '<div class="mdl-cell mdl-cell--12-col mdl-shadow--4dp">';
              reviewsHtml += '<div class="mdl-card__supporting-text mdl-card--border" style="color: black;">';
                j.$(value).find('.spaceit > div').css('max-width','60%');
                reviewsHtml += j.$(value).find('.spaceit').first().html();
              reviewsHtml += '</div>';

              reviewsHtml += '<div class="mdl-card__supporting-text" style="color: black;">';
                j.$(value).find('.textReadability, .textReadability > span').contents().filter(function(){
                  // @ts-ignore
                  return this.nodeType == 3 && j.$.trim(this.nodeValue).length;
                }).wrap('<p style="margin:0;padding=0;"/>');
                j.$(value).find('br').css('line-height','10px');
                reviewsHtml += j.$(value).find('.textReadability').html();
              reviewsHtml += '</div>';
            reviewsHtml += '</div>';
          });
          reviewsHtml += '</div>';
          if(reviewsHtml == '<div class="mdl-grid"></div>'){
            reviewsHtml = '<span class="mdl-chip" style="margin: auto; margin-top: 16px; display: table;"><span class="mdl-chip__text">Nothing Found</span></span>';
          }

          resolve(reviewsHtml);
          /*j.$("#info-iframe").contents().find('#malReviews').html(reviewsHtml).show();
          */
      }catch(e) {console.log('[iframeReview] Error:',e);}
    });
  }

  async lazyLoadReviews(minimal){
    minimal.find('.js-toggle-review-button').addClass('nojs').click(function(){
      // @ts-ignore
      var revID = j.$(this).attr('data-id');
      minimal.find('#review'+revID).css('display','initial');
      minimal.find('#revhelp_output_'+revID).remove();
      // @ts-ignore
      j.$(this).remove();
    });
    minimal.find('.mb8 a').addClass('nojs').click(function(){
      // @ts-ignore
      var revID = j.$(this).attr('onclick').split("j.$('")[1].split("'")[0];
      minimal.find(revID).toggle();
    });
  }

  async recommendations(minimal){

    //return new Promise((resolve, reject) => {
    return api.request.xhr('GET', this.url+'/userrecs').then((response) => {
      var data = response.responseText;
      try{
        var recommendationsBlock = data.split('Make a recommendation</a>')[1].split('</h2>')[1].split('<div class="mauto')[0];
        var html = j.$.parseHTML( recommendationsBlock );
        var recommendationsHtml = '<div class="mdl-grid">';
        j.$.each(j.$(html).filter('.borderClass'),( index, value ) => {
          recommendationsHtml += '<div class="mdl-cell mdl-cell--6-col mdl-cell--8-col-tablet mdl-shadow--4dp mdl-grid">';
            recommendationsHtml += '<div class="mdl-card__media" style="background-color: transparent; margin: 8px;">';
              recommendationsHtml += j.$(value).find('.picSurround').html();
            recommendationsHtml += '</div>';
            recommendationsHtml += '<div class="mdl-cell" style="flex-grow: 100;">';
              recommendationsHtml += '<div class="">';
                j.$(value).find('.button_edit, .button_add, td:eq(1) > div:eq(1) span').remove();
                recommendationsHtml += j.$(value).find('td:eq(1) > div:eq(1)').html();
              recommendationsHtml += '</div>';
              recommendationsHtml += '<div class="">';
                j.$(value).find('a[href^="/dbchanges.php?go=report"]').remove();
                recommendationsHtml += j.$(value).find('.borderClass').html();
              recommendationsHtml += '</div>';
              recommendationsHtml += '<div class="">';
                recommendationsHtml += (typeof j.$(value).find('.spaceit').html() != 'undefined') ? j.$(value).find('.spaceit').html() : '';
                recommendationsHtml += '<div class="more" style="display: none;">';
                  recommendationsHtml += j.$(value).find('td:eq(1) > div').last().html();
                recommendationsHtml += '</div>';
              recommendationsHtml += '</div>';
            recommendationsHtml += '</div>';
            /*recommendationsHtml += '<div class="mdl-card__supporting-text mdl-card--border" style="color: black;">';
              j.$(value).find('.spaceit > div').css('max-width','60%');
              recommendationsHtml += j.$(value).find('.spaceit').first().html();
            recommendationsHtml += '</div>';
            recommendationsHtml += '<div class="mdl-card__supporting-text" style="color: black;">';
              j.$(value).find('.textReadability, .textReadability > span').contents().filter(function(){
                return value.nodeType == 3 && j.$.trim(value.nodeValue).length;
              }).wrap('<p style="margin:0;padding=0;"/>');
              j.$(value).find('br').css('line-height','10px');
              recommendationsHtml += j.$(value).find('.textReadability').html();
            recommendationsHtml += '</div>';*/
            //recommendationsHtml += j.$(value).html();
          recommendationsHtml += '</div>';
        });
        recommendationsHtml += '</div>';

        if(recommendationsHtml == '<div class="mdl-grid"></div>'){
          recommendationsHtml = '<span class="mdl-chip" style="margin: auto; margin-top: 16px; display: table;"><span class="mdl-chip__text">Nothing Found</span></span>';
        }

        //resolve(recommendationsHtml);
        return recommendationsHtml;
      }catch(e) {console.log('[iframeRecommendations] Error:',e);}
    });
  }

  async lazyLoadRecommendations(minimal){
    // @ts-ignore
    minimal.find('.js-similar-recommendations-button').addClass('nojs').click(function(){j.$(this).parent().find('.more').toggle();});
    minimal.find('.js-toggle-recommendation-button').addClass('nojs').click(function(){
      // @ts-ignore
      var revID = j.$(this).attr('data-id');
      minimal.find('#recommend'+revID).css('display','initial');
      // @ts-ignore
      j.$(this).remove();
    });
    minimal.find('#malRecommendations .more .borderClass').addClass('mdl-shadow--2dp').css('padding','10px');
    // @ts-ignore
    minimal.find('.lazyload').each(function() { j.$(this).attr('src', j.$(this).attr('data-src'));});//TODO: use lazyloading
  }

}


function overviewElement(url, title, image, description, altTitle, stats){
  return `
    <div class="mdl-cell mdl-cell--1-col mdl-cell--8-col-tablet mdl-cell--6-col-phone mdl-shadow--4dp stats-block malClear" style="min-width: 120px;">
      ${stats}
    </div>
    <div class="mdl-grid mdl-cell mdl-shadow--4dp coverinfo malClear" style="display:block; flex-grow: 100; min-width: 70%;">
      <div class="mdl-card__media mdl-cell mdl-cell--2-col" style="background-color: transparent; float:left; padding-right: 16px;">
        <img class="malImage malClear" style="width: 100%; height: auto;" src="${image}"></img>
      </div>
      <div class="mdl-cell mdl-cell--12-col">
        <a class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect malClear malLink" href="${url}" style="float: right;" target="_blank"><i class="material-icons">open_in_new</i></a>
        <h1 class="malTitle mdl-card__title-text malClear" style="padding-left: 0px; overflow:visible;">${title}</h1>
        <div class="malAltTitle mdl-card__supporting-text malClear" style="padding: 10px 0 0 0px; overflow:visible;">${altTitle}</div>
      </div>
      <div class="malDescription malClear mdl-cell mdl-cell--10-col" style="overflow: hidden;">
        <p style="color: black;">
          ${description}
        </p>
      </div>
    </div>
  `;
}
