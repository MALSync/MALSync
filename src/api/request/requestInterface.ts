import { xhrResponseI, sendMessageI, notification } from '../messageInterface';

export interface RequestInterface {
  xhr(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string | { url: string; data?: any; headers?: Record<string, string | undefined> },
    retry?: number,
  ): Promise<xhrResponseI>;

  sendMessage?(message: sendMessageI): Promise<any>;

  notification(options: notification): void;

  database(call: string, param: object): Promise<any>;
}
