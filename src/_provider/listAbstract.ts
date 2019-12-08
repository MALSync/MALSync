import {epPredictions} from './../utils/epPrediction';

export interface listElement {
  uid: number,
  malId: number,
  cacheKey: any,
  type: "anime"|"manga"
  title: string,
  url: string,
  watchedEp: number,
  totalEp: number,
  status: number,
  score: number,
  image: string,
  tags: string,
  airingState: number,
  fn: {
    continueUrl: (item: listElement) => string,
    predictions: (item: listElement) => any,
  },
}

export abstract class ListAbstract {

  protected done: boolean = false;

  protected abstract authenticationUrl: string;

  abstract readonly name;

  //Modes
  modes = {
    sortAiring: false,
  }

  constructor(
    protected status: number = 1,
    protected listType:'anime'|'manga' = 'anime',
    public callbacks: {
      singleCallback?: (el: listElement) => void,
      continueCall?
    } = {},
    protected username = null,
    protected offset = 0,
    protected templist: listElement[] = []
  ) {
    return this;
  }

  public api = api;

  public setTemplist(list) {
    this.templist = list;
    return this;
  }

  isDone() {
    return this.done;
  }

  async get(): Promise<listElement[]> {

    var retList: listElement[] = [];
    do {
      retList = await this.getPart()

      if(typeof this.callbacks.singleCallback !== 'undefined'){
        // @ts-ignore
        if(!retList.length) this.callbacks.singleCallback(false, 0, 0);
        for (var i = 0; i < retList.length; i++) {
          // @ts-ignore
          this.callbacks.singleCallback(retList[i]);
        }
      }

      this.templist = this.templist.concat(retList);

      if(typeof this.callbacks.continueCall !== 'undefined'){
        // @ts-ignore
        await this.callbacks.continueCall(this.templist);
      }


    } while(!this.done);

    if(this.modes.sortAiring) await this.sortAiringList();

    if(typeof this.callbacks.continueCall !== 'undefined') this.callbacks.continueCall(this.templist);

    return this.templist;
  }

  abstract getUsername(): Promise<String>|String;
  abstract getPart(): Promise<listElement[]>;

  jsonParse(response) {
    if(response.responseText === '') {
      throw {
        code: 444,
        message: 'No Response',
      }
    }

    try {
      return JSON.parse(response.responseText);
    }catch(e) {
      throw {
        code: 406,
        message: 'Not Acceptable',
        error: e
      }
    }
  }

  flashmError(error) {
    utils.flashm(this.errorMessage(error), {error: true, type: 'error'});
  }

  errorMessage(error) {
    if(typeof error.code === 'undefined') {
      return error;
    }

    switch (error.code) {
      case 400:
      case 401:
        return api.storage.lang("Error_Authenticate", [this.authenticationUrl]);
        break;
      default:
        return error.message;
        break;
    }
  }

  // itemFunctions;
  fn() {
    var continueUrlTemp: any = null;
    var predictionsObj: any = null;
    return {
      continueUrl: (item) => {
        if(continueUrlTemp !== null) return continueUrlTemp;
        return utils.getContinueWaching(item.type, item.cacheKey).then((obj) => {
          var res = undefined;
          var curEp = parseInt(item.watchedEp.toString());
          if(typeof obj !== 'undefined' && obj.ep === (curEp+1)){
            res = obj.url;
          }
          continueUrlTemp = res;
          return continueUrlTemp;
        });
      },
      predictions: (item) => {
        if(predictionsObj !== null) return predictionsObj;
        return new epPredictions(item.malId, item.cacheKey, item.type).init().then((obj) => predictionsObj = obj);
      }
    }
  }

  //Modes
  async sortAiringList() {
    var listP:any = [];
    this.templist.forEach((item) => {
      listP.push(item.fn.predictions(item));
    });

    await Promise.all(listP);

    var normalItems: listElement[] = [];
    var preItems: listElement[] = [];
    var watchedItems: listElement[] = [];
    this.templist.forEach((item) => {
      var prediction = item.fn.predictions(item);
      if(prediction.getAiring() && prediction.getNextEpTimestamp()) {
        if(item.watchedEp < prediction.getEp().ep) {
          preItems.push(item);
        }else{
          watchedItems.push(item);
        }
      }else{
        normalItems.push(item);
      }
    });

    preItems = preItems.sort(sortItems).reverse();
    watchedItems = watchedItems.sort(sortItems);

    this.templist = preItems.concat(watchedItems, normalItems);

    function sortItems(a,b) {
      var valA = a.fn.predictions(a).getNextEpTimestamp();
      var valB = b.fn.predictions(b).getNextEpTimestamp();

      if(!valA) valA = 999999999999;
      if(!valB) valB = valA;

      return valA - valB;
    }
  }
}
