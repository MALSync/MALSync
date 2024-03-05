// eslint-disable-next-line import/no-unresolved
export const quicklinks = require('./quicklinks.json');

type QuicklinkGroup = 'home' | 'search' | 'link';

interface Links {
  name: string;
  url: string;
  fn?: (searchTerm: string) => string;
}

export interface Quicklink {
  name: string;
  domain: string;
  group: QuicklinkGroup;
  links: Links[];
}

/*
  {searchterm} => 'no%20game%20no%20life'
  {searchtermPlus} => 'no+game+no+life'
  {searchtermMinus} => 'no-game-no-life'
  {searchtermUnderscore} => 'no_game_no_life'
  {searchtermRaw} => 'no game no life'
  {cacheId} => '143'
*/

export function titleSearch(url, title, id) {
  return searchSyntax(
    url
      .replace('{searchtermPlus}', '{searchterm(+)}')
      .replace('{searchtermMinus}', '{searchterm(-)}')
      .replace('{searchtermUnderscore}', '{searchterm(_)}')
      .replace('{searchtermRaw}', '{searchterm[noEncode,noLowercase]}')
      .replace('{cacheId}', id),
    title,
  );
}

/*
  {searchterm(<whitespaceReplacement>)[<options>]}
  Options:
    noEncode -> Dont encode characters
    noSpecial -> Remove special characters
    specialReplace -> Replace special characters with a <whitespaceReplacement>
    noLowercase -> Dont lowercase everything
*/

type option = 'noEncode' | 'noSpecial' | 'noLowercase' | 'specialReplace';

export function searchSyntax(url, title) {
  let resTitle = title.replace(/^\[l\]/i, '').trim();
  let options: option[] = [];

  const found = url.match(/{searchterm(\(.\))?(\[[^[\]]*\])?}/);

  if (!found) return url;

  const [res, space, tempOptions] = found;

  if (tempOptions) {
    options = tempOptions.substring(1, tempOptions.length - 1).split(',');
  }

  if (!options.includes('noLowercase')) {
    resTitle = resTitle.toLowerCase();
  }

  if (options.includes('noSpecial')) {
    resTitle = resTitle
      .replace(/[^a-zA-Z\d ]/g, '')
      .replace(/ +/g, ' ')
      .trim();
  } else if (options.includes('specialReplace')) {
    resTitle = resTitle
      .replace(/[^a-zA-Z\d ]/g, ' ')
      .replace(/ +/g, ' ')
      .trim();
  }

  if (!options.includes('noEncode')) {
    resTitle = encodeURIComponent(resTitle);
  } else {
    resTitle = resTitle.replace(/\//g, ' ');
  }

  if (space) {
    resTitle = resTitle.replace(/(%20| )/g, space[1]);
  }

  return url.replace(res, resTitle);
}

async function fillFromApi(combined, type, id) {
  const mal = await getMalToKissApi(type, id);

  return combined.map(el => {
    if (el.database && mal[el.database]) {
      el.databaseLinks = mal[el.database];
    }
    return el;
  });
}

function simplifyObject(combined, type, title, id): Quicklink[] {
  return combined
    .filter(el => el.search && el.search[type])
    .map(el => {
      const links: Links[] = [];
      let quickGroup: QuicklinkGroup;

      if (el.databaseLinks) {
        quickGroup = 'link';
        Object.values(el.databaseLinks).forEach((db: any) => {
          links.push({
            name: db.title,
            url: db.url,
          });
        });
      } else if (el.search[type] === 'home') {
        quickGroup = 'home';
        links.push({
          name: 'Homepage',
          url: el.domain,
        });
      } else {
        quickGroup = 'search';
        links.push({
          name: 'Quicksearch',
          url: titleSearch(el.search[type], title, id),
          fn: searchTerm => titleSearch(el.search[type], searchTerm, id),
        });
      }

      return {
        name: el.name,
        domain: el.domain,
        group: quickGroup,
        links,
      };
    });
}

export async function getMalToKissApi(type, id) {
  const url = `https://api.malsync.moe/mal/${type}/${id}`;
  return api.request.xhr('GET', url).then(async response => {
    con.log('malSync response', response);
    if (response.status === 400) {
      return {};
    }
    if (response.status === 200) {
      const data = JSON.parse(response.responseText);
      if (data && data.Sites) return data.Sites;
      return {};
    }
    throw new Error('malsync offline');
  });
}

export function combinedLinks() {
  const links = api.settings.get('quicklinks');
  const comb = links.map(el => optionToCombined(el)).filter(el => el);
  return JSON.parse(JSON.stringify(comb));
}

export function optionToCombined(link) {
  if (!link) return null;
  if (link.custom) return link;
  return quicklinks.find(el => el.name === link);
}

export async function activeLinks(
  type: 'anime' | 'manga',
  id: any,
  searchterm: string,
): Promise<Quicklink[]> {
  let combined = combinedLinks();

  if (id) {
    try {
      combined = await fillFromApi(combined, type, id);
    } catch (e) {
      con.m('API Problem').error(e);
    }
  }

  return simplifyObject(combined, type, searchterm, id);
}

export function removeOptionKey(options, key) {
  if (!key) return options;
  return options.filter(el => {
    if (!el || el === key || (typeof el === 'object' && el.name === key)) return false;
    return true;
  });
}

export function removeFromOptions(key) {
  const options = api.settings.get('quicklinks');
  api.settings.set('quicklinks', removeOptionKey(options, key));
}

export function getPages() {
  return quicklinks;
}
