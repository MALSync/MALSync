import { pageInterface } from "./../pageInterface";

export const AnimeOdcinki: pageInterface = {
<<<<<<< HEAD
	name: "AnimeOdcinki",
	domain: "https://anime-odcinki.pl",
	type: "anime",
	isSyncPage: function (url) {
		return url.split("/")[5] !== undefined;
	},
	sync: {
		getTitle: function (url) {
			return j.$('.field-name-field-tytul-anime a').text();
		},
		getIdentifier: function (url) {
			return url.split("/")[4];
		},
		getOverviewUrl: function (url) {
			return j.$('.field-name-field-tytul-anime a').attr("href");
		},
		getEpisode: function (url) {
			return parseInt(j.$(".page-header").text().substr(j.$('.field-name-field-tytul-anime a').text().length).match(/\d+/i)[0]);
		},
		nextEpUrl: function (url) {
			return j.$("#video-next").attr("href");
		}
	},
	overview: {
		getTitle: function (url) {
			return j.$(".page-header").text();
		},
		getIdentifier: function (url) {
			return url.split("/")[4];
		},
		uiSelector: function (selector) {
			selector.insertAfter(j.$('#user-anime-top').first());
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
  name: "AnimeOdcinki",
  domain: "https://anime-odcinki.pl",
  type: "anime",
  isSyncPage: function (url) {
    return url.split("/")[5] !== undefined;
  },
  sync: {
    getTitle: function (url) {
      return j.$('.field-name-field-tytul-anime a').text();
    },
    getIdentifier: function (url) {
      return url.split("/")[4];
    },
    getOverviewUrl: function (url) {
      return utils.absoluteLink(j.$('.field-name-field-tytul-anime a').attr("href"), AnimeOdcinki.domain)
    },
    getEpisode: function (url) {
      return parseInt(j.$(".page-header").text().substr(j.$('.field-name-field-tytul-anime a').text().length).match(/\d+/i)[0]);
    },
    nextEpUrl: function (url) {
      return j.$("#video-next").attr("href");
    }
  },
  overview: {
    getTitle: function (url) {
      return j.$(".page-header").text();
    },
    getIdentifier: function (url) {
      return url.split("/")[4];
    },
    uiSelector: function (selector) {
      selector.insertAfter(j.$('#user-anime-top').first());
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
