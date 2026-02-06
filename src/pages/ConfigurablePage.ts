import { SITE_DOMAINS } from '../config/siteDomains';
import { pageInterface } from './pageInterface';
import type { SyncPage } from './syncPage';

export interface SelectorConfig {
  selector: string;
  // Optional regex to extract data (content inside capturing group 1 is returned)
  // If not provided, text() or attr() is returned directly.
  match?: RegExp;
  // Attribute to extract (default is text content)
  attr?: string;
  // If true, returns NaN/undefined on failure instead of throwing/empty string
  optional?: boolean;
}

export interface UrlMatchConfig {
  // 'path' checks specific path segments (e.g. urlPart)
  // 'query' checks query parameters
  // 'domain' checks subdomain/domain parts
  type: 'path' | 'query' | 'domain' | 'custom';
  // Index for 'path' (1-based), key for 'query'
  index?: number | string;
  // Value to match (string or regex)
  value?: string | RegExp;
  // Custom function if type is 'custom'
  matchFn?: (url: string) => boolean;
}

export interface SiteConfig {
  name: string;
  // Key to look up in SITE_DOMAINS (replaces manual domain strings)
  domainKey: keyof typeof SITE_DOMAINS;

  languages: string[];
  type: 'anime' | 'manga';

  // Logic to determine if we are on a sync page
  isSyncPage: UrlMatchConfig;
  // Logic to determine if we are on an overview page
  isOverviewPage: UrlMatchConfig;

  sync: {
    getTitle: SelectorConfig;
    getIdentifier: SelectorConfig | ((url: string) => string);
    getOverviewUrl: SelectorConfig | ((url: string) => string);
    getEpisode: SelectorConfig;
    nextEpUrl: SelectorConfig;
  };

  overview: {
    getTitle: SelectorConfig;
    getIdentifier: SelectorConfig | ((url: string) => string);
    list: {
      elementsSelector: string;
      elementUrl: SelectorConfig; // relative to element
      elementEp: SelectorConfig; // relative to element
    };
  };
}

/* eslint-disable es-x/no-class-instance-fields */
export class ConfigurablePage implements pageInterface {
  public name: string;

  public domain: string;

  public domainKey: keyof typeof SITE_DOMAINS;

  public languages: string[];

  public type: 'anime' | 'manga';

  private config: SiteConfig;

  constructor(config: SiteConfig) {
    this.config = config;
    this.name = config.name;
    this.domainKey = config.domainKey;
    this.languages = config.languages;
    this.type = config.type;

    // Auto-load domains from registry
    const domainData = SITE_DOMAINS[this.domainKey];
    this.domain = domainData.main;
  }

  // Helper to extract data based on config
  private extract(config: SelectorConfig, context?: JQuery): string {
    const selector = context ? context.find(config.selector) : j.$(config.selector);

    if (selector.length === 0) {
      if (config.optional) return '';
      // con.error(`Selector not found: ${config.selector}`);
      return '';
    }

    let val: string;
    if (config.attr) {
      val = selector.attr(config.attr) || '';
    } else {
      val = selector.text();
    }

    if (config.match) {
      const match = val.match(config.match);
      if (match && match[1]) {
        return match[1].trim();
      }
      return '';
    }

    return val.trim();
  }

  private matchUrl(config: UrlMatchConfig, url: string): boolean {
    if (config.type === 'custom' && config.matchFn) {
      return config.matchFn(url);
    }

    if (config.type === 'path' && typeof config.index === 'number') {
      const part = utils.urlPart(url, config.index);
      if (config.value instanceof RegExp) return config.value.test(part);
      return part === config.value;
    }

    // Expand logic for other types as needed
    return false;
  }

  protected isDomainMatch(): boolean {
    const current = window.location.origin;
    const domainData = SITE_DOMAINS[this.domainKey];

    // Check main domain
    if (current === domainData.main) return true;

    // Check aliases
    if (domainData.aliases && (domainData.aliases as string[]).includes(current)) return true;

    return false;
  }

  public isSyncPage(url: string): boolean {
    if (!this.isDomainMatch()) return false;
    return this.matchUrl(this.config.isSyncPage, url);
  }

  public isOverviewPage(url: string): boolean {
    if (!this.isDomainMatch()) return false;
    return this.matchUrl(this.config.isOverviewPage, url);
  }

  public sync = {
    getTitle: () => {
      return this.extract(this.config.sync.getTitle);
    },
    getIdentifier: (url: string) => {
      if (typeof this.config.sync.getIdentifier === 'function') {
        return (this.config.sync.getIdentifier as (url: string) => string)(url);
      }
      return this.extract(this.config.sync.getIdentifier);
    },
    getOverviewUrl: (url: string) => {
      if (typeof this.config.sync.getOverviewUrl === 'function') {
        return (this.config.sync.getOverviewUrl as (url: string) => string)(url);
      }
      const path = this.extract(this.config.sync.getOverviewUrl);
      return utils.absoluteLink(path, this.domain) as string;
    },
    getEpisode: () => {
      const val = this.extract(this.config.sync.getEpisode);
      return parseInt(val) || 0;
    },
    nextEpUrl: () => {
      const path = this.extract(this.config.sync.nextEpUrl);
      if (!path) return '';
      return utils.absoluteLink(path, this.domain) as string;
    },
  };

  public overview = {
    getTitle: () => {
      return this.extract(this.config.overview.getTitle);
    },
    getIdentifier: (url: string) => {
      if (typeof this.config.overview.getIdentifier === 'function') {
        return (this.config.overview.getIdentifier as (url: string) => string)(url);
      }
      return this.extract(this.config.overview.getIdentifier);
    },
    uiSelector: (selector: string) => {
      // Default implementation: append to body or define a selector in config
      // simple fallback
      j.$('body').append(j.html(selector));
    },
    list: {
      offsetHandler: false,
      elementsSelector: () => {
        return j.$(this.config.overview.list.elementsSelector);
      },
      elementUrl: (selector: JQuery) => {
        const path = this.extract(this.config.overview.list.elementUrl, selector);
        return utils.absoluteLink(path, this.domain) as string;
      },
      elementEp: (selector: JQuery) => {
        const val = this.extract(this.config.overview.list.elementEp, selector);
        return Number(val) || 0;
      },
    },
  };

  public init(page: SyncPage) {
    if (!this.isDomainMatch()) return;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    api.storage.addStyle(
      // eslint-disable-next-line
      (require('!to-string-loader!css-loader!less-loader!./pages.less') as any).toString(),
    );

    j.$(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      page.handlePage();
    });
  }
}
