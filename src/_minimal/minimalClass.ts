import { createApp } from '../utils/Vue';
import minimalApp from './minimalApp.vue';

export class Minimal {
  private minimalVue;

  constructor(public minimal) {
    this.minimal.find('body').append(j.html('<div id="minimalApp"></div>'));
    this.minimalVue = createApp(minimalApp, this.minimal.find('#minimalApp').get(0));
  }
}
