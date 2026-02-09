/* eslint-disable @typescript-eslint/no-unsafe-call */
import { pageInterface } from '../pageInterface';

interface ParsedData {
    title: string
    slug: string
    url: string
    episode_nr: string | null
    image_url: string
}

function parseData(): ParsedData | null {
    try {
        const el = document.querySelector("#malsync")
        if (!el) {
            return null
        }
        const raw = el?.innerHTML
        const parsed = JSON.parse(raw)
        return parsed
    } catch (e: any) {
        con.info(`fireanime.parseData: ${e}`)
    }
    return null
}

let context_data: null | ParsedData = null

export const fireanime: pageInterface = {
    name: 'FireAnime',
    domain: 'https://fireani.me',
    languages: ['German', 'English'],
    type: 'anime',
    isSyncPage(url) {
        return context_data?.episode_nr ? true : false
    },
    isOverviewPage(url) {
        return context_data && !context_data.episode_nr ? true : false
    },
    getImage() {
        return `${context_data?.image_url}`;
    },
    sync: {
        getTitle(url) {
            return `${context_data?.title}`;
        },
        getIdentifier(url) {
            return `${context_data?.slug}`;
        },
        getOverviewUrl(url) {
            return `${context_data?.url}`;
        },
        getEpisode(url) {
            return parseInt(`${context_data?.episode_nr ?? 0}`);
        },
        getImage() {
            return `${context_data?.image_url}`;
        },
    },
    overview: {
        getTitle(url) {
            return `${context_data?.title}`;
        },
        getIdentifier(url) {
            return `${context_data?.slug}`;
        },
        uiSelector(selector) {
            j.$('#malsync-anchor').append(j.html(selector));
        },
        getImage() {
            return `${context_data?.image_url}`;
        },
    },
    init(page) {
        function ready() {
            con.log('FireAnime: Ready');
            page.reset();
            if (context_data && context_data.episode_nr) {
                con.log('FireAnime: Sync page');
                utils.waitUntilTrue(
                    () => {
                        return (
                            j.$('#playerObject iframe').length > 0 || j.$('#playerObject media-player').length > 0
                        );
                    },
                    () => {
                        context_data = parseData()
                        con.log('FireAnime: Player found');
                        page
                            .handlePage()
                            .then(() => {
                                con.log('FireAnime: Page handled');
                            })
                            .catch(e => {
                                con.error(e);
                            });
                    },
                );
            } else if(context_data) {
                setTimeout(() => {
                    utils.waitUntilTrue(
                        () => {
                            return j.$('#malsync-anchor').length > 0 || j.$('h1').length > 0;
                        },
                        () => {
                            context_data = parseData()
                            con.log('FireAnime: anime page');
                            page
                                .handlePage()
                                .then(() => {
                                    con.log('FireAnime: Page handled');
                                })
                                .catch(e => {
                                    con.error(e);
                                });
                        },
                    );
                });
            } else {
                context_data = parseData()
                con.log('FireAnime: yeah idk where we at bruv');
                page
                    .handlePage()
                    .then(() => {
                        con.log('FireAnime: Page handled');
                    })
                    .catch(e => {
                        con.error(e);
                    });
            }
        }

        setTimeout(() => {
            con.log('FireAnime: Waiting for page to load');
            ready();
            utils.urlChangeDetect(ready);
        }, 3000);
    },
};
