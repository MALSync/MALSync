import { createRouter, createWebHashHistory, Router, RouteRecordRaw } from 'vue-router';
import { getUrlObj, setUrlObj } from './utils/state';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: () => {
      const urlObj = getUrlObj();
      if (urlObj && urlObj.url) {
        if (
          document.documentElement.getAttribute('mode') !== 'popup' ||
          urlObj.timestamp + 1000 * 60 * 60 * 1 > Date.now()
        ) {
          return urlObj.url;
        }
      }
      return '/book/anime/1';
    },
  },
  {
    path: '/book/:type/:state',
    name: 'Bookmarks',
    component: () => import('./views/bookmarks.vue'),
    props: {
      type: String,
      state: Number,
    },
  },
  {
    path: '/:type/:slug',
    name: 'Overview',
    component: () => import('./views/overview.vue'),
    meta: {
      key: true,
    },
  },
  {
    path: '/settings/:path*',
    name: 'Settings',
    component: () => import('./views/settings.vue'),
  },
  {
    path: '/search',
    redirect: '/search/anime',
  },
  {
    path: '/search/:type',
    name: 'Search',
    component: () => import('./views/search.vue'),
    props: {
      type: String,
    },
  },
  {
    path: '/install',
    name: 'Install',
    component: () => import('./views/install.vue'),
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('./views/notFound.vue') },
];

let scrollUntilDebounce;
const scrollUntilTrue = (scrollPosition: number) => {
  let count = 0;
  scrollUntilDebounce = setInterval(() => {
    count++;
    if (count > 50 || scrollPosition - 50 < window.scrollY) {
      clearInterval(scrollUntilDebounce);
    } else {
      $(window).scrollTop(scrollPosition);
    }
  }, 100);
};

let tempRouter: Router | null = null;

export function router() {
  if (!tempRouter) {
    tempRouter = createRouter({
      history: createWebHashHistory(),
      routes,
      scrollBehavior(to, from, savedPosition) {
        clearInterval(scrollUntilDebounce);
        if (savedPosition) {
          if (to.name === 'Bookmarks' && savedPosition.top) {
            scrollUntilTrue(savedPosition.top);
          }
          return savedPosition;
        }
        return { top: 0 };
      },
    });

    tempRouter.afterEach((to, from, failure) => {
      if (!failure && to.name !== 'Install') setUrlObj(to.fullPath);
    });
  }
  return tempRouter;
}
