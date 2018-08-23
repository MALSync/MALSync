export interface pageInterface {
    domain: string,
    type: "anime"|"manga",
    isSyncPage: (url) => boolean,
    sync:{
      getTitle: (url) => string,
      getIdentifier: (url) => string,
      getEpisode: (url) => number,
      getVolume?: (url) => number,

      uiSelector?: (selector) => void,
    },
    overview?:{
      getTitle: (url) => string,
      getIdentifier: (url) => string,
      uiSelector: (selector) => void,
    },
    database?: string, //ignore, only for first party implementations
    init: (page:any) => void,
}


export interface pageState {
    title: string,
    identifier: string,
    episode?: number,
    volume?: number
}
