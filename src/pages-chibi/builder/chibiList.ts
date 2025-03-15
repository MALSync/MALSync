import { PageListInterface } from '../pageInterface';
import { pages } from '../pages';
import { getVersionHashes } from './chibiHelper';

export default (): { [key: string]: PageListInterface } => {
  const definitions: { [key: string]: PageListInterface } = {};
  const hashes = getVersionHashes();

  Object.keys(pages).forEach(key => {
    const pageObj = pages[key];
    definitions[key] = {
      name: pageObj.name,
      version: hashes[key],
      type: pageObj.type,
      domain: pageObj.domain,
      languages: pageObj.languages,
      urls: pageObj.urls,
      search: pageObj.search,
      database: pageObj.database,
    };
  });

  return definitions;
};
