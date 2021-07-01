// eslint-disable-next-line import/no-unresolved
const quicklinks = require('./quicklinks.json');

interface Links {
  name: string;
  url: string;
}

export interface Quicklink {
  name: string;
  domain: string;
  links: Links[];
}

/*
  {searchterm} => 'no%20game%20no%20life'
  {searchtermPlus} => 'no+game+no+life'
  {searchtermRaw} => 'no game no life'
  {cacheId} => '143'
*/

function titleSearch(url, title, id) {
  return url
    .replace('{searchterm}', encodeURIComponent(title.trim().toLowerCase()))
    .replace('{searchtermPlus}', encodeURIComponent(title.trim().toLowerCase()).replace(/%20/g, '+'))
    .replace('{searchtermRaw}', title.replace(/\//g, ' '))
    .replace('{cacheId}', id);
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

function simplifyObject(combined, type, searchterm, id): Quicklink[] {
  return combined
    .filter(el => el.search && el.search[type])
    .map(el => {
      const links: Links[] = [];

      if (el.databaseLinks) {
        Object.values(el.databaseLinks).forEach((db: any) => {
          links.push({
            name: db.title,
            url: db.url,
          });
        });
      } else if (el.search[type] === 'home') {
        links.push({
          name: 'Homepage',
          url: el.domain,
        });
      } else {
        links.push({
          name: 'Quicksearch',
          url: titleSearch(el.search[type], searchterm, id),
        });
      }

      return {
        name: el.name,
        domain: el.domain,
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
  const comb = [
    ...links.filter(el => typeof el === 'object' && el),
    ...quicklinks.filter(el => links.includes(el.name)),
  ];
  return JSON.parse(JSON.stringify(comb));
}

export async function activeLinks(type: 'anime' | 'manga', id: any, searchterm: string): Promise<Quicklink[]> {
  let combined = combinedLinks();

  if (id) {
    combined = await fillFromApi(combined, type, id);
  }

  return simplifyObject(combined, type, searchterm, id);
}

export function removeOptionKey(options, key) {
  if (!key) return options;
  return options.filter(el => {
    if (el === key || (typeof el === 'object' && el.name === key)) return false;
    return true;
  });
}

export function removeFromOptions(key) {
  const options = api.settings.get('quicklinks');
  api.settings.set('quicklinks', removeOptionKey(options, key));
}
