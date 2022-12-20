import BookmarksCards from '../components/bookmarks/bookmarks-cards.vue';
import BookmarksCardsFull from '../components/bookmarks/bookmarks-cards-full.vue';
import BookmarksList from '../components/bookmarks/bookmarks-list.vue';
import BookmarksTiles from '../components/bookmarks/bookmarks-tiles.vue';

const cards = {
  name: 'Cards',
  icon: 'view_agenda',
  component: BookmarksCards,
  width: 350,
  popupWidth: 350,
  transition: 20,
};
const fullCards = {
  name: 'Full Cards',
  icon: 'view_module',
  component: BookmarksCardsFull,
  width: 191,
  popupWidth: 160,
  transition: 20,
};
const list = {
  name: 'List',
  icon: 'view_list',
  component: BookmarksList,
  width: 0,
  popupWidth: 0,
  transition: 30,
};
const tiles = {
  name: 'Tiles',
  icon: 'apps',
  component: BookmarksTiles,
  width: 130,
  popupWidth: 130,
  transition: 15,
};

export const bookmarkFormats = [cards, fullCards, list, tiles];
export const searchFormats = [cards];
