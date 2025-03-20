import { PageListJsonInterface } from '../pageInterface';
import { pages } from '../pages';
import { getVersionHashes } from './chibiHelper';

export default (): PageListJsonInterface => {
  const definitions: PageListJsonInterface = {
    pages: {},
  };
  const hashes = getVersionHashes();

  Object.keys(pages).forEach(key => {
    const pageObj = pages[key];
    definitions.pages[key] = {
      key,
      name: pageObj.name,
      version: hashes[key],
      minimumVersion: pageObj.minimumVersion || undefined,
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
