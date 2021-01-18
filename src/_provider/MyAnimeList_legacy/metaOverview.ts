import { MetaOverviewAbstract } from '../metaOverviewAbstract';
import { errorCode } from '../definitions';

export class MetaOverview extends MetaOverviewAbstract {
  constructor(url) {
    super(url);
    this.logger = this.logger.m('MAL');
    if (url.match(/myanimelist\.net\/(anime|manga)\/\d*/i)) {
      this.type = utils.urlPart(url, 3) === 'anime' ? 'anime' : 'manga';
      this.malId = Number(utils.urlPart(url, 4));
      return this;
    }
    throw this.errorObj(errorCode.UrlNotSuported, 'Url not supported');
  }

  protected readonly type;

  private readonly malId: number;

  async _init() {
    this.logger.log('Retrieve', this.type, `MAL: ${this.malId}`);

    const data = await this.getData();
    // this.logger.log('Data', data);

    this.title(data);
    this.description(data);
    this.image(data);
    this.alternativeTitle(data);
    this.characters(data);
    this.statistics(data);
    this.info(data);
    this.openingSongs(data);
    this.endingSongs(data);
    this.related(data);

    this.logger.log('Res', this.meta);
  }

  private async getData() {
    return api.request.xhr('GET', `https://myanimelist.net/${this.type}/${this.malId}`).then(response => {
      return response.responseText;
    });
  }

  private title(data) {
    let title = '';
    try {
      title = data
        .split('itemprop="name">')[1]
        .split('<')[0]
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    this.meta.title = $('<div>')
      .html(j.html(title))
      .text();
  }

  private description(data) {
    let description = '';
    try {
      description = data
        .split('itemprop="description">')[1]
        .split('</p')[0]
        .split('</span')[0];
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    this.meta.description = description;
  }

  private image(data) {
    let image = '';
    try {
      image = data
        .split('property="og:image"')[1]
        .split('content="')[1]
        .split('"')[0];
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    this.meta.image = image;
  }

  private alternativeTitle(data) {
    let altTitle: any[] = [];

    try {
      const tempHtml = j.$.parseHTML(`<div>${data.split('<h2>Alternative Titles</h2>')[1].split('<h2>')[0]}</div>`);
      altTitle = j
        .$(tempHtml)
        .find('.spaceit_pad')
        .toArray()
        .map(function(i) {
          return utils.getBaseText(j.$(i)).trim();
        });
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }

    this.meta.alternativeTitle = altTitle;
  }

  private characters(data) {
    const charArray: any[] = [];
    try {
      const characterBlock = data.split('detail-characters-list')[1].split('</h2>')[0];
      const charHtml = j.$.parseHTML(`<div class="detail-characters-list ${characterBlock}`);

      j.$.each(j.$(charHtml).find(':not(td) > table'), (index, value) => {
        const regexDimensions = /\/r\/\d*x\d*/g;
        let charImg = j
          .$(value)
          .find('img')
          .first()
          .attr('data-src');
        if (charImg && regexDimensions.test(charImg)) {
          charImg = charImg.replace(regexDimensions, '');
        } else {
          charImg = api.storage.assetUrl('questionmark.gif');
        }

        charImg = utils.handleMalImages(charImg);

        const charObjLink = j
          .$(value)
          .find('.borderClass .spaceit_pad')
          .first()
          .parent();

        charArray.push({
          img: charImg,
          name: charObjLink
            .find('a')
            .first()
            .text(),
          url: charObjLink
            .find('a')
            .first()
            .attr('href'),
          subtext: charObjLink
            .find('.spaceit_pad')
            .first()
            .text()
            .trim(),
        });
      });
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    this.meta.characters = charArray;
  }

  private statistics(data) {
    const stats: any[] = [];
    try {
      const statsBlock = data.split('<h2>Statistics</h2>')[1].split('<h2>')[0];
      // @ts-ignore
      const tempHtml = j.$.parseHTML(statsBlock);

      j.$.each(
        j
          .$(tempHtml)
          .filter('div')
          .slice(0, 5),
        function(index, value) {
          const title = j
            .$(value)
            .find('.dark_text')
            .text();
          const body =
            typeof j
              .$(value)
              .find('span[itemprop=ratingValue]')
              .height() !== 'undefined'
              ? j
                  .$(value)
                  .find('span[itemprop=ratingValue]')
                  .text()
              : j
                  .$(value)
                  .clone()
                  .children()
                  .remove()
                  .end()
                  .text();
          stats.push({
            title,
            body: body.trim(),
          });
        },
      );
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    this.meta.statistics = stats;
  }

  private info(data) {
    const html: any[] = [];
    try {
      const infoBlock = data.split('<h2>Information</h2>')[1].split('<h2>')[0];
      const infoData = j.$.parseHTML(infoBlock);
      j.$.each(j.$(infoData).filter('div'), (index, value) => {
        const title = j
          .$(value)
          .find('.dark_text')
          .text();
        j.$(value)
          .find('.dark_text')
          .remove();

        // @ts-ignore
        const aTags: { text: string; url: string; subtext?: string }[] = j
          .$(value)
          .find('a')
          .map((i, el) => {
            return {
              text: j
                .$(el)
                .text()
                .trim(),
              url: j.$(el).attr('href'),
            };
          });

        j.$(value)
          .find('a, span')
          .remove();

        const textTags = j
          .$(value)
          .text()
          .split(',');

        let body: any[] = [];

        if (!aTags.length) {
          body = textTags.map(el => {
            return {
              text: el,
            };
          });
        } else if (aTags.length === textTags.length) {
          body = aTags.map((i, el) => {
            // @ts-ignore
            el.subtext = textTags[i].trim();
            return el;
          });
        } else {
          body = aTags;
        }

        html.push({
          title: title.trim(),
          body,
        });
      });
      this.getExternalLinks(html, data);
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    this.meta.info = html;
  }

  getExternalLinks(html, data) {
    try {
      const infoBlock = `${data.split('<h2>External Links</h2>')[1].split('</div>')[0]}</div>`;
      const infoData = j.$.parseHTML(infoBlock);

      const body: any[] = [];
      j.$.each(j.$(infoData).find('a'), (index, value) => {
        body.push({
          text: j.$(value).text(),
          url: j.$(value).attr('href'),
        });
      });
      if (body.length) {
        html.push({
          title: 'External Links',
          body,
        });
      }
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
  }

  openingSongs(data) {
    const openingSongs: string[] = [];

    try {
      const openingBlock = `<div>${data.split('opnening">')[1].split('</div>')[0]}</div>`;
      const openingData = j.$.parseHTML(openingBlock);

      j.$(openingData)
        .find('.theme-song')
        .each((_, el) => {
          openingSongs.push($(el).text());
        });
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }

    this.meta.openingSongs = openingSongs;
  }

  endingSongs(data) {
    const endingSongs: string[] = [];

    try {
      const endingBlock = `<div>${data.split(' ending">')[1].split('</div>')[0]}</div>`;
      const endingData = j.$.parseHTML(endingBlock);

      j.$(endingData)
        .find('.theme-song')
        .each((_, el) => {
          endingSongs.push($(el).text());
        });
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }

    this.meta.endingSongs = endingSongs;
  }

  private related(data) {
    const el: { type: string; links: any[] }[] = [];
    try {
      const relatedBlock = data
        .split('Related ')[1]
        .split('</h2>')[1]
        .split('<h2>')[0];
      const related = j.$.parseHTML(relatedBlock);
      j.$.each(
        j
          .$(related)
          .filter('table')
          .find('tr'),
        function(index, value) {
          const links: { url: string; title: string; statusTag: string }[] = [];
          j.$(value)
            .find('.borderClass')
            .last()
            .find('a')
            .each(function(indexB, valueB) {
              links.push({
                url: j.$(valueB).attr('href') || '',
                title: j.$(valueB).text(),
                statusTag: '',
              });
            });
          el.push({
            type: j
              .$(value)
              .find('.borderClass')
              .first()
              .text(),
            links,
          });
        },
      );
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    this.meta.related = el;
  }
}
