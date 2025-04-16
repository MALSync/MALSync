import { getInter } from '../MangaHere/main';
import { PageInterface } from '../pageInterface';

const clone = getInter();

clone.name = 'MangaFox';
clone.domain = ['https://fanfox.net', 'https://mangafox.la'];

export const MangaFox: PageInterface = clone;
