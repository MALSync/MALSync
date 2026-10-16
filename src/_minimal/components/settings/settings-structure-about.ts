import { defineAsyncComponent } from 'vue';
import { ConfObj } from '../../../_provider/definitions';
import SettingsGroup from './settings-group.vue';

export const about: ConfObj[] = [
  {
    key: 'aboutPage',
    title: 'About',
    component: defineAsyncComponent(() => import('./settings-about.vue')),
  },
];
