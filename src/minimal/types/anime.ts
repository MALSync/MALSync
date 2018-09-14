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
          var tempHtml = $.parseHTML( statsBlock );
          var statsHtml = '<ul class="mdl-list mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col" style="display: flex; justify-content: space-around;">';
          $.each($(tempHtml).filter('div').slice(0,5), function( index, value ) {
              statsHtml += '<li class="mdl-list__item mdl-list__item--two-line" style="padding: 0; padding-left: 10px; padding-right: 3px; min-width: 18%;">';
                  statsHtml += '<span class="mdl-list__item-primary-content">';
                      statsHtml += '<span>';
                          statsHtml += $(this).find('.dark_text').text();
                      statsHtml += '</span>';
                      statsHtml += '<span class="mdl-list__item-sub-title">';
                          statsHtml += $(this).find('span[itemprop=ratingValue]').height() != null ? $(this).find('span[itemprop=ratingValue]').text() : $(this).clone().children().remove().end().text();
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
                    <select name="myinfo_status" id="myinfo_status" class="inputtext js-anime-status-dropdown mdl-textfield__input" style="outline: none;">
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
                    <input type="text" id="myinfo_watchedeps" name="myinfo_watchedeps" size="3" class="inputtext mdl-textfield__input" value="6" style="width: 35px; display: inline-block;"> / <span id="curEps">12</span>
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
                    <select name="myinfo_score" id="myinfo_score" class="inputtext mdl-textfield__input" style="outline: none;">
                      <option value="0">Select</option>
                      <option selected="selected" value="10">(10) Masterpiece</option>
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
        var related = $.parseHTML( relatedBlock );
        var relatedHtml = '<ul class="mdl-list">';
        $.each($(related).filter('table').find('tr'), function( index, value ) {
          relatedHtml += '<li class="mdl-list__item mdl-list__item--two-line">';
            relatedHtml += '<span class="mdl-list__item-primary-content">';
              relatedHtml += '<span>';
                relatedHtml += $(this).find('.borderClass').first().text();
              relatedHtml += '</span>';
              relatedHtml += '<span class="mdl-list__item-sub-title">';
                               $(this).find('.borderClass').last().each(function(){
                                // @ts-ignore
                                $(this).html($(this).children());
                               })
                relatedHtml += $(this).find('.borderClass').last().html();
              relatedHtml += '</span>';
            relatedHtml += '</span>';
          relatedHtml += '</li>';
        });
        relatedHtml += '</ul>';

        html += `<div class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp related-block alternative-list mdl-grid malClear">
                  ${relatedHtml}
                </div>`
      }catch(e) {console.log('[iframeOverview] Error:',e);}

      resolve('<div class="mdl-grid">'+html+'</div>');
    });
  }

  async lazyLoadOverview(minimal){
    try{
      con.log('Streaming UI');
      var malObj = new mal(this.url);
      await malObj.init();

      minimal.find('#myinfo_status').val(malObj.getStatus());
      minimal.find('#myinfo_watchedeps').val(malObj.getEpisode());
      minimal.find('#curEps').html(malObj.totalEp);
      minimal.find('#myinfo_score').val(malObj.getScore());

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
