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
*/

function titleSearch(url, title) {
  return url
    .replace('{searchterm}', encodeURIComponent(title.trim().toLowerCase()))
    .replace('{searchtermPlus}', encodeURIComponent(title.trim().toLowerCase()).replace(/%20/g, '+'))
    .replace('{searchtermRaw}', title);
}

async function fillFromApi(combined, type, id) {
  const mal = await utils.getMalToKissApi(type, id);

  return combined.map(el => {
    if (el.database && mal[el.database]) {
      el.databaseLinks = mal[el.database];
    }
    return el;
  });
}

function simplifyObject(combined, type, searchterm): Quicklink[] {
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
          url: titleSearch(el.search[type], searchterm),
        });
      }

      return {
        name: el.name,
        domain: el.domain,
        links,
      };
    });
}

export async function activeLinks(type: 'anime' | 'manga', id: any, searchterm: string): Promise<Quicklink[]> {
  const links = api.settings.get('quicklinks');

  let combined = [
    ...links.filter(el => typeof el === 'object' && el),
    ...quicklinks.filter(el => links.includes(el.name)),
  ];

  if (id) {
    combined = await fillFromApi(combined, type, id);
  }

  return simplifyObject(combined, type, searchterm);
}
