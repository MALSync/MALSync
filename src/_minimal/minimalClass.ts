import { ref } from 'vue';
import { createApp } from '../utils/Vue';
import minimalApp from './minimalApp.vue';
import { status } from '../_provider/definitions';
import router from './router';
import { Progress } from '../utils/progress';

export class Minimal {
  private minimalVue;

  private fillState = ref(null);

  constructor(public minimal) {
    if (document.body.hasAttribute('hash')) {
      document.location.hash = document.body.getAttribute('hash')!;
    }
    this.minimal.find('body').append(j.html('<div id="minimalApp"></div>'));
    this.minimalVue = createApp(minimalApp, this.minimal.find('#minimalApp').get(0), {
      use: vue => {
        vue.use(router);
        vue.provide('fill', this.fillState);
      },
    });
  }

  fill(data) {
    this.fillState.value = data;
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
  progress?: Progress;
};
