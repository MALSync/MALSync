import {ListAbstract, listElement} from './../listAbstract';
import * as helper from "./helper";

export class userlist extends ListAbstract {

  authenticationUrl = '';

  async getUsername() {
    return 'local'
  }

  async getPart() {
    con.log('[UserList][Local]', 'status: '+this.status);
    this.done = true;
    var data = this.prepareData(await this.getSyncList(), this.listType, this.status);
    return data;
  }

  private prepareData(data, listType, status): listElement[]{
    var newData = [] as listElement[];
     for (var key in data) {
       if(this.getRegex(listType).test(key)){
         var el = data[key];
         con.log(key, el);
         if(status !== 7 && parseInt(el.status) !== status){
           continue;
         }
         if(listType === "anime"){
           newData.push({
             airingState: 2,
             image: api.storage.assetUrl('questionmark.gif'),
             malId: 0,
             tags: el.tags,
             title: el.name,
             totalEp: 0,
             status: el.status,
             score: el.score,
             type: "anime",
             //@ts-ignore
             uid: key,
             url: key,
             cacheKey: helper.getCacheKey(utils.urlPart(key, 4), utils.urlPart(key, 2)),
             watchedEp: el.progress,
           });
         }else{
           newData.push({
             airingState: 2,
             image: api.storage.assetUrl('questionmark.gif'),
             malId: 0,
             tags: el.tags,
             title: el.name,
             totalEp: 0,
             status: el.status,
             score: el.score,
             type: "manga",
             //@ts-ignore
             uid: key,
             url: key,
             cacheKey: helper.getCacheKey(utils.urlPart(key, 4), utils.urlPart(key, 2)),
             watchedEp: el.progress,
           });
         }
       }
     }

     con.log('data', newData);
     return newData;
  }

  private getRegex(listType){
    return new RegExp("^local:\/\/[^\/]*\/"+listType, "i");
  }

  private async getSyncList(){
    if(api.type == 'userscript') {
      var list = await api.storage.list('sync');
      for (var key in list) {
        list[key] = await api.storage.get(key);
      }
      var data = list;
    }else{
      var data = api.storage.list('sync');
    }
    return data;
  }


}
