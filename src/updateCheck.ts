import { SyncPage } from './pages/syncPage';
import { pages } from './pages/pages';
import { SearchClass } from './_provider/Search/vueSearchClass';

con.log('updateCheck.ts');

api.settings.init().then(() => {
  const url = new URL(window.location.href);
  const id = url.searchParams.get('mal-sync-background');
  con.log(id);
  const episodeList: any[] = [];

  const page = new SyncPage(window.location.href, pages);
  page.cdn = function() {
    api.request.sendMessage!({ name: 'iframeDone', id: 'retry', epList: [] });
  };
  page.handlePage = async function(curUrl = window.location.href) {
    con.log('handlePage');
    try {
      let state: any;
      if (this.page.isSyncPage(this.url)) {
        state = {
          identifier: this.page.sync.getIdentifier(this.url),
        };

        this.searchObj = new SearchClass('state.title', this.page.type, state.identifier);
        this.searchObj.setPage(this.page);
        this.searchObj.setSyncPage(this);
        await this.searchObj.getCachedOffset();
      } else {
        state = {
          identifier: this.page.overview!.getIdentifier(this.url),
        };

        this.searchObj = new SearchClass('state.title', this.page.type, state.identifier);
        this.searchObj.setPage(this.page);
        this.searchObj.setSyncPage(this);
        await this.searchObj.getCachedOffset();

        con.log('Overview', state);
      }

      if (typeof this.page.overview !== 'undefined' && typeof this.page.overview.list !== 'undefined') {
        const { elementUrl } = this.page.overview.list;
        const tempEpisodeList = j.$.map(this.getEpList(), function(val, i) {
          if (typeof val !== 'undefined') {
            return elementUrl(val);
          }
          return '-';
        });

        let changed = false;
        for (const key in tempEpisodeList) {
          const tempEpisode = tempEpisodeList[key];
          if (tempEpisode !== '-' && (episodeList[key] === '-' || typeof episodeList[key] === 'undefined')) {
            episodeList[key] = tempEpisode.replace(/\?mal-sync-background=[^/]+/, '');
            changed = true;
          }
        }
        // episodeList = episodeList.map(x => Object.assign(x, tempEpisodeList.find(y => y.id == x.id && x == '-')));

        con.log('Episode List', episodeList);
        if (typeof this.page.overview.list.paginationNext !== 'undefined' && changed) {
          con.log('Pagination next');
          const This = this;
          try {
            if (this.page.overview.list.paginationNext(true)) {
              setTimeout(function() {
                This.handlePage();
              }, 500);
            } else {
              setTimeout(function() {
                This.handlePage();
              }, 500);
            }
          } catch (e) {
            con.error(e);
            setTimeout(function() {
              This.handlePage();
            }, 500);
          }
        } else {
          con.log('send');
          let len: undefined | number;
          if (typeof this.page.overview.list.getTotal !== 'undefined') {
            len = this.page.overview.list.getTotal();
          }
          api.request.sendMessage!({
            name: 'iframeDone',
            id: String(id),
            epList: episodeList,
            len,
          });
        }
      } else {
        throw 'Not supported';
      }
    } catch (e) {
      con.error(e);
      api.request.sendMessage!({
        name: 'iframeDone',
        id: String(id),
        epList: episodeList,
        len: undefined,
        error: e,
      });
    }
  };
  page.init();
});

try {
  setInterval(() => {
    const player = document.querySelectorAll('video, audio');
    if (player) {
      for (let i = 0; i < player.length; i++) {
        player[i].parentNode!.removeChild(player[i]);
      }
    }

    const iframes = document.querySelectorAll('iframe');
    if (iframes) {
      for (let i = 0; i < iframes.length; i++) {
        iframes[i].parentNode!.removeChild(iframes[i]);
      }
    }
  }, 500);
} catch (e) {
  con.error(e);
}
