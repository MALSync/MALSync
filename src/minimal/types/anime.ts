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
