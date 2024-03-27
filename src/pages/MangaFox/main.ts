import { getInter } from '../MangaHere/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'MangaFox';
clone.domain = ['https://fanfox.net', 'https://mangafox.la'];

export const MangaFox: pageInterface = clone;
