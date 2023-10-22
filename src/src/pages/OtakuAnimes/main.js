export const OtakuAnimes = {
    name: 'OtakuAnimes',
    domain: 'https://otakuanimess.com',
    languages: ['Portuguese'],
    type: 'anime',
    isSyncPage(url) {
        if (url.split('/')[3] === 'episodio') {
            return true;
        }
        return false;
    },
    isOverviewPage(url) {
        if (url.split('/')[3] === 'animes') {
            return true;
        }
        return false;
    },
    sync: {
        getTitle(url) {
            return removeDubTitle(j.$('#weds > div > div.headerEP > div > h1').text());
        },
        getIdentifier(url) {
            return utils.urlPart(url, 5);
        },
        getOverviewUrl(url) {
            return `${OtakuAnimes.domain}/animes/${url.split('/')[5]}`;
        },
        getEpisode(url) {
            return Number(utils.urlPart(url, 6));
        },
        nextEpUrl(url) {
            const nextEp = j.$('#weds > div > div.headerEP > div > div > div.controle.purp1 > a').attr('href');
            if (!nextEp || nextEp.includes('javascript'))
                return '';
            return nextEp;
        },
    },
    overview: {
        getTitle(url) {
            return removeDubTitle(j.$('#weds > div > div.pageAnime > div > div > div.right > div.animeFirstContainer > h1').text());
        },
        getIdentifier(url) {
            return utils.urlPart(url, 5);
        },
        uiSelector(selector) {
            j.$('#weds > div > div.pageAnime > div > div > div.right > div.animeSecondContainer').after(j.html(selector));
        },
        list: {
            offsetHandler: true,
            elementsSelector() {
                return j.$('#aba_epi > a');
            },
            elementUrl(selector) {
                return utils.absoluteLink(selector.attr('href'), OtakuAnimes.domain);
            },
            elementEp(selector) {
                var _a;
                return Number((_a = selector.attr('title')) === null || _a === void 0 ? void 0 : _a.split(' ').at(-1));
            },
        },
    },
    init(page) {
        api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
        j.$(document).ready(function () {
            if (page.url.split('/')[3] === 'episodio' && typeof page.url.split('/')[6] !== 'undefined') {
                page.handlePage();
            }
        });
    },
};
function removeDubTitle(title) {
    const newTitle = title
        .replace('dublado', '')
        .replace('Dublado', '')
        .trim();
    return newTitle;
}
//# sourceMappingURL=main.js.map