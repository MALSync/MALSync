import type {
  BakaDocumentEvents,
  BakaLibraryEntry,
  BakaSeries,
} from '../_provider/MangaBaka/types';
import { getAlternativeTitles } from '../_provider/MangaBaka/helper';
import { createApp } from '../utils/Vue';
import quickLinksUi from './quickLinksUi.vue';
import { Single } from '../_provider/MangaBaka/single';
import { ProgressRelease } from '../utils/progressRelease';

let elementEventBuffer: BakaDocumentEvents[] = [];
let elementEventListener: ((v: BakaDocumentEvents) => void) | null = null;
document.addEventListener('mb:element:ready', v => {
  if (!elementEventListener) {
    elementEventBuffer.push(v as BakaDocumentEvents);
    return;
  }
  elementEventListener(v as BakaDocumentEvents);
});

export class MangaBakaClass {
  protected readonly primaryCardClass = '[data-browser-extension-injection="primary-card"]';

  protected series: BakaSeries | null = null;

  protected single: Single | null = null;

  constructor() {
    elementEventListener = (e: BakaDocumentEvents) => this.elementEvent(e);
    elementEventBuffer.forEach(event => {
      this.elementEvent(event);
    });
    elementEventBuffer = [];
  }

  getUrl() {
    return this.series?.id ? `https://mangabaka.org/${this.series?.id}` : '';
  }

  getMalUrl() {
    return this.series?.source.my_anime_list.id
      ? `https://myanimelist.net/manga/${this.series.source.my_anime_list.id}`
      : '';
  }

  getImage() {
    return j.$(`${this.primaryCardClass} [data-slot="card-content"] picture img`).attr('src') || '';
  }

  getTitle() {
    return this.series?.title || '';
  }

  elementEvent(event: BakaDocumentEvents) {
    if (['after-links', 'meta-chapter-count'].includes(event.detail.name)) {
      let cacheKey: string | number | null = event.detail.series.source.my_anime_list.id;
      if (!cacheKey && event.detail.series.source.anilist.id) {
        cacheKey = `anilist:${event.detail.series.source.anilist.id}`;
      }

      if (event.detail.name === 'after-links') {
        this.series = event.detail.series;
        this.injectQuickLinks(
          j.$(`#${event.detail.element_id}`),
          event.detail.series.title,
          getAlternativeTitles(event.detail.series) || [],
          cacheKey,
        );
      } else if (event.detail.name === 'meta-chapter-count') {
        this.injectProgress(
          j.$(`#${event.detail.element_id}`),
          event.detail.series,
          event.detail.library_series,
          cacheKey,
        ) as any;
      }
    } else if (event.detail.name === 'after-tags') {
      this.progressListEvent(j.$(`#${event.detail.element_id}`), event.detail.series);
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

  async injectProgress(
    element: JQuery<HTMLElement>,
    series: BakaSeries,
    libraryEntry: BakaLibraryEntry | null = null,
    cacheKey?: string | number | null,
  ) {
    const isOverview = element.closest(this.primaryCardClass).length > 0;

    let progress: ProgressRelease | null = null;
    if (isOverview) {
      const single = new Single(`https://mangabaka.org/${series.id}`);
      single.forceSeries = series;
      single.forceLibraryEntry = libraryEntry;
      await single.update();

      await single.initProgress();

      progress = single.getProgress();

      this.single = single;
      this.bufferedProgressListInjects();
    } else {
      if (!libraryEntry) return;
      progress = await new ProgressRelease(cacheKey as string, 'manga').init();
    }

    if (progress?.isAiring() && progress.progress()?.getCurrentEpisode()) {
      const progressColor =
        !libraryEntry || progress.progress()!.getCurrentEpisode()! > libraryEntry.progress_chapter!
          ? '--primary'
          : '--success';

      let styling = `
        background-color: var(${progressColor});
        color: var(--primary-foreground);
        border-radius: 3px;
        padding: 0 2px;
      `;

      if (progress.progress()!.getCurrentEpisode() === Number(series.total_chapters)) {
        element.attr('style', styling);
        element.attr('title', progress.progress()!.getAutoText());
      } else {
        styling += 'margin-right: 4px;';
        const progressElement = document.createElement('span');
        progressElement.classList.add('mal-sync-ep-pre');
        progressElement.title = progress.progress()!.getAutoText();
        progressElement.style = styling;
        progressElement.innerText = String(progress.progress()!.getCurrentEpisode());

        element.find('.mal-sync-ep-pre').remove();
        // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
        element.prepend(progressElement);
      }
    }
  }

  bufferedProgressListInjects: () => void = () => {};

  progressListEvent(element: JQuery<HTMLElement>, series: BakaSeries) {
    this.bufferedProgressListInjects = () => {
      this.injectProgressList(element, series);
    };
    this.injectProgressList(element, series);
  }

  injectProgressList(element: JQuery<HTMLElement>, series: BakaSeries) {
    con.log('injectProgressList', element, series);

    if (!this.single) return;
    if (this.single.getIds().baka !== series.id) return;

    const progressItems = this.single.getProgressFormatted();

    if (progressItems.length) {
      const main = document.createElement('div');
      main.id = 'malsync-progress-list';

      const progress = document.createElement('div');

      const progressTitle = document.createElement('h2');
      progressTitle.classList = 'text-xl font-semibold';
      progressTitle.innerText = api.storage.lang('list_sorting_latest_release');
      progress.appendChild(progressTitle);

      const progressList = document.createElement('div');
      progressList.classList = 'flex flex-col gap-2 pt-2';

      const badgeStyling =
        j.$('[data-slot="badge"][class*="bg-secondary"]').first().attr('class') || '';

      progressItems.forEach(item => {
        if (!item.getCurrentEpisode()) return;

        const itemElement = document.createElement('div');
        itemElement.classList = 'flex gap-2';

        const itemTitle = document.createElement('span');
        itemTitle.innerText = item.getLanguageLabel();
        itemTitle.classList = 'ms-progress-title';
        itemElement.appendChild(itemTitle);

        const episodeString =
          item.getState() === 'complete'
            ? api.storage.lang('prediction_complete')
            : `${api.storage.lang('settings_listsync_progress_manga').replace(':', '')} ${item.getCurrentEpisode()}`;
        const episodeElement = document.createElement('span');
        episodeElement.innerText = ` ${episodeString}`;
        episodeElement.classList = `ms-progress-episode ${badgeStyling}`;
        episodeElement.title = item.getAutoText();
        itemElement.appendChild(episodeElement);

        if (item.isDropped()) {
          const droppedElement = document.createElement('span');
          droppedElement.innerText = 'warning';
          droppedElement.classList = 'material-icons';
          droppedElement.title = api.storage.lang('UI_Status_Dropped');
          itemElement.appendChild(droppedElement);
        }

        progressList.appendChild(itemElement);
      });

      progress.appendChild(progressList);

      main.appendChild(progress);

      element.addClass('malsync-injected').removeClass('hidden');
      element.find('#malsync-progress-list').remove();
      // eslint-disable-next-line jquery-unsafe-malsync/no-xss-jquery
      element.append(main);
    }
  }
}
