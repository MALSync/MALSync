import { getInter } from '../MangaHere/main';
import { pageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'MangaFox';
clone.domain = ['http://fanfox.net', 'http://mangafox.la'];

export const MangaFox: pageInterface = clone;
