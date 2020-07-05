import { MangaHere } from '../MangaHere/main';
import { pageInterface } from '../pageInterface';

const clone = Object.create(MangaHere);

clone.name = 'MangaFox';
clone.domain = ['http://fanfox.net', 'http://mangafox.la'];

con.log(clone);

export const MangaFox: pageInterface = clone;
