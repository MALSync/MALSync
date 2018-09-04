export class animeType{
  private vars;

  constructor(private url){

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

  overview(){
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

      resolve(html);
    });
  }
}

function overviewElement(url, title, image, description, altTitle, stats){
  return `<div class="mdl-grid">
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
    <div class="mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp data-block mdl-grid mdl-grid--no-spacing malClear">

    </div>
    <div class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp related-block alternative-list mdl-grid malClear">

    </div>
    <div style="display: none;" class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--4-col mdl-cell--8-col-tablet mdl-shadow--4dp mdl-grid alternative-list stream-block malClear">
      <ul class="mdl-list stream-block-inner">

      </ul>
    </div>
    <div class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col mdl-shadow--4dp characters-block mdl-grid malClear" style="display: none;"></div>
    <div class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col mdl-shadow--4dp info-block mdl-grid malClear">

    </div>
  </div>`;
}
