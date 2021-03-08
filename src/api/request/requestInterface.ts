import { xhrResponseI, sendMessageI, notification } from '../messageInterface';

export interface requestInterface {
  xhr(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string | { url: string; data?: any; headers?: any },
  ): Promise<xhrResponseI>;

  sendMessage?(message: sendMessageI): Promise<any>;

  notification(options: notification): void;
}
