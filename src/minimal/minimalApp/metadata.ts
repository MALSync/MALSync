export class metadata{
  private xhr = "";

  constructor(public malUrl:string){
    return this;
  }

  init(){
    return api.request.xhr('GET', this.malUrl).then((response) => {
      this.xhr = response.responseText;
      return this;
    });
  };

  getTitle(){
    var title = '';
    try{
        title = this.xhr.split('itemprop="name">')[1].split('<')[0];
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return title;
  }

  getDescription(){
    var description  = '';
    try{
        description = this.xhr.split('itemprop="description">')[1].split('</span')[0];
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return description;
  }

  getImage(){
    var image = '';
    try{
        image = this.xhr.split('js-scrollfix-bottom')[1].split('<img src="')[1].split('"')[0];
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return image;
  }

  getAltTitle(){
    var altTitle = '';
    try{
        altTitle = this.xhr.split('<h2>Alternative Titles</h2>')[1].split('<h2>')[0];
        altTitle = altTitle.replace(/spaceit_pad/g,'mdl-chip" style="margin-right: 5px;');
        altTitle = altTitle.replace(/<\/span>/g,'</span><span class="mdl-chip__text">');
        altTitle = altTitle.replace(/<\/div>/g,'</span></div>');
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return altTitle;
  }

  getCharacters(){
    var charArray:any[] = [];
    try{
      var characterBlock = this.xhr.split('detail-characters-list')[1].split('</h2>')[0];
      var charHtml = j.$.parseHTML( '<div class="detail-characters-list '+characterBlock );
      var charFound = 0;

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

        charArray.push({img: charImg, html: j.$(value).find('.borderClass .spaceit_pad').first().parent().html()});

      });

    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return charArray;
  }

  getStatistics(){
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
  }

  getInfo(){
    var html = '';
    try{
      var infoBlock = this.xhr.split('<h2>Information</h2>')[1].split('<h2>')[0];
      var infoData = j.$.parseHTML( infoBlock );
      var infoHtml = '<ul class="mdl-grid mdl-grid--no-spacing mdl-list mdl-cell mdl-cell--12-col">';
      j.$.each(j.$(infoData).filter('div'), ( index, value ) => {
        if((index + 4) % 4 === 0 && index !== 0){
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
      infoHtml += this.getExternalLinks();
      infoHtml += '</ul>';
      html += '<div class="mdl-grid mdl-grid--no-spacing mdl-cell mdl-cell--12-col mdl-shadow--4dp info-block mdl-grid malClear">'+infoHtml+'</div>';
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return html;
  }

  getExternalLinks(){
    var html = '';
    try{
      var infoBlock = this.xhr.split('<h2>External Links</h2>')[1].split('</div>')[0]+'</div>';
      var infoData = j.$.parseHTML( infoBlock );

      var infoHtml = '';
      infoHtml += '<li class="mdl-list__item mdl-list__item--three-line mdl-cell mdl-cell--3-col mdl-cell--4-col-tablet">';
        infoHtml += '<span class="mdl-list__item-primary-content">';
          infoHtml += '<span>';
            infoHtml += 'External Links';
          infoHtml += '</span>';
          infoHtml += '<span class="mdl-list__item-text-body">';

      j.$.each(j.$(infoData).find('a'), ( index, value ) => {
        if(index) infoHtml += ', '
        infoHtml += '<a href="'+j.$(value).attr('href')+'">'+j.$(value).text()+'</a>'
      })
          infoHtml += '</span>';
      infoHtml += '</span>';
      infoHtml += '</li>';
      html = infoHtml;

    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return html;
  }

  getOpeningSongs(){
    var openingSongs = [];

    try{
      var openingBlock = '<div>'+this.xhr.split('opnening">')[1].split('</div>')[0]+'</div>';
      var openingData = j.$.parseHTML( openingBlock );
      openingSongs = j.$.map(j.$(openingData).find('.theme-song'), j.$.text);
    }catch(e) {console.log('[iframeOverview] Error:',e);}

    return openingSongs;
  }

  getEndingSongs(){
    var endingSongs = [];

    try{
      var endingBlock = '<div>'+this.xhr.split(' ending">')[1].split('</div>')[0]+'</div>';
      var endingData = j.$.parseHTML( endingBlock );
      endingSongs = j.$.map(j.$(endingData).find('.theme-song'), j.$.text);
    }catch(e) {console.log('[iframeOverview] Error:',e);}

    return endingSongs;
  }

  getRelated(){
    var html = '';
    var el:{type: string, links: any[]}[] = [];
    try{
      var relatedBlock = this.xhr.split('Related ')[1].split('</h2>')[1].split('<h2>')[0];
      var related = j.$.parseHTML( relatedBlock );
      j.$.each(j.$(related).filter('table').find('tr'), function( index, value ) {
        var links:{url: string, title: string, statusTag: string}[] = [];
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
