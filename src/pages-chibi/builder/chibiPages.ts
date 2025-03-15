import { PageInterfaceCompiled } from '../pageInterface';
import { pages } from '../pages';
import { getVersionHashes } from './chibiHelper';

export default (): { [key: string]: PageInterfaceCompiled } => {
  const definitions: { [key: string]: PageInterfaceCompiled } = {};
  const hashes = getVersionHashes();

  Object.keys(pages).forEach(key => {
    const pageObj = pages[key] as PageInterfaceCompiled;
    pageObj.version = hashes[key];
    definitions[key] = pageObj;
  });

  return definitions;
};
