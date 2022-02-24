import { pageInterface } from "../pageInterface";
import { SyncPage } from "../syncPage";

export const Animetoast: pageInterface = {
    name: "Animetoast",
    domain: "https://www.animetoast.cc",
    languages: ['German'],
    type: "anime",
    isSyncPage: function (url: string): boolean {
        return $('.entry-title.light-title').text() != null && url.includes('link=');
    },
    isOverviewPage: function (url: string): boolean {
        return $('.entry-title.light-title').text() != null && !url.includes('link=');
    },
    sync: {
        getTitle: function (url: string): string {
            return $('.entry-title.light-title').text().replace(/(Ger Sub|Ger Dub)/gi, '').trim();
        },
        getIdentifier: function (url: string): string {
            return url.replace(/(https|http):\/\//gi, '').split('/')[1];
        },
        getOverviewUrl: function (url: string): string {
            return `${Animetoast.domain}/${Animetoast.sync.getIdentifier(url)}`;
        },
        getEpisode: function (url: string): number {
          let matching = $('.current-link').text().match(/(\d+)/g);
          return matching ? parseEpisode(matching) : NaN;
        },
        nextEpUrl: function (url: string): string | undefined {
            return $('.current-link').next().attr('href');
        },
        uiSelector: function (selector:string){
            $('.title-info > .entry-title.light-title').first().after(j.html(selector));
        }

    },
    overview: {
        getTitle: function (url: string): string {
            return Animetoast.sync.getTitle(url);
        },
        getIdentifier: function (url: string): string {
            return Animetoast.sync.getIdentifier(url);
        },
        uiSelector: function (selector:string){
            Animetoast.sync.uiSelector!(selector);
        },
        list: {
            offsetHandler: true,
            elementsSelector: function(): JQuery<HTMLElement> {
                return $('.tab-content > div > a');
            },
            elementUrl: function (selector: JQuery<HTMLElement>): string {
                return selector.attr('href')!;
            },
            elementEp: function (selector: JQuery<HTMLElement>): number {
              return parseEpisode(selector);
            },

        }
    },
    init: function (page: SyncPage): void {
        j.$(document).ready(function () {
            page.handlePage();
            api.storage.addStyle(
                require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
            );
        })
    }
}

function parseEpisode(selector: JQuery<HTMLElement> | RegExpMatchArray):number{
  let ep = Number((selector[selector.length-1]))
  return ep ? ep : NaN;
}