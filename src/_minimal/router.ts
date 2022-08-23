import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Bookmarks from './views/bookmarks.vue';
import Overview from './views/overview.vue';
import Settings from './views/settings.vue';
import Search from './views/search.vue';
import { getUrlObj, setUrlObj } from './utils/state';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: () => {
      const urlObj = getUrlObj();
      if (urlObj && urlObj.url) return urlObj.url;
      return '/book/anime/1';
    }
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

router.afterEach((to, from, failure) => {
  if (!failure) setUrlObj(to.path);
});

export default router;
