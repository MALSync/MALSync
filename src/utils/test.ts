import { PageInterface } from '../pages/pageInterface';

function checkDomain(url: string, domain: string) {
  const [partDomain] = utils.urlPart(domain, 2).replace('.com.br', '.br').split('.').slice(-2);
  return new RegExp(`(\\.|^|\\/)${partDomain}\\.`).test(url);
}

export function getPageConfig(url: string, pages: Record<string, PageInterface>) {
  for (const key in pages) {
    const page = pages[key];
    if (Array.isArray(page.domain)) {
      const singleDomain = page.domain.find(domain => checkDomain(url, domain));
      if (singleDomain) {
        page.domain = singleDomain;
        return page;
      }
    } else if (checkDomain(url, page.domain)) {
      return page;
    }
  }
  return null;
}
