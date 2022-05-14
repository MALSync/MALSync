import { pageInterface } from '../pageInterface';

export const OxyAnime: pageInterface = {
  name: 'OxyAnime',
  domain: 'https://oxyanime.to',
  database: 'OxyAnime',
  languages: ['English'],
  type: 'anime',
  isSyncPage(url) {
    if (url.split('/')[4] === "watch") {
      return true;
    }
    return false;
  },
  isOverviewPage(url) {
    if ( url.split('/')[4] === 'detail' ){
      return true;
    }
    return false;
  },
  sync: {
    getTitle(url) {
      let title =  url.split('/')[5];
      return title.replace('-'," ");
    },
    getIdentifier(url) {
      return url.split('/')[5];
    },
    getOverviewUrl(url) {
      return (OxyAnime.domain+ "/" + j.$('.titlecss > .w3-tag').attr("href"));
    },
    getEpisode(url) {
      return Number(j.$('.ep_container > div > div > button.active').text());
    },
    uiSelector(selector) {
      j.$('.w3-rest > .w3-card-4.w3-container.w3-border-bottom > div').before(j.html(`<section style="font-size: 12px;padding: 5px;">${selector}</section>`));
    },
    nextEpUrl(url) {
      let nextep = j.$('.ep_container > div > div > button.active').parent("div").next().find('button').text().trim();
      if(!nextep){
        nextep = j.$('.ep_container > div > div > button.active').text().trim();
      }
      return (OxyAnime.domain+"/#/watch/"+OxyAnime.sync.getIdentifier(url)+"/"+nextep+"/0");
    },
  },
  overview: {
    getTitle(url) {
      return j.$('.w3-threequarter > div:nth-child(1) > h2').text();
    },
    getIdentifier(url) {
      if(url.split('/')[6] == "0"){
        return url.split('/')[5];
      }else{
        return url.split('/')[6];
      }
    },
    uiSelector(selector) {
      j.$('.w3-threequarter > div:nth-child(1) >  h2').before(j.html(`<section>${selector}</section>`));
    },
    list: {
      offsetHandler: false,
      elementsSelector() {
        return j.$('.ep_container > div > div > button');
      },
      elementUrl(selector) {
        let ep = selector.text().trim()
        return OxyAnime.domain+"/#/watch/"+OxyAnime.sync.getIdentifier(window.location.href)+"/"+ep+"/0";
      },
      elementEp(selector) {
        return Number(selector.text());
      },
    },
  },
  init(page) {
    con.log("MALSYNC connect Oxyanime");
    api.storage.addStyle(
      require('!to-string-loader!css-loader!less-loader!./style.less').toString(),
    );

    let interval;

    utils.fullUrlChangeDetect(function () {
      reload();
    }, true);

    function reload() {
      page.reset();
      clearInterval(interval);
      interval = utils.waitUntilTrue(
        function () {
          return checkpath(window.location.href);
        },
        function(){
          page.handlePage();
          utils.urlChangeDetect(function () {
            reload();
          });
        }
      );
    }

    function checkpath(url:string){
      if(OxyAnime.isOverviewPage!(url) && j.$('.w3-threequarter > div:nth-child(1) > h2').text().length)
        return true;
      else if(OxyAnime.isSyncPage!(url) && j.$('.titlecss').text().search("Loading...") == -1 ){
        return true;
      }else
        return false;
    }
  },
};
