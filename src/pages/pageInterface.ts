export interface pageInterface {
    domain: string | string[],
    name: string,
    type: "anime"|"manga",
    isSyncPage: (url) => boolean, //Return if the current page is the sync page (Chapter/episode page)
    sync:{ //Defintions for the sync page
      getTitle: (url) => string, //Returns the title of the anime, used for the search on mal
      getIdentifier: (url) => string, //An unique identifier of the anime. Has to be the same on the sync and overview page
      getOverviewUrl: (url) => string, //Return a link to the Overview page.
      getEpisode: (url) => number, //Return the recognized episode or chapter number as integer.
      getVolume?: (url) => number, //(optional) Return the current volumen
      nextEpUrl?: (url) => string | undefined, //(optional) return the link to the next episode. Used for links on the userlist
      uiSelector?: (selector) => void, //(optional) Inject a small ui with current status chapter... Only use this if there is no overview page
      getMalUrl?: (provider: 'MAL'|'ANILIST'|'KITSU'|'SIMKL') => Promise<string|false>|string|false, //(optional) Return the MALurl. Only really needs to be implemented if the page provides that info.
    },
    overview?:{
      getTitle: (url) => string,
      getIdentifier: (url) => string,
      uiSelector: (selector) => void,
      getMalUrl?: (provider: 'MAL'|'ANILIST'|'KITSU'|'SIMKL') => Promise<string|false>|string|false,
      list?:{ //(optional) Used for recognising the list of episodes/chapters on the overview page. Best is to ask for help on discord for this.
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
    init: (page:any) => void, //This is the most important function. It controlls when to start the check. Every time page.handlPage() is called it will check the overview/sync page.
}

export interface pageState {
    on: 'SYNC'|'OVERVIEW',
    title: string,
    identifier: string,
    episode?: number,
    volume?: number
}
