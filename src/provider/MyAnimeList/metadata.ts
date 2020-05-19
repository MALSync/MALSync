import { metadataInterface, searchInterface } from './../listInterface';

export class metadata implements metadataInterface {
  private xhr = '';

  constructor(public malUrl: string) {
    return this;
  }

  init() {
    return api.request.xhr('GET', this.malUrl).then(response => {
      this.xhr = response.responseText;
      return this;
    });
  }

  getTitle() {
    let title = '';
    try {
      title = this.xhr.split('itemprop="name">')[1].split('<')[0];
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return title;
  }

  getDescription() {
    let description = '';
    try {
      description = this.xhr
        .split('itemprop="description">')[1]
        .split('</span')[0];
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return description;
  }

  getImage() {
    let image = '';
    try {
      image = this.xhr
        .split('property="og:image"')[1]
        .split('content="')[1]
        .split('"')[0];
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return image;
  }

  getAltTitle() {
    let altTitle: any[] = [];

    try {
      const tempHtml = j.$.parseHTML(
        `<div>${
          this.xhr.split('<h2>Alternative Titles</h2>')[1].split('<h2>')[0]
        }</div>`,
      );
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

    return altTitle;
  }

  getCharacters() {
    const charArray: any[] = [];
    try {
      const characterBlock = this.xhr
        .split('detail-characters-list')[1]
        .split('</h2>')[0];
      const charHtml = j.$.parseHTML(
        `<div class="detail-characters-list ${characterBlock}`,
      );
      let charFound = 0;

      j.$.each(j.$(charHtml).find(':not(td) > table'), (index, value) => {
        if (!index) charFound = 1;
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

        charArray.push({
          img: charImg,
          html: j
            .$(value)
            .find('.borderClass .spaceit_pad')
            .first()
            .parent()
            .html(),
        });
      });
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return charArray;
  }

  getStatistics() {
    const stats: any[] = [];
    try {
      const statsBlock = this.xhr
        .split('<h2>Statistics</h2>')[1]
        .split('<h2>')[0];
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
            j
              .$(value)
              .find('span[itemprop=ratingValue]')
              .height() != null
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
    return stats;
  }

  getInfo() {
    const html: any[] = [];
    try {
      const infoBlock = this.xhr
        .split('<h2>Information</h2>')[1]
        .split('<h2>')[0];
      const infoData = j.$.parseHTML(infoBlock);
      j.$.each(j.$(infoData).filter('div'), (index, value) => {
        const title = j
          .$(value)
          .find('.dark_text')
          .text();
        j.$(value)
          .find('.dark_text')
          .remove();
        html.push({
          title: title.trim(),
          body: j
            .$(value)
            .html()
            .trim(),
        });
      });
      this.getExternalLinks(html);
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return html;
  }

  getExternalLinks(html) {
    try {
      const infoBlock = `${
        this.xhr.split('<h2>External Links</h2>')[1].split('</div>')[0]
      }</div>`;
      const infoData = j.$.parseHTML(infoBlock);

      let body = '';
      j.$.each(j.$(infoData).find('a'), (index, value) => {
        if (index) body += ', ';
        body += `<a href="${j.$(value).attr('href')}">${j.$(value).text()}</a>`;
      });
      if (body !== '') {
        html.push({
          title: 'External Links',
          body: body,
        });
      }
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
  }

  getOpeningSongs() {
    const openingSongs: string[] = [];

    try {
      const openingBlock = `<div>${
        this.xhr.split('opnening">')[1].split('</div>')[0]
      }</div>`;
      const openingData = j.$.parseHTML(openingBlock);

      j.$(openingData)
        .find('.theme-song')
        .each((_, el) => {
          openingSongs.push($(el).text());
        });
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }

    return openingSongs;
  }

  getEndingSongs() {
    const endingSongs: string[] = [];

    try {
      const endingBlock = `<div>${
        this.xhr.split(' ending">')[1].split('</div>')[0]
      }</div>`;
      const endingData = j.$.parseHTML(endingBlock);

      j.$(endingData)
        .find('.theme-song')
        .each((_, el) => {
          endingSongs.push($(el).text());
        });
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }

    return endingSongs;
  }

  getRelated() {
    const html = '';
    const el: { type: string; links: any[] }[] = [];
    try {
      const relatedBlock = this.xhr
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
            .each(function(index, value) {
              links.push({
                url: j.$(value).attr('href') || '',
                title: j.$(value).text(),
                statusTag: '',
              });
            });
          el.push({
            type: j
              .$(value)
              .find('.borderClass')
              .first()
              .text(),
            links: links,
          });
        },
      );
    } catch (e) {
      console.log('[iframeOverview] Error:', e);
    }
    return el;
  }
}

export const search: searchInterface = async function(
  keyword,
  type: 'anime' | 'manga',
  options = {},
  sync = false,
) {
  const response = await api.request.xhr(
    'GET',
    `https://myanimelist.net/search/prefix.json?type=${type}&keyword=${keyword}&v=1`,
  );

  const searchResults = JSON.parse(response.responseText);
  const items = searchResults.categories[0].items;

  return items.map(item => ({
    id: item.id,
    name: item.name,
    altNames: [],
    url: item.url,
    malUrl: () => {
      return item.url;
    },
    image: item.image_url,
    media_type: item.payload.media_type,
    isNovel: item.payload.media_type === 'Novel',
    score: item.payload.score,
    year: item.payload.start_year,
  }));
};
