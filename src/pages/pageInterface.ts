import { SyncPage } from './syncPage';

export interface pageInterface {
  domain: string | string[];
  languages: string[]; // (ISO language name) https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
  name: string;
  type: 'anime' | 'manga';
  isSyncPage: (url: string) => boolean; // Return true if the current page is the sync page (Chapter/episode page)
  isOverviewPage?: (url: string) => boolean; // Return true if the current page is the Overview page
  getImage?: () => Promise<string | undefined> | string | undefined; // Return an image for the entry for local sync
  sync: {
    // Definitions for the sync page
    getTitle: (url: string) => string; // Returns the title of the anime, used for the search on mal
    getIdentifier: (url: string) => string; // An unique identifier of the anime. Has to be the same on the sync and overview page
    getOverviewUrl: (url: string) => string; // Return a link to the Overview page.
    getEpisode: (url: string) => number; // Return the recognized episode or chapter number as integer.
    getVolume?: (url: string) => number; // (optional) Return the current volume number
    nextEpUrl?: (url: string) => string | undefined; // (optional) return the link to the next episode. Used for links on the userlist
    uiSelector?: (selector: string) => void; // (optional) Inject a small ui with current status chapter... Only use this if there is no overview page
    getMalUrl?: (provider: 'MAL' | 'ANILIST' | 'KITSU' | 'SIMKL') => Promise<string | false> | string | false; // (optional) Return the MALUrl. Only really needs to be implemented if the page provides that info.
  };
  overview?: {
    getTitle: (url: string) => string;
    getIdentifier: (url: string) => string;
    uiSelector: (selector: string) => void;
    getMalUrl?: (provider: 'MAL' | 'ANILIST' | 'KITSU' | 'SIMKL') => Promise<string | false> | string | false;
    list?: {
      // (optional) Used for recognizing the list of episodes/chapters on the overview page. Best is to ask for help on discord for this.
      offsetHandler: boolean;
      elementsSelector: () => JQuery<HTMLElement>;
      elementUrl: (selector: JQuery<HTMLElement>) => string;
      elementEp: (selector: JQuery<HTMLElement>) => number;
      paginationNext?: (updateCheck: boolean) => boolean;
      handleListHook?: (ep: number, epList: JQuery<HTMLElement>[]) => void;
      getTotal?: () => number | undefined;
    };
  };
  database?: string | undefined; // ignore, only for first party implementations
  init: (page: SyncPage) => void; // This is the most important function. It controls when to start the check. Every time page.handlePage() is called it will check the overview/sync page.
}

export interface pageState {
  on: 'SYNC' | 'OVERVIEW';
  title: string;
  identifier: string;
  episode?: number;
  detectedEpisode?: number;
  volume?: number;
}
