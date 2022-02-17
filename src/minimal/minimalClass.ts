import VueLazyLoad from 'vue3-lazyload';
import { createApp } from '../utils/Vue';
import minimalApp from './minimalApp.vue';

export class Minimal {
  private history: string[] = [];

  private minimalVue;

  // eslint-disable-next-line no-shadow
  constructor(public minimal) {
    this.minimal.find('body').append(j.html('<div id="minimalApp"></div>'));
    this.minimalVue = createApp(minimalApp, this.minimal.find('#minimalApp').get(0), {
      use: vue => {
        vue.use(VueLazyLoad, {
          error: api.storage.assetUrl('questionmark.gif'),
          observerOptions: {
            root: document.querySelector('.mdl-layout__content'),
          },
        });
      },
    });
    this.minimalVue.updateDom = () => {
      this.updateDom();
    };

    this.minimal.find('head').append(j.html('<base href="https://myanimelist.net/">'));

    this.uiListener();
    this.injectCss();
    this.loadSettings();
    this.updateDom();

    function handleConnectionChange(event) {
      if (event.type === 'offline') {
        con.log('Offline');
        utils.flashm("You're offline check your connection", {
          error: true,
          type: 'offline',
          permanent: true,
        });
      }
      if (event.type === 'online') {
        con.log('You are now back online.');
        $('.type-offline').remove();
      }
    }
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
  }

  uiListener() {
    const modal = document.getElementById('info-popup');
    const This = this;

    this.minimal.on('click', '.mdl-layout__content a', function (e) {
      // @ts-ignore
      if (j.$(this).attr('target') === '_blank' || j.$(this).hasClass('nojs')) {
        return;
      }
      e.preventDefault();
      // @ts-ignore
      let url = j.$(this).attr('href') || '';
      if (!/^local:\/\//i.test(url)) url = utils.absoluteLink(url, 'https://myanimelist.net');

      if (!This.fill(url)) {
        const win = window.open(url, '_blank');
        if (win) {
          win.focus();
        } else {
          alert(api.storage.lang('minimalClass_Popup'));
        }
      }
    });

    this.minimal.find('#close-info-popup').click(function () {
      if (This.isPopup()) {
        window.close();
      } else {
        modal!.style.display = 'none';
        j.$('.floatbutton').fadeIn();
      }
    });

    this.minimal.find('#material-fullscreen').click(function () {
      if (j.$('.modal-content-kal.fullscreen').length) {
        j.$('.modal-content-kal').removeClass('fullscreen');
        // @ts-ignore
        j.$(this).find('i').text('fullscreen');
      } else {
        j.$('.modal-content-kal').addClass('fullscreen');
        // @ts-ignore
        j.$(this).find('i').text('fullscreen_exit');
      }
    });
  }

  isPopup() {
    if (j.$('#Mal-Sync-Popup').length) return true;
    return false;
  }

  updateDom() {
    this.minimal.find('head').click();
  }

  injectCss() {
    // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
    this.minimal
      .find('head')
      // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
      .append(
        // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
        j
          // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
          .$('<style>')
          .html(require('!to-string-loader!css-loader!less-loader!./minimalStyle.less').toString()),
      );
  }

  fill(url: string | null) {
    return this.minimalVue.fill(url);
  }

  fillBase(url: string | null) {
    return this.minimalVue.fillBase(url);
  }

  private pageSync;

  setPageSync(page) {
    this.minimalVue.setPage(page);
  }

  loadSettings() {
    const This = this;

    // Listener
    this.minimal.find('#posLeft').val(api.settings.get('posLeft'));
    this.minimal.find('#posLeft').change(function () {
      // @ts-ignore
      api.settings.set('posLeft', j.$(this).val());
      // @ts-ignore
      j.$('#modal-content')
        .css('right', 'auto')
        .css('left', 'auto')
        .css(String(j.$(this).val()), '0');
    });

    this.minimal.find('#autoTrackingModeanime').val(api.settings.get('autoTrackingModeanime'));
    this.minimal.find('#autoTrackingModeanime').change(function () {
      // @ts-ignore
      api.settings.set('autoTrackingModeanime', j.$(this).val());
    });

    this.minimal.find('#theme').val(api.settings.get('theme'));
    this.minimal.find('#theme').change(function () {
      // @ts-ignore
      api.settings.set('theme', j.$(this).val());
      This.minimal.attr('id', 'cr');
    });

    this.minimal.find('#autoTrackingModemanga').val(api.settings.get('autoTrackingModemanga'));
    this.minimal.find('#autoTrackingModemanga').change(function () {
      // @ts-ignore
      api.settings.set('autoTrackingModemanga', j.$(this).val());
    });

    this.minimal.find('#miniMalWidth').on('input', function () {
      let miniMalWidth = This.minimal.find('#miniMalWidth').val();
      if (miniMalWidth !== null) {
        if (miniMalWidth === '') {
          miniMalWidth = '30%';
          utils.flashm('Width reset');
        }
        api.settings.set('miniMalWidth', miniMalWidth);
      }
      j.$('#modal-content').css('width', miniMalWidth);
    });

    this.minimal.find('#syncMode').change(function () {
      // @ts-ignore
      const value = j.$(this).val();
      api.settings.set('syncMode', value);
      This.minimal.find('#clearCache').click();
    });
    this.minimal.find('#syncMode').val(api.settings.get('syncMode'));

    this.minimal.find('#miniMalHeight').on('input', function () {
      let miniMalHeight = This.minimal.find('#miniMalHeight').val();
      if (miniMalHeight !== null) {
        if (miniMalHeight === '') {
          miniMalHeight = '90%';
          utils.flashm('Height reset');
        }
        api.settings.set('miniMalHeight', miniMalHeight);
      }
      j.$('#modal-content').css('height', miniMalHeight);
    });

    this.minimal.find('#malThumbnail').val(api.settings.get('malThumbnail'));
    this.minimal.find('#malThumbnail').change(function () {
      api.settings.set('malThumbnail', This.minimal.find('#malThumbnail').val());
    });

    this.minimal.find('#clearCache').click(async function () {
      const cacheArray = await api.storage.list();
      let deleted = 0;

      j.$.each(cacheArray, function (index, cache) {
        if (!utils.syncRegex.test(String(index)) && !/(^tagSettings\/.*)/.test(String(index))) {
          api.storage.remove(String(index));
          deleted++;
        }
      });

      utils.flashm(`Cache Cleared [${deleted}]`);
    });

    if (api.type === 'webextension') {
      this.minimal.find('.option-extension').show();
    }

    if (api.type === 'webextension' && this.isPopup()) {
      this.minimal.find('.option-extension-popup').show();
    }

    this.minimal.find('#listSyncUi').click(() => {
      this.minimalVue.selectTab('listSync');
    });

    this.minimal.find('#cleanTagsUi').click(() => {
      this.minimalVue.selectTab('cleanTags');
    });

    this.minimal.find('#allSitesUi').click(() => {
      this.minimalVue.selectTab('allSites');
    });

    this.minimal.find('#customDomainsUi').click(() => {
      this.minimalVue.selectTab('customDomains');
    });

    this.minimal.find('#quicklinkoverview').click(() => {
      this.minimalVue.selectTab('quicklinks');
    });

    api.storage.get('tempVersion').then(version => {
      let versionMsg = '';

      if (version !== api.storage.version()) {
        versionMsg = api.storage.lang('minimalClass_versionMsg', [
          api.storage.version(),
          `[<a class="close" target="_blank" href="https://malsync.lolamtisch.de/changelog#${api.storage.version()}">`,
        ]);
      }
      con.log(version);
      if (typeof version === 'undefined' && api.type !== 'webextension') {
        versionMsg = `
            <div style="
              text-align: left;
              margin-left: auto;
              margin-right: auto;
              display: inline-block;
              padding: 10px 15px;
              background-color: #3d4e9a;
              margin-top: -5px;
            ">
              <span style="text-decoration: underline; font-size: 15px;">${api.storage.lang(
                'minimalClass_versionMsg_Text_1',
              )}</span><br>
              <br>
              ${api.storage.lang('minimalClass_versionMsg_Text_4')}<br>
              <a target="_blank" href="https://github.com/Karmesinrot/Anifiltrs#anifiltrs">
                <img alt="Filter List" src="https://img.shields.io/badge/ublock-Anifiltrs-800900.svg?style=flat-square">
              </a><br>
              <br>


              ${api.storage.lang('minimalClass_versionMsg_Text_2')}<br>
              <a target="_blank" href="https://discord.com/invite/cTH4yaw">
                <img alt="Discord" src="https://img.shields.io/discord/358599430502481920.svg?style=flat-square&amp;logo=discord&amp;label=Discord&amp;colorB=7289DA">
              </a><br>
              <a target="_blank" href="https://github.com/MALSync/MALSync/issues">
                <img alt="Github Issues" src="https://img.shields.io/github/issues/MALSync/MALSync.svg?style=flat-square&amp;logo=github&amp;logoColor=white">
              </a><br>
              <br>
              ${api.storage.lang('minimalClass_versionMsg_Text_3')}<br>
              <a target="_blank" href="https://github.com/MALSync/MALSync">
                <img alt="Github" src="https://img.shields.io/github/last-commit/MALSync/MALSync.svg?style=flat-square&amp;logo=github&amp;logoColor=white&amp;label=Github">
              </a>
            </div>
          `;
      }
      if (versionMsg !== '') {
        this.flashm(versionMsg, function () {
          api.storage.set('tempVersion', api.storage.version());
        });
      }
    });
  }

  flashm(text, closefn) {
    const mess = `
      <div style="
        background-color: #3f51b5;
        text-align: center;
        padding: 5px 24px;
        color: white;
        border-top: 1px solid #fefefe;
      ">
        ${text}
        <i class="material-icons close" style="
          float: right;
          font-size: 24px;
          margin-top: -2px;
          margin-right: -24px;
          margin-bottom: -5px;
        ">${api.storage.lang('close')}</i>
      </div>
    `;

    // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
    const flashmDiv = j.$(j.html(mess)).appendTo(this.minimal.find('.mdl-layout'));
    flashmDiv.find('.close').click(function () {
      flashmDiv.slideUp(100, function () {
        flashmDiv.remove();
        closefn();
      });
    });
    return flashmDiv;
  }
}
