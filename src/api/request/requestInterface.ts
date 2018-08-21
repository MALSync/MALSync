import {xhrI, xhrResponseI, sendMessageI, responseMessageI} from "./../messageInterface";

export interface requestInterface {
  xhr(method: "GET"|"POST", url:string|{url: string, data?:any, headers?:any}): Promise<xhrResponseI>|undefined;

  sendMessage?(message: sendMessageI): Promise<any>;
}
