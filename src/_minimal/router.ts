import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Bookmarks from './views/bookmarks.vue';
import Overview from './views/overview.vue';
import Settings from './views/settings.vue';
import Search from './views/search.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/book/anime/1',
  },
  {
    path: '/book/:type/:state',
    name: 'Bookmarks',
    component: Bookmarks,
    props: {
      type: String,
      state: Number,
    },
  },
  {
    path: '/:type/:slug',
    name: 'Overview',
    component: Overview,
  },
  {
    path: '/settings/:path*',
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
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

export default router;
