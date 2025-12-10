import type { ElementReadyEvent } from '../_provider/MangaBaka/types';
import { getAlternativeTitles } from '../_provider/MangaBaka/helper';
import { createApp } from '../utils/Vue';
import quickLinksUi from './quickLinksUi.vue';

let elementEventBuffer: ElementReadyEvent[] = [];
let elementEventListener: ((v: ElementReadyEvent) => void) | null = null;
document.addEventListener('mb:element:ready', v => {
  con.info('mb:element:ready', v);
  if (!elementEventListener) {
    elementEventBuffer.push(v as ElementReadyEvent);
    return;
  }
  elementEventListener(v as ElementReadyEvent);
});

export class MangaBakaClass {
  protected readonly primaryCardClass = '[data-browser-extension-injection="primary-card"]';

  constructor(public url: string) {
    $(document).ready(() => {
      elementEventListener = (e: ElementReadyEvent) => this.elementEvent(e);
      elementEventBuffer.forEach(event => {
        this.elementEvent(event);
      });
      elementEventBuffer = [];
    });
  }

  getMalUrl() {
    return (
      j
        .$(`${this.primaryCardClass} [data-umami-event-source="my-anime-list"]`)
        .first()
        ?.attr('href') || ''
    );
  }

  getImage() {
    return j.$(`${this.primaryCardClass} [data-slot="card-content"] picture img`).attr('src') || '';
  }

  getTitle() {
    return j.$('h1.text-primary').text() || '';
  }

  elementEvent(event: ElementReadyEvent) {
    if (event.detail.name === 'after-links') {
      let cacheKey: string | number | null = event.detail.series.source.my_anime_list.id;
      if (!cacheKey && event.detail.series.source.anilist.id) {
        cacheKey = `anilist:${event.detail.series.source.anilist.id}`;
      }
      this.injectQuickLinks(
        j.$(`#${event.detail.element_id}`),
        event.detail.series.title,
        getAlternativeTitles(event.detail.series) || [],
        cacheKey,
      );
    }
  }

  private quickLinksVueEl;

  injectQuickLinks(
    element: JQuery<HTMLElement>,
    title: string,
    alternativeTitle: string[],
    cacheKey?: string | number | null,
  ) {
    con.log('injectQuickLinks', element, title, alternativeTitle, cacheKey);

    const main = document.createElement('div');
    main.id = 'malsync-quick-links';

    const header = document.createElement('h2');
    header.classList = 'text-xl font-semibold';
    header.innerText = api.storage.lang('settings_StreamingSite');
    main.appendChild(header);

    const links = document.createElement('div');
    links.id = 'malsync-update-ui';

    main.appendChild(links);

    element.addClass('malsync-injected').removeClass('hidden');
    // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
    element.append(main);

    if (this.quickLinksVueEl) this.quickLinksVueEl.$.appContext.app.unmount();
    this.quickLinksVueEl = createApp(quickLinksUi, '#malsync-update-ui', {
      shadowDom: true,
      use: vue => {
        vue.provide('cacheKey', cacheKey);
        vue.provide('title', title);
        vue.provide('alternativeTitle', alternativeTitle);
        vue.provide('rootClass', document.documentElement.className);
      },
    });

    this.quickLinksVueEl.$.appContext.app.component('router-link', {
      props: ['to', 'href'],
      template: '<a :href="href || to" rel="noopener"><slot /></a>',
    });
  }
}
