import {pageInterface} from "./../pageInterface";

export const Kissanime: pageInterface = {
    domain: 'http://kissanime.ru',
    include: ['/^https?:\/\/kissanime\.ru\/(Anime\/|BookmarkList)/', '/^https?:\/\/kissanime\.to\/(Anime\/|BookmarkList)/'],
};
