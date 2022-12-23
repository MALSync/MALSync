import { ref } from 'vue';
import { createApp } from '../utils/Vue';
import minimalApp from './minimalApp.vue';
import { status } from '../_provider/definitions';
import { router } from './router';
import { Progress } from '../utils/progress';
import { urlToSlug } from '../utils/slugs';

export class Minimal {
  private minimalVue;

  private fillState = ref(null);

  constructor(
    public minimal,
    closeFunction = () => window.close(),
    fullscreenFunction: null | Function = null,
  ) {
    if (document.body.hasAttribute('hash')) {
      document.location.hash = document.body.getAttribute('hash')!;
    }
    this.minimal.find('body').append(j.html('<div id="minimalApp"></div>'));
    this.minimalVue = createApp(minimalApp, this.minimal.find('#minimalApp').get(0), {
      use: vue => {
        vue.use(router());
        vue.provide('fill', this.fillState);
        vue.provide('closeFunction', closeFunction);
        vue.provide('fullscreenFunction', fullscreenFunction);
        vue.provide('rootHtml', this.minimal.get(0));
        vue.provide('rootBody', this.minimal.get(0).ownerDocument.body);
        vue.provide('rootDocument', this.minimal.get(0).ownerDocument);
        vue.provide('rootWindow', this.minimal.get(0).ownerDocument.defaultView);
      },
    });
  }

  fill(data, home: boolean) {
    if (data.url && home) {
      const slugObj = urlToSlug(data.url);
      if (slugObj && slugObj.path) {
        router().push({ name: 'Overview', params: slugObj.path });
        return;
      }
    }
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
