import { pageInterface } from '../pageInterface';
import { simpleSyncPage } from './simpleSyncPage';

export interface simplePageInterface extends Omit<pageInterface, 'init'> {
  style?: string;
  init: (page: simpleSyncPage) => void;
}
