import { MetaOverviewAbstract } from '../metaOverviewAbstract';
import { UrlNotSupportedError } from '../Errors';
import * as helper from './helper';
import { IntlDateTime, IntlDuration } from '../../utils/IntlWrapper';
import { Queries } from './queries';
import { Anime, Manga, RelationKindEnum } from './types';

export class MetaOverview extends MetaOverviewAbstract {
  constructor(url) {
    super(url);
    this.logger = this.logger.m('Shiki');
    if (url.match(/shikimori\.one\/(animes|mangas|ranobe)\/\D?\d+/i)) {
      this.type = utils.urlPart(url, 3) === 'animes' ? 'anime' : 'manga';
      const res = utils.urlPart(url, 4).match(/^\D?(\d+)/);
      if (res && res[1]) {
        this.malId = Number(res[1]);
        return this;
      }
    }
    if (url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.malId = Number(utils.urlPart(url, 4));
      return this;
    }
    throw new UrlNotSupportedError(url);
  }

  protected readonly type;

  private readonly malId: number;

  async _init() {
    this.logger.log('Retrieve', this.type, this.malId);

    const data = await this.getData();
    if (!data) {
      this.logger.log('Error', data);
      return;
    }
    this.logger.log('Data', data);

    this.title(data);
    this.description(data);
    this.image(data);
    this.alternativeTitle(data);
    this.characters(data);
    this.statistics(data);
    this.info(data);
    this.related(data);
    this.openingSongs(data);
    this.endingSongs(data);

    this.logger.log('Res', this.meta);
  }

  private async getData() {
    if (this.type === 'anime') {
      const anime = await Queries.Anime(`${this.malId}`);
      return anime;
    }
    const manga = await Queries.Manga(`${this.malId}`);
    return manga;
  }

  private title(data: Anime | Manga) {
    this.meta.title = helper.title(data.russian || '', data.english || data.name, true);
  }

  private description(data: Anime | Manga) {
    this.meta.description = data.descriptionHtml || data.description || '';
  }

  private image(data: Anime | Manga) {
    this.meta.image = data.poster!.mainUrl || data.poster!.originalUrl || '';
    this.meta.imageLarge = data.poster!.main2xUrl || data.poster!.originalUrl || '';
  }

  private alternativeTitle(data: Anime | Manga) {
    this.meta.alternativeTitle = [
      ...[data.english || ''], // string
      ...[data.japanese || ''], // string
      ...(data.synonyms || []), // string array
    ].filter(Boolean);
  }

  private characters(data: Anime | Manga) {
    const chars = data.characterRoles;
    if (chars) {
      chars.forEach(i => {
        if (i.character && i.id) {
          this.meta.characters.push({
            img: i.character.poster
              ? i.character.poster.mainUrl || i.character.poster.originalUrl
              : '',
            name: helper.title(
              i.character.russian || i.character.synonyms[0] || '',
              i.character.name,
            ),
            subtext: helper.title(i.rolesRu[0] || '', i.rolesEn[0] || ''),
            url: i.character.url,
          });
        }
      });
      this.meta.characters.sort((a, b) => {
        const roles = ['Main', 'Supporting'];
        const aRole = a.subtext ? roles.indexOf(a.subtext) : 2;
        const bRole = b.subtext ? roles.indexOf(b.subtext) : 2;
        return aRole - bRole;
      });
      this.meta.characters = this.meta.characters.slice(0, 10);
    }
  }

  private statistics(data: Anime | Manga) {
    if (data.score)
      this.meta.statistics.push({
        title: api.storage.lang('overview_sidebar_Score'),
        body: `${data.score}`,
      });

    if (data.statusesStats) {
      const watching = data.statusesStats.find(el => el.status === 'watching');
      const completed = data.statusesStats.find(el => el.status === 'completed');
      const dropped = data.statusesStats.find(el => el.status === 'dropped');
      const oh_hold = data.statusesStats.find(el => el.status === 'on_hold');
      const planned = data.statusesStats.find(el => el.status === 'planned');

      if (watching && watching.count) {
        this.meta.statistics.push({
          title: `${api.storage.lang((data as Manga).chapters ? 'UI_Status_watching_manga' : 'UI_Status_watching_anime')}:`,
          body: `${watching.count}`,
        });
      }
      if (completed && completed.count) {
        this.meta.statistics.push({
          title: `${api.storage.lang('UI_Status_Completed')}:`,
          body: `${completed.count}`,
        });
      }
      if (dropped && dropped.count) {
        this.meta.statistics.push({
          title: `${api.storage.lang('UI_Status_Dropped')}:`,
          body: `${dropped.count}`,
        });
      }
      if (oh_hold && oh_hold.count) {
        this.meta.statistics.push({
          title: `${api.storage.lang('UI_Status_OnHold')}:`,
          body: `${oh_hold.count}`,
        });
      }
      if (planned && planned.count) {
        this.meta.statistics.push({
          title: `${api.storage.lang((data as Manga).chapters ? 'UI_Status_planTo_manga' : 'UI_Status_planTo_anime')}:`,
          body: `${planned.count}`,
        });
      }
    }
  }

  private info(data: Anime | Manga) {
    if (data.kind)
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Format'),
        body: [{ text: utils.upperCaseFirstLetter(data.kind) }],
      });

    if ((data as Anime).duration)
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Duration'),
        body: [
          {
            text: `${new IntlDuration().setRelativeTime((data as Anime).duration || 0, 'minutes', 'Duration').getRelativeText()}`,
          },
        ],
      });

    if (data.status)
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Status'),
        body: [{ text: utils.upperCaseFirstLetter(data.status) }],
      });

    if (data.releasedOn && data.releasedOn.date)
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_End_Date'),
        body: [{ text: `${new IntlDateTime(data.releasedOn.date).getDateTimeText()}` }],
      });

    if (data.airedOn && data.airedOn.date)
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Start_Date'),
        body: [{ text: new IntlDateTime(data.airedOn.date).getDateTimeText() }],
      });

    if (this.type === 'manga' && data.personRoles && data.personRoles.length) {
      const authors: {
        text: string;
        url: string;
      }[] = [];
      data.personRoles.forEach(i => {
        if (i.person && i.person.id) {
          let text = helper.title(i.person.russian || '', i.person.name || '');
          if ((i.rolesRu && i.rolesRu.length) || (i.rolesEn && i.rolesEn.length))
            text += ` (${i.rolesRu[0] || i.rolesEn[0] || ''})`;

          authors.push({
            text,
            url: i.person.url,
          });
        }
      });

      if (authors.length)
        this.meta.info.push({
          title: `${api.storage.lang('overview_sidebar_Authors')}`,
          body: authors,
        });
    }

    if ((data as Anime).studios && (data as Anime).studios.length) {
      const studios: {
        text: string;
        url: string;
      }[] = [];
      (data as Anime).studios.forEach(i => {
        studios.push({
          text: i.name,
          url: `https://shikimori.one/animes/studio/${i.id}`,
        });
      });

      if (studios.length)
        this.meta.info.push({
          title: api.storage.lang('overview_sidebar_Studios'),
          body: studios,
        });
    }

    const genres: {
      text: string;
      url: string;
    }[] = [];
    if (data.genres && data.genres.length) {
      data.genres.forEach(i => {
        genres.push({
          text: i.russian || i.name || '',
          url: `https://shikimori.one/${this.type}s/genre/${i.id}`,
        });
      });
    }
    if (genres.length)
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Genres'),
        body: genres,
      });
  }

  private related(data: Anime | Manga) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const links: any = {};

    if (data.related) {
      data.related.forEach(el => {
        if (!links[el.relationKind]) {
          links[el.relationKind] = {
            type: helper.title(el.relationText, RelationKindEnum[el.relationKind]),
            links: [],
          };
        }
        links[el.relationKind].links.push({
          url: `${el.manga ? el.manga.url || '' : el.anime!.url || ''}`,
          title: helper.title(
            el.manga ? el.manga.russian || '' : el.anime!.russian || '',
            el.manga ? el.manga.english || el.manga.name : el.anime!.english || el.anime!.name,
          ),
          type: (data as Manga).chapters ? 'manga' : 'anime',
          id: el.manga ? el.manga.id : el.anime!.id,
        });
      });

      this.meta.related = Object.values(links);
    }
  }

  openingSongs(data: Anime | Manga) {
    if (this.type !== 'anime') return;
    const openingSongs: {
      title: string;
      author: string;
      episode: string;
      url?: string;
    }[] = [];
    const anime = data as Anime;
    for (let i = 0; i < anime.videos.length; i++) {
      const video = anime.videos[i];
      if (video.kind !== 'op') continue;
      openingSongs.push({
        title: video.name || '',
        author: '',
        episode: '',
        url: video.url,
      });

      this.meta.openingSongs = openingSongs;
    }
  }

  endingSongs(data: Anime | Manga) {
    if (this.type !== 'anime') return;
    const endingSongs: {
      title: string;
      author: string;
      episode: string;
      url?: string;
    }[] = [];
    const anime = data as Anime;
    for (let i = 0; i < anime.videos.length; i++) {
      const video = anime.videos[i];
      if (video.kind !== 'ed') continue;
      endingSongs.push({
        title: video.name || '',
        author: '',
        episode: '',
        url: video.url,
      });

      this.meta.endingSongs = endingSongs;
    }
  }

  protected apiCall = helper.apiCall;
}
