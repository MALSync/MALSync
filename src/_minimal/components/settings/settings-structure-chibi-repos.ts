import SettingsChibiRepos from './settings-chibi-repos.vue';
import { ConfObj } from '../../../_provider/definitions';

export const chibiRepos: ConfObj[] = [
  {
    key: 'chibiRepos',
    system: 'webextension',
    title: 'chibiRepos',
    component: SettingsChibiRepos,
  },
];
