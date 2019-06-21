import {metadataInterface, searchInterface} from "./../listInterface";
import * as helper from "./helper";

export class metadata implements metadataInterface{
  private xhr;

  id: number;
  private kitsuSlug: string = '';
  kitsuId: number = NaN;
  readonly type: "anime"|"manga";

  private animeInfo;

  constructor(public malUrl:string){
    this.type = utils.urlPart(malUrl, 3);
    if(typeof malUrl !== 'undefined' && malUrl.indexOf("myanimelist.net") > -1){
      this.id = utils.urlPart(malUrl, 4);
    }else if(typeof malUrl !== 'undefined' && malUrl.indexOf("kitsu.io") > -1){
      this.id = NaN;
      this.kitsuSlug = utils.urlPart(malUrl, 4);
    }else{
      this.id = NaN;
    }
    return this;
  }

  animeI(){
    return this.animeInfo.data;
  }

  async init(){
    con.log('Update Kitsu info', this.id? 'MAL: '+this.id : 'Kitsu: '+this.kitsuSlug);
    if(isNaN(this.id)){
      var kitsuSlugRes = await helper.kitsuSlugtoKitsu(this.kitsuSlug, this.type);
      this.kitsuId = kitsuSlugRes.res.data[0].id;
      this.id = kitsuSlugRes.malId;
    }
    if(isNaN(this.kitsuId)){
      var kitsuRes = await helper.malToKitsu(this.id, this.type);
      try{
        this.kitsuId = kitsuRes.data[0].relationships.item.data.id;
      }catch(e){
        con.error('Not found', e);
      }

    }


    return api.request.xhr('GET', {
      url: 'https://kitsu.io/api/edge/'+this.type+'/'+this.kitsuId+'?include=characters.character,mediaRelationships.destination,categories&fields[categories]=slug,title&',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      data: {},
    }).then((response) => {
      var res = JSON.parse(response.responseText);
      con.log(res);
      this.animeInfo = res;

      try{
        this.animeI().attributes.slug;
      }catch(e){
        con.error(e);
        throw 'Not Found';
      }

      return this;
    });
  };

  getTitle(){
    var title = '';
    try{
      title = helper.getTitle(this.animeI().attributes.titles);
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return title;
  }

  getDescription(){
    var description = '';
    try{
      description = '<span style="white-space: pre-line;">'+this.animeI().attributes.synopsis.replace('—', ' ')+'</span>';
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return description;
  }

  getImage(){
    var image = '';
    try{
      image = this.animeI().attributes.posterImage.large;
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return image;
  }

  getAltTitle(){
    var altTitle: string[] = [];
    try{
      for (var prop in this.animeI().attributes.abbreviatedTitles) {
        var el = this.animeI().attributes.abbreviatedTitles[prop];
        if(el !== this.getTitle() && el){
          altTitle.push(el);
        }
      }

      for (var prop in this.animeI().attributes.titles) {
        var el = this.animeI().attributes.titles[prop];
        if(el !== this.getTitle() && el){
          altTitle.push(el);
        }
      }
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return altTitle;
  }

  getCharacters(){
    var charArray:any[] = [];
    try{
      this.animeInfo.included.forEach(function(i){
        if(i.type === "characters" && charArray.length < 10){
          var name = i.attributes.name;
          if(typeof i.attributes.malId !== 'undefined' && i.attributes.malId !== null && i.attributes.malId){
            name = '<a href="https://myanimelist.net/character/'+i.attributes.malId+'">'+name+'</a>'
          }

          charArray.push({
            img: (i.attributes.image !== null) ? i.attributes.image.original : api.storage.assetUrl('questionmark.gif'),
            html: name
          });
        }
      })
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return charArray;
  }

  getStatistics(){
    var stats: any[] = [];
    try{
      if(this.animeI().attributes.averageRating !== null) stats.push({
        title: 'Score:',
        body: this.animeI().attributes.averageRating
      });

      if(this.animeI().attributes.ratingRank !== null) stats.push({
        title: 'Ranked:',
        body: '#'+this.animeI().attributes.ratingRank
      });

      if(this.animeI().attributes.popularityRank !== null) stats.push({
        title: 'Popularity:',
        body: '#'+this.animeI().attributes.popularityRank
      });

      if(this.animeI().attributes.userCount !== null) stats.push({
        title: 'Members:',
        body: this.animeI().attributes.userCount
      });
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return stats;
  }

  getInfo(){
    var html: any[] = [];
    try{

      if(typeof this.animeI().attributes.subtype !== "undefined" && this.animeI().attributes.subtype !== null){
        var format = this.animeI().attributes.subtype.toLowerCase().replace('_', ' ');
        format = format.charAt(0).toUpperCase() + format.slice(1)
        html.push({
          title: 'Format:',
          body: format
        });
      }

      if(typeof this.animeI().attributes.episodeCount !== "undefined" && this.animeI().attributes.episodeCount !== null) html.push({
        title: 'Episodes:',
        body: this.animeI().attributes.episodeCount
      });

      if(typeof this.animeI().attributes.episodeLength !== "undefined" && this.animeI().attributes.episodeLength !== null) html.push({
        title: 'Episode Duration:',
        body: this.animeI().attributes.episodeLength+' mins'
      });

      if(typeof this.animeI().attributes.status !== "undefined" && this.animeI().attributes.status !== null){
        var status = this.animeI().attributes.status.toLowerCase().replace('_', ' ');
        status = status.charAt(0).toUpperCase() + status.slice(1)
        html.push({
          title: 'Status:',
          body: status
        });
      }

      if(typeof this.animeI().attributes.startDate !== "undefined" && this.animeI().attributes.startDate !== null) html.push({
        title: 'Start Date:',
        body: this.animeI().attributes.startDate
      });

      if(typeof this.animeI().attributes.endDate !== "undefined" && this.animeI().attributes.endDate !== null) html.push({
        title: 'Start Date:',
        body: this.animeI().attributes.endDate
      });

      var genres: string[] = [];
      this.animeInfo.included.forEach((i) => {
        if(i.type === 'categories' && genres.length < 6){
          genres.push('<a href="https://kitsu.io/'+this.type+'?categories='+i.attributes.slug+'">'+i.attributes.title+'</a>');
        }
      });
      if(genres.length) html.push({
        title: 'Genres:',
        body: genres.join(', ')
      });

      if(typeof this.animeI().attributes.ageRating !== "undefined" && this.animeI().attributes.ageRating !== null) html.push({
        title: 'Rating:',
        body: this.animeI().attributes.ageRating
      });

      if(typeof this.animeI().attributes.totalLength !== "undefined" && this.animeI().attributes.totalLength !== null) html.push({
        title: 'Total playtime:',
        body: this.animeI().attributes.totalLength+' mins'
      });


    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return html;
  }

  getOpeningSongs(){
    var openingSongs = [];

    try{

    }catch(e) {console.log('[iframeOverview] Error:',e);}

    return openingSongs;
  }

  getEndingSongs(){
    var endingSongs = [];

    try{

    }catch(e) {console.log('[iframeOverview] Error:',e);}

    return endingSongs;
  }

  getRelated(){
    var html = '';
    var el:{type: string, links: {url: string, title: string, statusTag: string}[]}[] = [];
    var links: any = {};
    try{
      var an: any[] = [];
      this.animeInfo.included.forEach(function(i){
        if(i.type === 'manga' || i.type === 'anime'){
          an[i.id] = {
            url: 'https://kitsu.io/'+i.type+'/'+i.attributes.slug,
            title: helper.getTitle(i.attributes.titles),
            statusTag: ''
          };
        }
      });

      this.animeInfo.included.forEach(function(i){
        if(i.type === "mediaRelationships"){
          if(typeof links[i.attributes.role] === "undefined" ){
            var title = i.attributes.role.toLowerCase().replace('_', ' ');
            title = title.charAt(0).toUpperCase() + title.slice(1)

            links[i.attributes.role] = {
              type: title,
              links: []
            };
          }
          var el = an[i.relationships.destination.data.id]
          links[i.attributes.role]['links'].push(el);
        }
      });
      el = Object.keys(links).map(key => links[key]);
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return el;
  }

}

export function search(keyword, type: "anime"|"manga", options = {}, sync = false): searchInterface{
  return api.request.xhr('GET', {
    url: 'https://kitsu.io/api/edge/'+type+'?filter[text]='+keyword+'&page[limit]=10&page[offset]=0&include=mappings,mappings.item&fields['+type+']=id,slug,titles,averageRating,startDate,posterImage,subtype',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
    data: {},
  }).then((response) => {
    var res = JSON.parse(response.responseText);
    con.log('search',res);

    var resItems:any = [];
    j.$.each(res.data, function( index, item ) {
      var malId = null;
      for (var k = 0; k < res.included.length; k++) {
        var mapping = res.included[k];
        if(mapping.type == 'mappings'){
          if(mapping.attributes.externalSite === 'myanimelist/'+type){
            if(mapping.relationships.item.data.id == item.id){
              malId = mapping.attributes.externalId;
              res.included.splice(k, 1);
              break;
            }
          }
        }
      }

      resItems.push({
        id: item.id,
        name: helper.getTitle(item.attributes.titles),
        url: 'https://kitsu.io/'+type+'/'+item.attributes.slug,
        malUrl: (malId) ? 'https://myanimelist.net/'+type+'/'+malId : null,
        image: (item.attributes.posterImage && typeof item.attributes.posterImage.tiny !== "undefined")? item.attributes.posterImage.tiny : "",
        media_type: item.attributes.subtype,
        score: item.attributes.averageRating,
        year: item.attributes.startDate
      })
    });
    return resItems;
  });
};
