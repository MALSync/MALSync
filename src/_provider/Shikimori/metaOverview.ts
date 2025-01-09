import { MetaOverviewAbstract } from '../metaOverviewAbstract';
import { UrlNotSupportedError } from '../Errors';
import * as helper from './helper';
import { IntlDateTime, IntlDuration } from '../../utils/IntlWrapper';

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
    this.logger.log('Data', data);

    this.title(data);
    this.description(data);
    this.image(data);
    this.alternativeTitle(data);
    this.characters(data);
    this.statistics(data);
    this.info(data);
    this.related(data);

    this.logger.log('Res', this.meta);
  }

  private async getData() {
    const meta = await helper.apiCall({
      path: `${this.type}s/${this.malId}`,
      type: 'GET',
    });

    const roles = await helper.apiCall({
      path: `${this.type}s/${this.malId}/roles`,
      type: 'GET',
    });

    const related = await helper.apiCall({
      path: `${this.type}s/${this.malId}/related`,
      type: 'GET',
    });

    return {
      meta,
      roles,
      related,
    };
  }

  private title(data) {
    this.meta.title = helper.title(data.meta.russian, data.meta.name, true);
  }

  private description(data) {
    if (data.meta.description_html) this.meta.description = data.meta.description_html;
  }

  private image(data) {
    this.meta.image = data.meta.image.original ? `${helper.domain}${data.meta.image.original}` : '';
    this.meta.imageLarge = this.meta.image;
  }

  private alternativeTitle(data) {
    this.meta.alternativeTitle = [
      ...(data.meta.english || []),
      ...(data.meta.japanese || []),
      ...(data.meta.synonyms || []),
    ].filter(el => el);
  }

  private characters(data) {
    const chars = data.roles;
    if (chars) {
      chars.forEach(i => {
        if (i.character && i.character.id) {
          this.meta.characters.push({
            img: i.character.image.original ? `${helper.domain}${i.character.image.original}` : '',
            name: helper.title(i.character.russian, i.character.name),
            subtext: helper.title(
              i.roles_russian.length ? i.roles_russian[0] : null,
              i.roles.length ? i.roles[0] : null,
            ),
            url: `${helper.domain}${i.character.url}`,
          });
        }

        this.meta.characters.sort((a, b) => {
          const roles = ['Main', 'Supporting'];
          const aRole = a.subtext ? roles.indexOf(a.subtext) : 2;
          const bRole = b.subtext ? roles.indexOf(b.subtext) : 2;
          return aRole - bRole;
        });

        this.meta.characters = this.meta.characters.slice(0, 10);
      });
    }
  }

  private statistics(data) {
    if (data.meta.score)
      this.meta.statistics.push({
        title: api.storage.lang('overview_sidebar_Score'),
        body: data.meta.score,
      });

    if (data.meta.rates_statuses_stats) {
      const watching = data.meta.rates_statuses_stats.find(el =>
        ['Watching', 'Смотрю'].includes(el.name),
      );
      const planned = data.meta.rates_statuses_stats.find(el =>
        ['Planned to Read', 'Planned to Watch', 'Запланировано'].includes(el.name),
      );
      const reading = data.meta.rates_statuses_stats.find(el =>
        ['Reading', 'Читаю'].includes(el.name),
      );
      const dropped = data.meta.rates_statuses_stats.find(el =>
        ['Dropped', 'Брошено'].includes(el.name),
      );
      const hold = data.meta.rates_statuses_stats.find(el =>
        ['On Hold', 'Отложено'].includes(el.name),
      );
      const completed = data.meta.rates_statuses_stats.find(el =>
        ['Completed', 'Просмотрено', 'Прочитано'].includes(el.name),
      );

      if (watching && watching.value) {
        this.meta.statistics.push({
          title: `${api.storage.lang('UI_Status_watching_anime')}:`,
          body: watching.value,
        });
      }
      if (planned && planned.value) {
        this.meta.statistics.push({
          title: `${this.type === 'manga' ? api.storage.lang('UI_Status_planTo_manga') : api.storage.lang('UI_Status_planTo_anime')}:`,
          body: planned.value,
        });
      }
      if (reading && reading.value) {
        this.meta.statistics.push({
          title: `${api.storage.lang('UI_Status_watching_manga')}:`,
          body: reading.value,
        });
      }
      if (dropped && dropped.value) {
        this.meta.statistics.push({
          title: `${api.storage.lang('UI_Status_Dropped')}:`,
          body: dropped.value,
        });
      }
      if (hold && hold.value) {
        this.meta.statistics.push({
          title: `${api.storage.lang('UI_Status_OnHold')}:`,
          body: hold.value,
        });
      }
      if (completed && completed.value) {
        this.meta.statistics.push({
          title: `${api.storage.lang('UI_Status_Completed')}:`,
          body: completed.value,
        });
      }
    }
  }

  private info(data) {
    if (data.meta.kind)
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Format'),
        body: [{ text: utils.upperCaseFirstLetter(data.meta.kind) }],
      });

    if (data.meta.duration)
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Duration'),
        body: [
          {
            text: `${new IntlDuration().setRelativeTime(data.meta.duration, 'minutes', 'Duration').getRelativeText()}`,
          },
        ],
      });

    if (data.meta.status)
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Status'),
        body: [{ text: utils.upperCaseFirstLetter(data.meta.status) }],
      });

    if (data.meta.aired_on)
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Start_Date'),
        body: [{ text: `${new IntlDateTime(data.meta.aired_on).getDateTimeText()}` }],
      });

    if (data.meta.released_on)
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_End_Date'),
        body: [{ text: `${new IntlDateTime(data.meta.released_on).getDateTimeText()}` }],
      });

    if (this.type === 'manga' && data.roles && data.roles.length) {
      const authors: (typeof this.meta.info)[0]['body'] = [];
      data.roles.forEach(i => {
        if (i.person && i.person.id) {
          let text = helper.title(i.person.russian, i.person.name);
          if (i.roles && i.roles.length) text += ` (${i.roles[0]})`;

          authors.push({
            text,
            url: `${helper.domain}${i.person.url}`,
          });
        }
      });

      if (authors.length)
        this.meta.info.push({
          title: `${api.storage.lang('overview_sidebar_Authors')}`,
          body: authors,
        });
    }

    if (data.meta.studios && data.meta.studios.length) {
      const studios: (typeof this.meta.info)[0]['body'] = [];
      data.meta.studios.forEach(i => {
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

    const genres: (typeof this.meta.info)[0]['body'] = [];
    data.meta.genres.forEach(i => {
      genres.push({
        text: i.name,
        url: `https://shikimori.one/${this.type}s/genre/${i.id}`,
      });
    });
    if (genres.length)
      this.meta.info.push({
        title: api.storage.lang('overview_sidebar_Genres'),
        body: genres,
      });
  }

  private related(data) {
    const links: typeof this.meta.related = [];

    data.related.forEach(element => {
      if (!links[element.relation]) {
        links[element.relation] = {
          type: helper.title(element.relation_russian, element.relation),
          links: [],
        };
      }

      let meta = element.manga;
      let type: 'anime' | 'manga' = 'manga';
      if (element.anime && element.anime.id) {
        meta = element.anime;
        type = 'anime';
      }

      links[element.relation].links.push({
        url: `${helper.domain}${meta.url}`,
        title: helper.title(meta.russian, meta.name),
        type,
        id: meta.id,
      });
    });

    this.meta.related = Object.values(links);
  }

  protected apiCall = helper.apiCall;
}
