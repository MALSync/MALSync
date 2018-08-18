import {xhrI, xhrResponseI, sendMessageI, responseMessageI} from "./../messageInterface";

export interface requestInterface {
  xhr(method: "GET"|"POST", url:string): Promise<xhrResponseI>|undefined;

  sendMessage?(message: sendMessageI): Promise<any>;
}
