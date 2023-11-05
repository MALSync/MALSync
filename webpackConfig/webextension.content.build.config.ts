import { writeFileSync } from 'fs';
import { completePages } from './utils/pagesMain';
import { join } from 'path';

const res = completePages().map(page => {
  const domain = Array.isArray(page.main.domain) ? page.main.domain[0] : page.main.domain;
  let search = { anime: null, manga: null };
  if (!page.meta.search) {
    search[page.main.type] = 'home';
  } else if (typeof page.meta.search === 'object') {
    search = page.meta.search;
  } else {
    search[page.main.type] = page.meta.search;
  }

  let database = null;

  if (typeof page.meta.searchDatabase !== 'undefined') {
    if(page.meta.searchDatabase) database = page.meta.searchDatabase;
  } else if (page.main.database) {
    database = page.main.database;
  }

  return {
    key: page.key,
    name: page.main.name,
    domain,
    database,
    search,
  };
});

const descFile = join(__dirname, '../src/utils/quicklinks.json');
writeFileSync(descFile, JSON.stringify(res, null, 2), 'utf8');
