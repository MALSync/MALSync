import {metadataInterface, searchInterface} from "./../listInterface";

export class metadata implements metadataInterface{
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
        image = this.xhr.split('js-scrollfix-bottom')[1].split('data-src="')[1].split('"')[0];
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return image;
  }

  getAltTitle(){
    var altTitle = [];
    try{
      var tempHtml = j.$.parseHTML( '<div>'+this.xhr.split('<h2>Alternative Titles</h2>')[1].split('<h2>')[0]+'</div>' );
      altTitle = j.$(tempHtml).find('.spaceit_pad').toArray().map(function(i){
        return utils.getBaseText(j.$(i)).trim();
      });
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
          charImg = api.storage.assetUrl('questionmark.gif');
        }

        charImg = utils.handleMalImages(charImg);

        charArray.push({img: charImg, html: j.$(value).find('.borderClass .spaceit_pad').first().parent().html()});

      });

    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return charArray;
  }

  getStatistics(){
    var stats: any[] = [];
    try{
        var statsBlock = this.xhr.split('<h2>Statistics</h2>')[1].split('<h2>')[0];
        // @ts-ignore
        var tempHtml = j.$.parseHTML( statsBlock );

        j.$.each(j.$(tempHtml).filter('div').slice(0,5), function( index, value ) {
          var title = j.$(value).find('.dark_text').text();
          var body = j.$(value).find('span[itemprop=ratingValue]').height() != null ? j.$(value).find('span[itemprop=ratingValue]').text() : j.$(value).clone().children().remove().end().text();
          stats.push({
            title,
            body: body.trim()
          })
        });

    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return stats;
  }

  getInfo(){
    var html: any[] = [];
    try{
      var infoBlock = this.xhr.split('<h2>Information</h2>')[1].split('<h2>')[0];
      var infoData = j.$.parseHTML( infoBlock );
      j.$.each(j.$(infoData).filter('div'), ( index, value ) => {
        var title = j.$(value).find('.dark_text').text();
        j.$(value).find('.dark_text').remove();
        html.push({
          title: title.trim(),
          body: j.$(value).html().trim()
        })
      });
      this.getExternalLinks(html);
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return html;
  }

  getExternalLinks(html){
    try{
      var infoBlock = this.xhr.split('<h2>External Links</h2>')[1].split('</div>')[0]+'</div>';
      var infoData = j.$.parseHTML( infoBlock );

      var body = '';
      j.$.each(j.$(infoData).find('a'), ( index, value ) => {
        if(index) body += ', '
        body += '<a href="'+j.$(value).attr('href')+'">'+j.$(value).text()+'</a>'
      })
      if(body !== ''){
        html.push({
          title: 'External Links',
          body: body
        })
      }
    }catch(e) {console.log('[iframeOverview] Error:',e);}
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

export function search(keyword, type: "anime"|"manga", options = {}, sync = false): searchInterface{
  return api.request.xhr('GET', 'https://myanimelist.net/search/prefix.json?type='+type+'&keyword='+keyword+'&v=1').then((response) => {
    var searchResults = JSON.parse(response.responseText);
    var items = searchResults.categories[0].items;
    var resItems:any = [];
    items.forEach(function( item ) {
      resItems.push({
        id: item.id,
        name: item.name,
        url: item.url,
        malUrl: () => {return item.url},
        image: item.image_url,
        media_type: item.payload.media_type,
        score: item.payload.score,
        year: item.payload.start_year
      })
    });
    return resItems;
  });
}
