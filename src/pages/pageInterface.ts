export interface pageInterface {
    domain: string,
    type: "anime"|"manga",
    isSyncPage: (url) => boolean,
    sync:{
      getTitle: (url) => string,
      getIdentifier: (url) => string,
      getEpisode: (url) => number,
      getVolume?: (url) => number,
    }
    overview?:{
      getTitle: (url) => string,
      getIdentifier: (url) => string,
    }
}


export interface pageState {
    title: string,
    identifier: string,
    episode?: number,
    volume?: number
}
