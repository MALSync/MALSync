import { pageInterface } from "./../pageInterface";

function GetOverviewAnchor(): HTMLAnchorElement | null {
  return document.querySelector(`a[href^="anime"]`);
}

function RemoveUnrelatedTurkishWordIzle(title: string) {
  // "izle" is the translation of the word "watch"
  return title.replace(/(?: |-)izle.*/i, "");
}

function IsOverviewUrl(url: string) {
  return /\/anime\//.test(url);
}

// Example urls
// overview page url: https://www.tranimeizle.com/anime/one-punch-man-izle-hd
// sync page url: https://www.tranimeizle.com/one-punch-man-1-bolum-izle

export const TRanimeizle: pageInterface = {
  name: "TRanimeizle",
  domain: "https://www.tranimeizle.com/",
  type: "anime",
  isSyncPage: function(_url: string) {
    let url = new URL(_url);
    let pathnameParts = url.pathname.split("/");

    if(!pathnameParts || pathnameParts.length <= 1) return false;

    // "bolum" is the translation of the word "episode"
    return pathnameParts[1].includes("-bolum-");
  },
  sync: {
    getTitle: () => {
      const overviewLinkElement = GetOverviewAnchor();

      if (!overviewLinkElement) return "";

      return RemoveUnrelatedTurkishWordIzle(overviewLinkElement.innerText);
    },
    getOverviewUrl: () => {
      const overviewLinkElement = GetOverviewAnchor();

      if (!overviewLinkElement) return "";

      return overviewLinkElement.href;
    },
    getIdentifier: () => {
      let overviewUrl = TRanimeizle.sync.getOverviewUrl(undefined);
      let identifier = TRanimeizle.overview?.getIdentifier(overviewUrl);

      if (!identifier) return "";

      return identifier;
    },
    getEpisode: (url: string) => {
      // plunderer-18-bolum-izle -> 18 is episode number
      // ghost-22-1-bolum-izle -> 1 is episode number
      // regexp returns episode number in group 1
      return Number(url.replace(/.*-(\d{1,})-.*/, "$1"));
    },
    nextEpUrl: () => {
      let nextEpisodeAnchor: HTMLAnchorElement | null = document.querySelector(
        `.youtube-wrapper .my-15 a:first-child`
      );

      if (!nextEpisodeAnchor || nextEpisodeAnchor.href.includes("#")) return;

      return nextEpisodeAnchor.href;
    }
  },
  overview: {
    getTitle: () => {
      let titleElement: HTMLHeadElement | null = document.querySelector(
        ".playlist-title > h1"
      );

      if (!titleElement) return "";

      return RemoveUnrelatedTurkishWordIzle(titleElement.innerText);
    },
    uiSelector: (selector: JQuery<HTMLElement>) => {
      const animeDetailElement: HTMLDivElement | null = document.querySelector(
        ".animeDetail"
      );

      if (!animeDetailElement) return;

      selector.prependTo(animeDetailElement);
    },
    getIdentifier: (url: string) => {
      let identifier = utils.urlPart(url, 4);

      if (!identifier) return "";
      
      return identifier;
    },
    list: {
      offsetHandler: false,
      elementsSelector: () => j.$(".animeDetail-items li.episodeBtn"),
      elementUrl: (selector: JQuery<HTMLElement>) => {
        // episodeSlug: plunderer-1-bolum-izle
        const episodeSlug: string = selector.data("slug");

        return TRanimeizle.domain + episodeSlug;
      },
      elementEp: (episodeElement: JQuery<HTMLElement>) => {
        let episodeMeta = $(`meta[itemprop="episodeNumber"]`, episodeElement);

        return Number(episodeMeta.attr("content"));
      }
    }
  },
  init(page) {
    if (document.title == "Just a moment...") {
      con.log("loading");
      page.cdn();

      return;
    }

    api.storage.addStyle(
      require("!to-string-loader!css-loader!less-loader!./style.less").toString()
    );

    j.$(document).ready(function() {
      if (!TRanimeizle.isSyncPage(page.url) && !IsOverviewUrl(page.url)) return;

      page.handlePage();
    });
  }
};
