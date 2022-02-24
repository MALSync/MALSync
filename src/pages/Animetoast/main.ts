import { pageInterface } from "../pageInterface";
import { SyncPage } from "../syncPage";

export const Animetoast: pageInterface = {
    name: "Animetoast",
    domain: "https://www.animetoast.cc",
    languages: ['German'],
    type: "anime",
    isSyncPage: function (url: string): boolean {
        return $('.entry-title.light-title').text() != null && url.includes('?link=');
    },
    isOverviewPage: function (url: string): boolean {
        return $('.entry-title.light-title').text() != null && !url.includes('?link=');
    },
    sync: {
        getTitle: function (url: string): string {
            let title = $('.entry-title.light-title').text().split(' ');
            if(!(title.length >= 2))return title.join(' ');
            for(let i = title.length - 1; i >= title.length - 2; i--){
                const t = title[i];
                t.match(/(Ger|Sub|Dub)/gi) ? title.splice(i, 1) : null;
            }
            return title.join(' ');
        },
        getIdentifier: function (url: string): string {
            let title = $('.entry-title.light-title').text().split(' ');
            if(!(title.length >= 2))return title.join(' ');
            for(let i = title.length - 1; i >= title.length - 2; i--){
                const t = title[i];
                t.match(/(Ger|Sub|Dub)/gi) ? title.splice(i, 1) : null;
            }
            return title.join(' ');
        },
        getOverviewUrl: function (url: string): string {
            return url.split('?link=')[0];
        },
        getEpisode: function (url: string): number {
            let s = $('.current-link').text().match(/(\d+)/gi);
            return Number((s![s!?.length-1]));
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
                let s = selector.text().match(/(\d+)/gi);
                return Number((s![s!?.length-1]));
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