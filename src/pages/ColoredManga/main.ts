import { pageInterface } from '../pageInterface';
import { getInter } from '../Isekaiscan/main';

const clone = getInter();

clone.name = 'ColoredManga';
clone.domain = 'https://coloredmanga.com';
clone.isSyncPage = function(url) {
    return Boolean(
      utils.urlPart(url, 3) === 'mangas' &&
        (utils.urlPart(url, 5) &&
        utils.urlPart(url, 5).startsWith('chapter-') ||
        utils.urlPart(url, 6) &&
        utils.urlPart(url, 6).startsWith('chapter-'))
    );
}

clone.isOverviewPage = function(url) {
  return Boolean(utils.urlPart(url, 3) === 'mangas' && !utils.urlPart(url, 5));
}

clone.sync.getEpisode = function (url) {
  let episodeNum = '0';

  const episodePart = utils.urlPart(url, 5);
  const episodePart2 = utils.urlPart(url, 6);

  const temp = episodePart.match(/chapter-\d+/gim);
  const temp2 = episodePart2.match(/chapter-\d+/gim);

  if (temp && temp.length) {
    episodeNum = temp[0];
  }
  else if (temp2 && temp2.length) {
    episodeNum = temp2[0];
  }

  return Number(episodeNum.replace(/\D+/g, ''));
}

clone.sync.getVolume = function(url){
  let volume = '0';

  const volumePart = utils.urlPart(url, 5);

  const temp = volumePart.match(/volume-\d+/gim);

  if (temp && temp.length) {
    volume = temp[0];
  }

  return Number(volume.replace(/\D+/g, ''));
}

clone.sync.readerConfig = [
  {
    current: {
      selector: '.wp-manga-chapter-img',
      mode: 'countAbove',
    },
    total: {
      selector: '.wp-manga-chapter-img',
      mode: 'count',
    },
  }
]

export const ColoredManga: pageInterface = clone;
