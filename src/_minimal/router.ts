import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Bookmarks from './views/bookmarks.vue';
import Overview from './views/overview.vue';
import Settings from './views/settings.vue';
import Search from './views/search.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/anime',
  },
  {
    path: '/:type',
    name: 'Bookmarks',
    component: Bookmarks,
    props: {
      type: String,
    },
  },
  {
    path: '/:type/:slug',
    name: 'Overview',
    component: Overview,
  },
  {
    path: '/settings/:path?',
    name: 'Settings',
    component: Settings,
  },
  {
    path: '/search',
    redirect: '/search/anime',
  },
  {
    path: '/search/:type',
    name: 'Search',
    component: Search,
    props: {
      type: String,
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
