import {metadataInterface} from "./../listInterface";
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
      url: 'https://kitsu.io/api/edge/'+this.type+'/'+this.kitsuId+'',
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

    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return el;
  }

}
