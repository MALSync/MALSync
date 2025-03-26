import { pageInterface } from '../pageInterface';

export interface simplePage {
  page: simplePageInterface;
  handlePage(curUrl?: string): Promise<void>;
  handleList(searchCurrent?: boolean, reTry?: number): Promise<void>;
  reset(): Promise<void>;
}

export interface simplePageInterface extends Omit<pageInterface, 'init'> {
  style?: string;
  init: (page: simplePage) => void;
}
