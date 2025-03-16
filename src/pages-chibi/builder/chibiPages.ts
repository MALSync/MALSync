import { $c } from '../../chibiScript/ChibiGenerator';
import { PageInterfaceCompiled } from '../pageInterface';
import { pages } from '../pages';
import { getVersionHashes } from './chibiHelper';

function compilePage(page: PageInterfaceCompiled): PageInterfaceCompiled {
  page.sync.isSyncPage = page.sync.isSyncPage($c) as any;
  return page;
}

export default (): { [key: string]: PageInterfaceCompiled } => {
  const definitions: { [key: string]: PageInterfaceCompiled } = {};
  const hashes = getVersionHashes();

  Object.keys(pages).forEach(key => {
    const pageObj = pages[key] as PageInterfaceCompiled;
    pageObj.version = hashes[key];
    definitions[key] = compilePage(pageObj);
  });

  return definitions;
};
