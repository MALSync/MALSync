import { createApp } from '../utils/Vue';
import minimalApp from './minimalApp.vue';
import { status } from '../_provider/definitions';
import router from './router';

export class Minimal {
  private minimalVue;

  constructor(public minimal) {
    this.minimal.find('body').append(j.html('<div id="minimalApp"></div>'));
    this.minimalVue = createApp(minimalApp, this.minimal.find('#minimalApp').get(0), {
      use: vue => {
        vue.use(router);
      },
    });
  }
}

export type bookmarkItem = {
  title: string;
  type: 'anime' | 'manga';
  url: string;
  image: string;
  imageLarge: string;
  imageBanner?: string;
  status: status;
  score?: any;
  watchedEp: number;
  totalEp: number;
  streamUrl?: string;
  streamIcon?: string;
  progressEp?: number;
  progressText?: string;
};
