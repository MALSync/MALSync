import {metadataInterface, searchInterface} from "./../listInterface";
import * as helper from "./helper";

export class metadata implements metadataInterface{
  private xhr;

  id: number;
  simklId: number = NaN;
  readonly type: "anime"|"manga";

  private animeInfo;

  constructor(public malUrl:string){
    this.type = utils.urlPart(malUrl, 3);
    if(typeof malUrl !== 'undefined' && malUrl.indexOf("myanimelist.net") > -1){
      this.id = utils.urlPart(malUrl, 4);
    }else if(typeof malUrl !== 'undefined' && malUrl.indexOf("simkl.com") > -1){
      this.id = NaN;
      this.simklId = utils.urlPart(malUrl, 4);
    }else{
      this.id = NaN;
    }
    return this;
  }

  async init(){
    con.log('Update Simkl info', this.id? 'MAL: '+this.id : 'Simkl: '+this.simklId);

    if(isNaN(this.id)){
      var de = {simkl: this.simklId};
    }else{
      //@ts-ignore
      var de = {mal: this.id};
    }

    if(isNaN(this.simklId)){
      var el = await helper.call('https://api.simkl.com/search/id', de, true);
      if(!el) throw 'Anime not found';
      con.error(el);
      this.simklId = el[0].ids.simkl;
    }

    return helper.call('https://api.simkl.com/anime/'+this.simklId, {'extended': 'full'}, true).then((res) => {
      con.log(res);
      this.animeInfo = res;
      return this;
    })
  };

  getTitle(){
    var title = '';
    try{
      title = this.animeInfo.title;
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return title;
  }

  getDescription(){
    var description = '';
    try{
      description = this.animeInfo.overview;
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return description;
  }

  getImage(){
    var image = '';
    try{
      image = 'https://simkl.in/posters/'+this.animeInfo.poster+'_ca.jpg';
    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return image;
  }

  getAltTitle(){
    var altTitle: string[] = [];
    try{
      if(typeof this.animeInfo.en_title !== undefined && this.animeInfo.en_title) altTitle.push(this.animeInfo.en_title);
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
      if(this.animeInfo.ratings.simkl.rating !== null) stats.push({
        title: 'Score:',
        body: this.animeInfo.ratings.simkl.rating
      });
      if(typeof this.animeInfo.ratings.mal !== 'undefined' && this.animeInfo.ratings.mal.rating !== null) stats.push({
        title: 'MAL Score:',
        body: this.animeInfo.ratings.mal.rating
      });

      if(typeof this.animeInfo.rank !== 'undefined' && this.animeInfo.rank !== null) stats.push({
        title: 'Ranked:',
        body: '#'+this.animeInfo.rank
      });
      if(this.animeInfo.ratings.simkl.votes !== null) stats.push({
        title: 'Votes:',
        body: this.animeInfo.ratings.simkl.votes
      });

    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return stats;
  }

  getInfo(){
    var html: any[] = [];
    try{

      if(typeof this.animeInfo.anime_type !== "undefined" && this.animeInfo.anime_type !== null) html.push({
        title: 'Type:',
        body: this.animeInfo.anime_type
      });

      if(typeof this.animeInfo.total_episodes !== "undefined" && this.animeInfo.total_episodes !== null) html.push({
        title: 'Episodes:',
        body: this.animeInfo.total_episodes
      });

      if(typeof this.animeInfo.status !== "undefined" && this.animeInfo.status !== null) html.push({
        title: 'Status:',
        body: this.animeInfo.status
      });

      if(typeof this.animeInfo.year !== "undefined" && this.animeInfo.year !== null) html.push({
        title: 'Year:',
        body: this.animeInfo.year
      });

      if(typeof this.animeInfo.airs !== "undefined" && this.animeInfo.airs !== null) html.push({
        title: 'Broadcast:',
        body: this.animeInfo.airs.day+' at '+this.animeInfo.airs.time
      });

      if(typeof this.animeInfo.network !== "undefined" && this.animeInfo.network !== null) html.push({
        title: 'Licensor:',
        body: this.animeInfo.network
      });

      var genres: string[] = [];
      this.animeInfo.genres.forEach((i) => {
        if(genres.length < 6){
          genres.push('<a href="https://simkl.com/'+this.type+'/'+i.toLowerCase()+'">'+i+'</a>');
        }
      });
      if(genres.length) html.push({
        title: 'Genres:',
        body: genres.join(', ')
      });

      if(typeof this.animeInfo.runtime !== "undefined" && this.animeInfo.runtime !== null) html.push({
        title: 'Duration:',
        body: this.animeInfo.runtime+'mins'
      });

      if(typeof this.animeInfo.certification !== "undefined" && this.animeInfo.certification !== null) html.push({
        title: 'Rating:',
        body: this.animeInfo.certification
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

    }catch(e) {console.log('[iframeOverview] Error:',e);}
    return el;
  }

}

export function search(keyword, type: "anime"|"manga", options = {}, sync = false): Promise<searchInterface>{
  return helper.call('https://api.simkl.com/search/'+type, {'q': keyword}, true).then((res) => {
    var resItems:any = [];
    con.log('search', res);
    j.$.each(res, function( index, item ) {
      resItems.push({
        id: item.ids.simkl_id,
        name: item.title,
        url: 'https://simkl.com/'+type+'/'+item.ids.simkl_id+'/'+item.ids.slug,
        malUrl: null,
        image: 'https://simkl.in/posters/'+item.poster+'_cm.jpg',
        media_type: item.type,
        score: null,
        year: item.year
      })
    });
    return resItems;
  });
};
