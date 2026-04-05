import { PageInterface } from '../../pageInterface';

export const Senshi: PageInterface = {
    name: 'Senshi',
    domain: 'https://senshi.live/',
    languages: ['English'],
    type: 'anime',
    urls: {
        match: ['*://senshi.live/*'],
    },
    search: 'https://senshi.live/browse?search={searchtermRaw}',
    sync: {
        isSyncPage($c) {
            return $c.url().urlPart(3).equals('watch').run();
        },
        getTitle($c) {
            return $c
                .querySelector('h1.text-3xl.font-black.text-white')
                .text()
                .trim()
                .run();
        },
        getIdentifier($c) {
            return $c.url().urlPart(4).run();
        },
        getOverviewUrl($c) {
            return $c
                .querySelector('div.flex-grow.overflow-y-auto a[data-episode-number]')
                .getAttribute('href')
                .urlAbsolute()
                .run();
        },
        getImage($c) {
            return $c
                .querySelector('div.relative.aspect-\\[2\\/3\\].rounded-2xl img')
                .getAttribute('src')
                .ifNotReturn()
                .run();
        },
        getEpisode($c) {
            return $c
                .url()
                .urlPart(5).number()
                .run();
        },
        nextEpUrl($c) {
            const currentEp = $c.url().urlPart(5).number().run();
            return $c
                .querySelector(`div.flex-grow.overflow-y-auto a[data-episode-number="${currentEp}"]`)
                .next()
                .ifNotReturn()
                .getAttribute('href')
                .urlAbsolute()
                .run();
        },
        uiInjection($c) {
            return $c
                .querySelector('div.bg-\\[\\#0f0f11\\]\\/80.backdrop-blur-md')
                .uiBefore()
                .run();
        },
        getMalUrl($c) {
            return $c
                .querySelector('a[href*="myanimelist.net"]')
                .getAttribute('href').ifNotReturn()
                .run();
        },


    },

    lifecycle: {
        setup($c) {
            return $c.addStyle(require('./style.less?raw').toString()).run();
        },
        ready($c) {
            return $c.detectURLChanges($c.trigger().run()).domReady().trigger().run();
        },
    },
};

