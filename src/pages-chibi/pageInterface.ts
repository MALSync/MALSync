import type { ChibiGenerator, ChibiJson } from 'src/chibiScript/ChibiGenerator';

/**
 * Interface defining the structure for a chibi page integration in MALSync.
 */
export interface PageInterface {
  /** The display name of the website */
  name: string;
  /** The type of media this page handles */
  type: 'anime' | 'manga';
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
  /** URL template for the site's search functionality */
  search: string;
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
  };
}

export interface PageInterfaceCompiled extends PageInterface {
  /** The version of the page integration */
  version: string;
}

export type PageListInterface = Pick<
  PageInterfaceCompiled,
  'name' | 'type' | 'domain' | 'languages' | 'urls' | 'search' | 'database' | 'version'
> & {
  /** The unique key of the page integration */
  key: string;

  /** The root URL to the page integration */
  root?: string;
};

export type PageListJsonInterface = {
  pages: { [key: string]: PageListInterface };
};

export type PageJsonInterface = PageInterfaceCompiled;
