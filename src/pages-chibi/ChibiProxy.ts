import { doesUrlMatchPatterns } from 'webext-patterns';
import type { ChibiJson } from '../chibiScript/ChibiGenerator';
import { ChibiConsumer } from '../chibiScript/ChibiConsumer';
import { pageInterface } from '../pages/pageInterface';
import { ChibiListRepository } from './loader/ChibiListRepository';

function getConsumer(code: ChibiJson<any>) {
  return new ChibiConsumer(code);
}

function getUrlConsumer(code: ChibiJson<any>, url: string) {
  const consumer = getConsumer(code);
  consumer.addVariable('url', url);
  return consumer;
}

export const Chibi = async (): Promise<pageInterface> => {
  const repo = await new ChibiListRepository([chrome.runtime.getURL('chibi')]).init();
  const allPages = repo.getList();

  const currentUrl = window.location.href;
  const matchingPages = Object.values(allPages).filter(el => {
    if (!el.urls.match || !el.urls.match.length) return false;
    return doesUrlMatchPatterns(currentUrl, ...el.urls.match);
  });

  if (matchingPages.length === 0) {
    throw new Error('No matching page found');
  }
  if (matchingPages.length > 1) {
    con.error('Multiple matching pages found', matchingPages);
  }

  const currentPage = await repo.getPage(matchingPages[0].key);

  return {
    name: currentPage.name,
    domain: currentPage.domain,
    languages: currentPage.languages,
    type: currentPage.type,
    isSyncPage(url) {
      const consumer = getUrlConsumer(currentPage.sync.isSyncPage, url);
      return consumer.run();
    },
    sync: {
      getTitle(url) {
        return 'Chibi';
      },
      getIdentifier(url) {
        return 'chibi';
      },
      getOverviewUrl(url) {
        return url;
      },
      getEpisode(url) {
        return 2;
      },
    },
    init(page) {
      alert('Chibi');
      page.handlePage();
    },
  };
};
