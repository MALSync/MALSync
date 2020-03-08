import {SingleAbstract} from './../singleAbstract';
import * as helper from "./helper";
import {errorCode} from "./../definitions";

export class Single extends SingleAbstract {

  private animeInfo: any;

  listI(){
    return this.animeInfo.data[0];
  }

  animeI(){
    return this.animeInfo.included[0];
  }

  shortName = 'Kitsu';
  authenticationUrl = 'https://kitsu.io/404?mal-sync=authentication';

  protected handleUrl(url) {
    if(url.match(/anilist\.co\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3);
      this.ids.kitsu.slug = utils.urlPart(url, 4);
      return;
    }
    if(url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3);
      this.ids.mal = utils.urlPart(url, 4);
      return;
    }
    throw this.errorObj(errorCode.UrlNotSuported, 'Url not supported')
  }

  getCacheKey(){
    return helper.getCacheKey(this.ids.mal, this.ids.kitsu);
  }

  _getStatus() {
    return parseInt(helper.translateList(this.listI().attributes.status));
  }

  _setStatus(status) {
    this.listI().attributes.status = helper.translateList(status, parseInt(status.toString()));
  }

  _getScore() {
    if(!this.listI().attributes.ratingTwenty) return 0;
    var score = Math.round(this.listI().attributes.ratingTwenty/2);
    return score;
  }

  _setScore(score) {
    if(score === 0){
      this.listI().attributes.ratingTwenty = null;
      return;
    }
    this.listI().attributes.ratingTwenty = score*2;
  }

  _getEpisode() {
    return this.listI().attributes.progress;
  }

  _setEpisode(episode) {
    this.listI().attributes.progress = parseInt(episode+'');
  }

  _getVolume() {
    return this.listI().attributes.volumesOwned;
  }

  _setVolume(volume) {
    this.listI().attributes.volumesOwned = volume;
  }

  _getStreamingUrl() {
    var tags = this.listI().attributes.notes;
    return utils.getUrlFromTags(tags);
  }

  _setStreamingUrl(url) {
    var tags =  this.listI().attributes.notes;
    if(tags == null || tags == 'null') tags = '';

    tags = utils.setUrlInTags(url, tags);

    this.listI().attributes.notes = tags;
  }

  _getTitle() {
    return helper.getTitle(this.animeI().attributes.titles);
  }

  _getTotalEpisodes() {
    var eps = this.animeI().attributes.episodeCount? this.animeI().attributes.episodeCount: this.animeI().attributes.chapterCount;;
    if(eps == null) return 0;
    return eps;
  }

  _getTotalVolumes() {
    var vol = this.animeI().attributes.volumeCount;
    if(!vol) return 0;
    return vol;
  }

  _getDisplayUrl() {
    return 'https://kitsu.io/'+this.getType()+'/'+this.animeI().attributes.slug;
  }

  _getImage() {
    return Promise.resolve(this.animeI().attributes.posterImage.large);
  }

  _getRating() {
    if(this.animeI().attributes.averageRating == null) return Promise.resolve('');
    return Promise.resolve(this.animeI().attributes.averageRating+'%');
  }

  async _update() {
    if(isNaN(this.ids.mal)){
      var kitsuSlugRes = await this.kitsuSlugtoKitsu(this.ids.kitsu.slug, this.getType());
      this.ids.kitsu.id = kitsuSlugRes.res.data[0].id;
      this.ids.mal = kitsuSlugRes.malId;
    }
    if(isNaN(this.ids.kitsu.id)){
      var kitsuRes = await this.malToKitsu(this.ids.mal, this.getType());
      try{
        this.ids.kitsu.id = kitsuRes.data[0].relationships.item.data.id;
      }catch(e){
        //TODO
        con.error('Not found', e);
        //if(!this.silent){
        //  utils.flashm('Kitsu: Not found', {error: true, type: 'not found'});
        //}
      }

    }

    this._authenticated = true;

    return this.apiCall('GET', 'https://kitsu.io/api/edge/library-entries?filter[user_id]='+await this.userId()+'&filter[kind]='+this.getType()+'&filter['+this.getType()+'_id]='+this.ids.kitsu.id+'&page[limit]=1&page[limit]=1&include='+this.getType()+'&fields['+this.getType()+']=slug,titles,averageRating,posterImage,'+(this.getType() == 'anime'? 'episodeCount': 'chapterCount,volumeCount'))
      .catch(e => {
        if(e.code === errorCode.NotAutenticated){
          this._authenticated = false;
          return {};
        }
        throw e;
      })
      .then((res) => {

        this.animeInfo = res;

        this._onList = true;

        if(!this.animeInfo.data.length){
          this._onList = false;
          this.animeInfo.data[0] = {
            attributes: {
              notes: "",
              progress: 0,
              volumesOwned: 0,
              reconsuming: false,
              reconsumeCount: false,
              ratingTwenty: null,
              status: 'planned'
            }
          }
          if(typeof kitsuRes !== 'undefined'){
            this.animeInfo.included = kitsuRes.included;
          }else{
            this.animeInfo.included = kitsuSlugRes.res.data;
          }

        }

        try{
          this.animeI()
        }catch(e){
          //TODO:
          con.error(e);
          throw 'Not Found';
        }

        if(!this._authenticated) throw this.errorObj(errorCode.NotAutenticated, 'Not Authenticated');
      });

  }

  async _sync() {
    var variables:any = {
      data:{
        attributes: {
          notes: this.listI().attributes.notes,
          progress: this.listI().attributes.progress,
          volumesOwned: this.listI().attributes.volumesOwned,
          reconsuming: this.listI().attributes.reconsuming,
          reconsumeCount: this.listI().attributes.reconsumeCount,
          ratingTwenty: this.listI().attributes.ratingTwenty ? this.listI().attributes.ratingTwenty : null,
          status: this.listI().attributes.status
        },
        type: "library-entries",
      }
    };
    var tType = this.getType();
    if(!tType) return;
    ​if(this.isOnList()){
      var updateUrl = 'https://kitsu.io/api/edge/library-entries/'+this.listI().id;
      variables.data.id = this.listI().id;
      var post = 'PATCH';
    }else{
      var updateUrl = 'https://kitsu.io/api/edge/library-entries/';
      variables.data.relationships = {
        [tType]: {
          data: {
            type: tType,
            id: this.ids.kitsu.id
          }
        },
        user: {
          data: {
            type: "users",
            id: await this.userId()
          }
        }
      }
      var post = 'POST';
    }

    con.log(post, variables);

    return this.apiCall(post, updateUrl, variables);
  }

  protected apiCall(mode, url, variables = {}, authentication = true) {
    var headers = {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    }
    if(authentication) headers['Authorization'] = 'Bearer ' + api.settings.get('kitsuToken')
    return api.request.xhr(mode, {
      url: url,
      headers,
      data: JSON.stringify(variables)
    }).then((response) => {
      if((response.status > 499 && response.status < 600) || response.status === 0) {
        throw this.errorObj(errorCode.ServerOffline, 'Server Offline status: '+response.status)
      }

      var res = JSON.parse(response.responseText);

      //TODO
      if(typeof res.errors != 'undefined' && res.errors.length){
        con.error('[SINGLE]','Error',res.errors);
        var error = res.errors[0];
        switch(error.status) {
          case 400:
            throw this.errorObj(errorCode.NotAutenticated, error.message);
            break;
          case 404:
            throw this.errorObj(errorCode.EntryNotFound, error.message);
            break;
          default:
            throw this.errorObj(error.status, error.message);
        }
      }

      return res;
    })
  }

  protected kitsuSlugtoKitsu(kitsuSlug: string, type: any){
    return this.apiCall('Get', 'https://kitsu.io/api/edge/'+type+'?filter[slug]='+kitsuSlug+'&page[limit]=1&include=mappings', {}, false)
      .then((res) => {
        var malId = NaN;
        if(typeof res !== 'undefined' && typeof res.included !== 'undefined'){
          for (var k = 0; k < res.included.length; k++) {
            var mapping = res.included[k];
            if(mapping.type == 'mappings'){
              if(mapping.attributes.externalSite === 'myanimelist/'+type){
                malId = mapping.attributes.externalId;
                res.included.splice(k, 1);
                break;
              }
            }
          }
        }
        return {res: res, malId: malId};
      });
  }

  protected malToKitsu(malid: number, type: any){
    return this.apiCall('Get', 'https://kitsu.io/api/edge/mappings?filter[externalSite]=myanimelist/'+type+'&filter[externalId]='+malid+'&include=item&fields[item]=id', {}, false)
      .then((res) => {
        return res;
      });
  }

  protected async userId(){
    var userId = await api.storage.get('kitsuUserId');
    if(typeof userId !== 'undefined'){
      return userId;
    }else{
      return this.apiCall('Get', 'https://kitsu.io/api/edge/users?filter[self]=true')
        .then((res) => {
          if(typeof res.data == 'undefined' || !res.data.length || typeof res.data[0] == 'undefined'){
            //TODO:
            //utils.flashm(kitsu.noLogin, {error: true, type: 'error'});
            throw('Not authentificated');
          }
          api.storage.set('kitsuUserId', res.data[0].id);
          return res.data[0].id;
        });
    }
  }

}
