import { simplePageInterface } from './simplePageInterface';

export interface simpleSyncPage {
  page: simplePageInterface;
  handlePage(curUrl?: string): Promise<void>;
  handleList(searchCurrent?: boolean, reTry?: number): Promise<void>;
  reset(): Promise<void>;
}
