import { pageInterface } from "./../pageInterface";

export const AnimeZone: pageInterface = {
<<<<<<< HEAD
	name: "AnimeZone",
	domain: "https://www.animezone.pl",
	type: "anime",
	isSyncPage: function (url) {
		return url.split("/")[5] !== undefined;
	},
	sync: {
		getTitle: function (url) {
			return j.$(".category-description .panel-title").attr("title");
		},
		getIdentifier: function (url) {
			return url.split("/")[4];
		},
		getOverviewUrl: function (url) {
			return j.$(".all-episodes > a").attr("href");
		},
		getEpisode: function (url) {
			return url.split("/")[5];
		},
		nextEpUrl: function (url) {
			let href = j.$(".next a").attr("href");
			if (href)
				return utils.absoluteLink(href, AnimeZone.domain);
		}
	},
	overview: {
		getTitle: function (url) {
			return j.$(".category-description .panel-title").attr("title");
		},
		getIdentifier: function (url) {
			return url.split("/")[4];
		},
		uiSelector: function (selector) {
			selector.insertAfter(j.$('.ratings .panel-body .description').first());
		}
	},

	init(page) {
		if (document.title == "Just a moment...") {
			con.log("loading");
			page.cdn();
			return;
		}
		api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
		j.$(document).ready(function () {
			page.handlePage();
		});
	}
=======
  name: "AnimeZone",
  domain: "https://www.animezone.pl",
  type: "anime",
  isSyncPage: function (url) {
    return url.split("/")[5] !== undefined;
  },
  sync: {
    getTitle: function (url) {
      return j.$(".category-description .panel-title").attr("title");
    },
    getIdentifier: function (url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function (url) {
      return utils.absoluteLink(j.$(".all-episodes > a").attr("href"), AnimeZone.domain)
    },
    getEpisode: function (url) {
      return url.split("/")[5];
    },
    nextEpUrl: function (url) {
      let href = j.$(".next a").attr("href");
      if (href)
        return utils.absoluteLink(href, AnimeZone.domain);
    }
  },
  overview: {
    getTitle: function (url) {
      return j.$(".category-description .panel-title").attr("title");
    },
    getIdentifier: function (url) {
      return url.split("/")[4];
    },
    uiSelector: function (selector) {
      selector.insertAfter(j.$('.ratings .panel-body .description').first());
    }
  },

  init(page) {
    if (document.title == "Just a moment...") {
      con.log("loading");
      page.cdn();
      return;
    }
    api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
    j.$(document).ready(function () {
      page.handlePage();
    });
  }
>>>>>>> upstream/master
};
