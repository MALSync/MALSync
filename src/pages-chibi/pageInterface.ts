import type { ChibiGenerator, ChibiJson } from 'src/chibiScript/ChibiGenerator';
import { mangaProgressConfig } from '../utils/mangaProgress/MangaProgress';
import type { searchSyntax, QuicklinkObjectSearch } from '../utils/quicklinksBuilder';

/**
 * Interface defining the structure for a chibi page integration in MALSync.
 */
export interface PageInterface {
  /** The display name of the website */
  name: string;
  /** The type of media this page handles */
  type: 'anime' | 'manga';

  /**
   * (Optional) Function to compute the type dynamically. In cases a page contains multiple types of content.
   * Evaluated during page trigger
   */
  computedType?: ($c: ChibiGenerator<unknown>) => ChibiJson<'anime' | 'manga' | 'novel' | string>;

  /** The domain(s) of the website */
  domain: string | string[];
  /**
   * List of languages supported by the website (ISO language names)
   * @see https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
   */
  languages: string[];
  /**
   * URL patterns used to match and identify the website
   * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
   */
  urls: {
    match: string[];
  };
  /**
   * URL template for the site's search functionality
   * @example
   * 'https://example.com/search?q={searchterm}'
   * {searchterm} => 'no%20game%20no%20life'
   * {searchtermPlus} => 'no+game+no+life'
   * {searchtermMinus} => 'no-game-no-life'
   * {searchtermUnderscore} => 'no_game_no_life'
   * {searchtermRaw} => 'no game no life'
   * @see {@link searchSyntax} for advanced usage
   */
  search?: string | QuicklinkObjectSearch;
  /**
   * Minimum version of the Malsync extension required for this page integration to work
   * Only necessary if the page integration uses new features
   * @example '0.12.0'
   */
  minimumVersion?: string;
  /**
   * Database identifier for first party implementations
   * @internal This is only used for first party implementations
   */
  database?: string | undefined;

  /**
   * Configuration for the sync page functionality.
   * The sync page is where the actual content consumption happens,
   * such as video players or manga readers.
   */
  sync: {
    /**
     * Determines if the current page represents a sync page.
     * @returns A ChibiJson wrapped boolean indicating if this is a sync page
     */
    isSyncPage: ($c: ChibiGenerator<unknown>) => ChibiJson<boolean>;

    /**
     * Returns the title of the anime or manga.
     * Used for searching on MyAnimeList.
     * @returns A ChibiJson wrapped string containing the title
     */
    getTitle: ($c: ChibiGenerator<unknown>) => ChibiJson<string>;

    /**
     * Returns a unique identifier for the anime or manga.
     * Must be consistent between sync and overview pages.
     * @returns A ChibiJson wrapped string containing the identifier
     */
    getIdentifier: ($c: ChibiGenerator<unknown>) => ChibiJson<string>;

    /**
     * Returns a URL to the overview page.
     * @returns A ChibiJson wrapped string containing the overview URL
     */
    getOverviewUrl: ($c: ChibiGenerator<unknown>) => ChibiJson<string>;

    /**
     * Returns the current episode number for anime or chapter number for manga.
     * @returns A ChibiJson wrapped number representing the episode/chapter
     */
    getEpisode: ($c: ChibiGenerator<unknown>) => ChibiJson<number>;

    /**
     * Returns the current volume number for manga.
     * This function is optional.
     * @returns A ChibiJson wrapped number representing the volume
     */
    getVolume?: ($c: ChibiGenerator<unknown>) => ChibiJson<number>;

    /**
     * Returns the URL to the image of the anime or manga.
     * This function is optional.
     * @returns A ChibiJson wrapped string containing the image URL, or undefined if not available
     */
    getImage?: ($c: ChibiGenerator<unknown>) => ChibiJson<string | undefined>;

    /**
     * Returns the URL to the next episode or chapter.
     * Used for providing quick navigation links on the userlist.
     * This function is optional.
     * @returns A ChibiJson wrapped string containing the next episode URL, or undefined if not available
     */
    nextEpUrl?: ($c: ChibiGenerator<unknown>) => ChibiJson<string | undefined | boolean>;

    /**
     * Injects a small UI element with the current episode or chapter number.
     * Only use this if there is no overview page.
     * This function is optional.
     */
    uiInjection?: ($c: ChibiGenerator<unknown>) => ChibiJson<any>;

    /**
     * Returns the MyAnimeList URL for the current anime or manga.
     * Only needs to be implemented if the page directly provides MAL information.
     * This function is optional.
     * @returns A ChibiJson wrapped promise or direct value containing the MAL URL, or false if not available
     */
    getMalUrl?: (
      $c: ChibiGenerator<unknown>,
    ) => ChibiJson<Promise<string | boolean> | string | boolean>;

    /**
     * Configuration for the manga progress functionality.
     * This property is optional.
     */
    readerConfig?: (ChibiMangaProgressConfig | mangaProgressConfig)[];
  };

  /**
   * Configuration for the overview page functionality.
   * The overview page typically shows information about the entire series.
   * This property is optional.
   */
  overview?: {
    /**
     * Determines if the current page represents an overview page.
     * @returns A ChibiJson wrapped boolean indicating if this is an overview page
     */
    isOverviewPage: ($c: ChibiGenerator<unknown>) => ChibiJson<boolean>;

    /**
     * Returns the title of the anime or manga.
     * Used for searching on MyAnimeList.
     * @returns A ChibiJson wrapped string containing the title
     */
    getTitle: ($c: ChibiGenerator<unknown>) => ChibiJson<string>;

    /**
     * Returns a unique identifier for the anime or manga.
     * Must be consistent between sync and overview pages.
     * @returns A ChibiJson wrapped string containing the identifier
     */
    getIdentifier: ($c: ChibiGenerator<unknown>) => ChibiJson<string>;

    /**
     * Injects a small UI element with the current episode or chapter number.
     */
    uiInjection: ($c: ChibiGenerator<unknown>) => ChibiJson<any>;

    /**
     * Returns the URL to the image of the anime or manga.
     * @returns A ChibiJson wrapped string containing the image URL, or undefined if not available
     */
    getImage: ($c: ChibiGenerator<unknown>) => ChibiJson<string | undefined>;

    /**
     * Returns the MyAnimeList URL for the current anime or manga.
     * Only needs to be implemented if the page directly provides MAL information.
     * This function is optional.
     * @returns A ChibiJson wrapped promise or direct value containing the MAL URL, or false if not available
     */
    getMalUrl?: (
      $c: ChibiGenerator<unknown>,
    ) => ChibiJson<Promise<string | boolean> | string | boolean>;
  };

  /**
   * Configuration for the list of episodes or chapters on the overview page.
   * This property is optional.
   */
  list?: {
    /**
     * Selector for the list of episodes or chapters on the overview page.
     * This function should return an array of HTML elements representing the list items.
     * @returns A ChibiJson wrapped array of HTML elements
     */
    elementsSelector: ($c: ChibiGenerator<unknown>) => ChibiJson<Element[]>;

    /**
     * Function to extract the URL from a list item.
     * @param $c The ChibiGenerator instance with the HTML element
     * @returns A string representing the URL of the episode or chapter
     */
    elementUrl?: ($c: ChibiGenerator<Element>) => ChibiJson<string>;

    /**
     * Function to extract the episode or chapter number from a list item.
     * @param $c The ChibiGenerator instance with the HTML element
     * @returns A number representing the episode or chapter
     */
    elementEp: ($c: ChibiGenerator<Element>) => ChibiJson<number>;
  };

  lifecycle: {
    /**
     * Initial setup function for the page integration.
     * This function is called once when the script is loaded.
     * Use this function to add CSS or perform other one-time actions.
     */
    setup: ($c: ChibiGenerator<unknown>) => ChibiJson<any>;

    /**
     * Ready function for the page integration.
     * This function is called once when the script is loaded.
     * Use this function to trigger the page check.
     * The page should be loaded enough to correctly run isSyncPage and isOverviewPage.
     * You can trigger the .trigger() multiple times in case of URL changes in SPA.
     */
    ready: ($c: ChibiGenerator<unknown>) => ChibiJson<any>;

    /**
     * Optional function that is executed after the page is ready and isSyncPage is true.
     * By default, it waits for the title and identifier to be available.
     * This function can only be triggered once.
     */
    syncIsReady?: ($c: ChibiGenerator<unknown>) => ChibiJson<any>;

    /**
     * Optional function that is executed after the page is ready and isOverviewPage is true.
     * By default, it waits for the title and identifier to be available.
     * This function can only be triggered once.
     */
    overviewIsReady?: ($c: ChibiGenerator<unknown>) => ChibiJson<any>;

    /**
     * This function is called once when the script is loaded.
     * Use this function to trigger list checks.
     * You can trigger the .trigger() multiple times.
     * This function is only necessary for lists with paginations.
     * If the list does not change this function is normally not needed.
     */
    listChange?: ($c: ChibiGenerator<unknown>) => ChibiJson<any>;
  };
}

export type ChibiMangaProgressConfig = {
  /** A condition to check if this config should be applied */
  condition?: ($c: ChibiGenerator<unknown>) => ChibiJson<boolean>;
  /** The current page number */
  current: ($c: ChibiGenerator<unknown>) => ChibiJson<number>;
  /** The total number of pages */
  total: ($c: ChibiGenerator<unknown>) => ChibiJson<number>;
};

export interface PageInterfaceCompiled extends PageInterface {
  /** The version of the page integration */
  version: {
    hash: string;
    timestamp: string;
  };
}

export type PageListInterface = Pick<
  PageInterfaceCompiled,
  | 'name'
  | 'type'
  | 'domain'
  | 'languages'
  | 'urls'
  | 'search'
  | 'database'
  | 'version'
  | 'minimumVersion'
> & {
  /** The unique key of the page integration */
  key: string;

  /** The root URL to the page integration */
  root?: string;
};

export type PageListJsonInterface = {
  pages: { [key: string]: PageListInterface };
};

export type PageJsonInterface = PageInterfaceCompiled & {
  computedType: ReturnType<NonNullable<PageInterface['computedType']>>;
  sync: {
    isSyncPage: ReturnType<PageInterface['sync']['isSyncPage']>;
    getTitle: ReturnType<PageInterface['sync']['getTitle']>;
    getIdentifier: ReturnType<PageInterface['sync']['getIdentifier']>;
    getOverviewUrl: ReturnType<PageInterface['sync']['getOverviewUrl']>;
    getEpisode: ReturnType<PageInterface['sync']['getEpisode']>;
    getVolume?: ReturnType<NonNullable<PageInterface['sync']['getVolume']>>;
    getImage?: ReturnType<NonNullable<PageInterface['sync']['getImage']>>;
    nextEpUrl?: ReturnType<NonNullable<PageInterface['sync']['nextEpUrl']>>;
    uiInjection?: ReturnType<NonNullable<PageInterface['sync']['uiInjection']>>;
    getMalUrl?: ReturnType<NonNullable<PageInterface['sync']['getMalUrl']>>;
  };
  overview?: {
    isOverviewPage: ReturnType<
      NonNullable<NonNullable<PageInterface['overview']>['isOverviewPage']>
    >;
    getTitle: ReturnType<NonNullable<PageInterface['overview']>['getTitle']>;
    getIdentifier: ReturnType<NonNullable<PageInterface['overview']>['getIdentifier']>;
    uiInjection: ReturnType<NonNullable<PageInterface['overview']>['uiInjection']>;
    getImage: ReturnType<NonNullable<PageInterface['overview']>['getImage']>;
    getMalUrl?: ReturnType<NonNullable<NonNullable<PageInterface['overview']>['getMalUrl']>>;
  };
  list?: {
    elementsSelector: ReturnType<NonNullable<PageInterface['list']>['elementsSelector']>;
    elementEp: ReturnType<NonNullable<PageInterface['list']>['elementEp']>;
    elementUrl?: ReturnType<NonNullable<NonNullable<PageInterface['list']>['elementUrl']>>;
  };
  lifecycle: {
    setup: ReturnType<PageInterface['lifecycle']['setup']>;
    ready: ReturnType<PageInterface['lifecycle']['ready']>;
    syncIsReady?: ReturnType<NonNullable<PageInterface['lifecycle']['syncIsReady']>>;
    overviewIsReady?: ReturnType<NonNullable<PageInterface['lifecycle']['overviewIsReady']>>;
    listChange?: ReturnType<NonNullable<PageInterface['lifecycle']['listChange']>>;
  };
};
