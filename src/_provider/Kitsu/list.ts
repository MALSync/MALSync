import {ListAbstract, listElement} from './../listAbstract';
import * as helper from "./helper";

export class userlist extends ListAbstract {

  authenticationUrl = 'https://kitsu.io/404?mal-sync=authentication';

  async getUsername() {
    var user = await this.userRequest();
    return user.attributes.name;
  }

  async getUserId() {
    var userId = await api.storage.get('kitsuUserId');
    if(typeof userId !== 'undefined'){
      return userId;
    }else{
      var user = await this.userRequest();
      api.storage.set('kitsuUserId', user.id);
      return user.id;
    }
  }

  private userRequest() {
    return api.request.xhr('Get', {
      url: 'https://kitsu.io/api/edge/users?filter[self]=true',
      headers: {
        'Authorization': 'Bearer ' + this.accessToken(),
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      }
    }).then((response) => {
      var res = this.jsonParse(response);
      con.log(res);
      this.errorHandling(res);
      if(typeof res.data[0] === 'undefined') {
        throw {
          code: 400,
          message: 'Not Authenticated',
        }
      }
      return res.data[0];
    });
  }

  errorHandling(res) {
    if(typeof res.errors != 'undefined'){
      con.error(res.errors);
      throw {
        code: parseInt(res.errors[0].status),
        message: res.errors[0].title,
      }
    }
  }

  accessToken() {
    return api.settings.get('kitsuToken');
  }

  async getPart() {
    var userid = await this.getUserId();

    var statusPart = '';
    var sorting = '';
    if(this.status !== 7){
      if(this.status === 1) sorting = '&sort=-progressed_at';
      var statusTemp = helper.translateList(this.status, this.status);
      statusPart = '&filter[status]='+statusTemp;
    }

    con.log('[UserList][Kitsu]', 'user: '+userid, 'status: '+this.status, 'offset: '+this.offset);

    return api.request.xhr('GET', {
      url: 'https://kitsu.io/api/edge/library-entries?filter[user_id]='+userid+statusPart+'&filter[kind]='+this.listType+'&page[offset]='+this.offset+'&page[limit]=50'+sorting+'&include='+this.listType+','+this.listType+'.mappings,'+this.listType+'.mappings.item&fields['+this.listType+']=slug,titles,averageRating,posterImage,'+(this.listType == 'anime'? 'episodeCount': 'chapterCount,volumeCount'),
      headers: {
        'Authorization': 'Bearer ' + this.accessToken(),
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      data: {},
    }).then((response) => {
      var res = this.jsonParse(response);
      con.log(res);
      this.errorHandling(res);

      this.offset += 50;

      if(!(res.meta.count > (this.offset))){
        this.done = true;
      }

      return this.prepareData(res, this.listType);
    });

  }

  private prepareData(data, listType): listElement[]{
    var newData = [] as listElement[];
    for (var i = 0; i < data.data.length; i++) {
      var list = data.data[i];
      var el = data.included[i];

      var name =  helper.getTitle(el.attributes.titles);

      var malId = NaN;
      for (var k = 0; k < data.included.length; k++) {
        var mapping = data.included[k];
        if(mapping.type == 'mappings'){
          if(mapping.attributes.externalSite === 'myanimelist/'+listType){
            if(mapping.relationships.item.data.id == el.id){
              malId = mapping.attributes.externalId;
              data.included.splice(k, 1);
              break;
            }
          }
        }
      }

      if(listType === "anime"){
        var tempData = {
          malId: malId,
          uid: el.id,
          cacheKey: helper.getCacheKey(malId, el.id),
          kitsuSlug: el.attributes.slug,
          type: listType,
          title: name,
          url: 'https://kitsu.io/'+listType+'/'+el.attributes.slug,
          watchedEp: list.attributes.progress,
          totalEp: el.attributes.episodeCount,
          status: helper.translateList(list.attributes.status),
          score: list.attributes.ratingTwenty/2,
          image: (el.attributes.posterImage && el.attributes.posterImage.large) ? el.attributes.posterImage.large : '',
          tags: list.attributes.notes,
          airingState: el['anime_airing_status'],
          fn: this.fn()
        }
      }else{
        var tempData = {
          malId: malId,
          uid: el.id,
          cacheKey: helper.getCacheKey(malId, el.id),
          kitsuSlug: el.attributes.slug,
          type: listType,
          title: name,
          url: 'https://kitsu.io/'+listType+'/'+el.attributes.slug,
          watchedEp: list.attributes.progress,
          totalEp: el.attributes.chapterCount,
          status: helper.translateList(list.attributes.status),
          score: list.attributes.ratingTwenty/2,
          image: (el.attributes.posterImage && el.attributes.posterImage.large) ? el.attributes.posterImage.large : '',
          tags: list.attributes.notes,
          airingState: el['anime_airing_status'],
          fn: this.fn()
        }
      }

      if(tempData.totalEp == null){
        tempData.totalEp = 0;
      }

      newData.push(tempData);
    }
    return newData;
  }

}
