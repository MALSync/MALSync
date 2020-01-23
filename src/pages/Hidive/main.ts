import {
	pageInterface
}
from "./../pageInterface";

export const Hidive: pageInterface = {
	name: "Hidive",
	domain: "https://www.hidive.com",
	type: "anime",
	isSyncPage: function (url) {
		if (url.split("/")[3] === "stream") {
			return true;
		} else {
			return false;
		}
	},

	sync: {
		getTitle: function (url) {
			return j.$("#TitleDetails").text();
		},
		getIdentifier: function (url) {
			return url.split("/")[4];
		},
		getOverviewUrl: function (url) {
			return Hidive.domain + j.$("#TitleDetails").attr("href");
		},
		getEpisode: function (url) {
			var temp = url.split("/")[5];
			var regex = /^\d/
				if (regex.test(temp)) {
					return Number(temp.slice(8));
				} else {
					return Number(temp.slice(4));
				}
		},
		nextEpUrl: function (url) {
			var nextEp = j.$("#StreamNextEpisode .episode-play").attr('data-key');
			if (!nextEp) {
				return nextEp;
			}
			if (nextEp !== url.split("/")[5]) {
				return Hidive.domain + "/stream/" + j.$("#StreamNextEpisode .episode-play").attr('data-videotitle') + "/" + nextEp;
			} else {
				return undefined;
			}
		},
	},

	overview: {
		getTitle: function (url) {
			return j.$("div.text-container a").text().replace(('Score It'), '').trim();
		},
		getIdentifier: function (url) {
			return url.split("/")[4];
		},
		uiSelector: function (selector) {
			j.$('<div class="container"> <p id="malp">' + selector.html() + '</p></div>').insertAfter(j.$("div.details").first());
		},

	},

	init(page) {
		if (document.title == "Just a moment...") {
			con.log("loading");
			page.cdn();
			return;
		}
		api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());
		j.$(document).ready(function () {
			if ((page.url.split("/")[3] === "stream" || page.url.split("/")[3] === "tv" || page.url.split("/")[3] === "movies") && page.url.split("/")[4] !== undefined) {
				page.handlePage()
				utils.urlChangeDetect(function () {
					con.info('Check');
					page.handlePage();
				});
			}
		});
	}
};
