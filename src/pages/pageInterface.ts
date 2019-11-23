export interface pageInterface {
    domain: string | string[],
    name: string,
    type: "anime"|"manga",
    isSyncPage: (url) => boolean,
    sync:{
      getTitle: (url) => string,
      getIdentifier: (url) => string,
      getOverviewUrl: (url) => string,
      getEpisode: (url) => number,
      getVolume?: (url) => number,

      nextEpUrl?: (url) => string | undefined,

      uiSelector?: (selector) => void,
    },
    overview?:{
      getTitle: (url) => string,
      getIdentifier: (url) => string,
      uiSelector: (selector) => void,
      list?:{
        offsetHandler: boolean,
        elementsSelector: () => JQuery<HTMLElement>,
        elementUrl: (selector) => string,
        elementEp: (selector) => number,
        paginationNext?: (updateCheck:boolean) => boolean,
        handleListHook?: (ep:number, epList) => void,
        getTotal?: () => number|undefined,
      }
    },
    database?: string, //ignore, only for first party implementations
    init: (page:any) => void,
}

interface pageSearch {
    name: string,
    type: 'anime'|'manga',
    domain: string,
    googleSearchDomain?: string,
    searchUrl: (titleEncoded) => string,
    completeSearchTag?: (title, linkContent) => string
}

export interface pageState {
    title: string,
    identifier: string,
    episode?: number,
    volume?: number
}

export interface pageSearchObj {
    [key: string]: pageSearch
}
