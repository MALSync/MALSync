import { pageInterface } from '../pageInterface';
import { SyncPage } from '../syncPage';

export const Animetoast: pageInterface = {
  name: 'Animetoast',
  domain: 'https://www.animetoast.cc',
  languages: ['German'],
  type: 'anime',
  isSyncPage(url: string): boolean {
    return $('.entry-title.light-title').text() != null && url.includes('link=');
  },
  isOverviewPage(url: string): boolean {
    return $('.entry-title.light-title').text() != null && !url.includes('link=');
  },
  sync: {
    getTitle(url: string): string {
      return $('.entry-title.light-title')
        .text()
        .replace(/(Ger Sub|Ger Dub)/gi, '')
        .trim();
    },
    getIdentifier(url: string): string {
      return utils.urlPart(url, 3);
    },
    getOverviewUrl(url: string): string {
      return `${Animetoast.domain}/${Animetoast.sync.getIdentifier(url)}`;
    },
    getEpisode(url: string): number {
      const matching = $('.current-link').text().match(/(\d+)/i);
      return matching ? parseEpisode(matching) : NaN;
    },
    nextEpUrl(url: string): string | undefined {
      return $('.current-link').next().attr('href');
    },
    uiSelector(selector: string) {
      $('.title-info > .entry-title.light-title').first().after(j.html(selector));
    },
  },
  overview: {
    getTitle(url: string): string {
      return Animetoast.sync.getTitle(url);
    },
    getIdentifier(url: string): string {
      return Animetoast.sync.getIdentifier(url);
    },
    uiSelector(selector: string) {
      Animetoast.sync.uiSelector!(selector);
    },
    list: {
      offsetHandler: true,
      elementsSelector(): JQuery<HTMLElement> {
        return $('.tab-content > div > a');
      },
      elementUrl(selector: JQuery<HTMLElement>): string {
        return selector.attr('href')!;
      },
      elementEp(selector: JQuery<HTMLElement>): number {
        return parseEpisode(selector);
      },
    },
  },
  init(page: SyncPage): void {
    j.$(document).ready(function () {
      page.handlePage();
      api.storage.addStyle(
        require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
      );
    });
  },
};

function parseEpisode(selector: JQuery<HTMLElement> | RegExpMatchArray): number {
  const ep = Number(selector[selector.length - 1]);
  return ep || NaN;
}
