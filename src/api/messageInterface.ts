export interface xhrI {
  name: 'xhr';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string | { url: string; data?: any; headers?: any };
}
export interface xhrResponseI {
  finalUrl: string;
  responseText: string;
  status: number;
}

export interface videoTime {
  name: 'videoTime';
  item: { current: number; duration: number; paused: boolean };
}

export interface content {
  name: 'content';
  item: any;
}

export interface videoTimeSet {
  name: 'videoTimeSet';
  time?: number;
  timeAdd?: number;
  sender?: chrome.runtime.MessageSender;
}

export interface iframeDone {
  name: 'iframeDone';
  id: string;
  epList: any;
  len?: number;
  error?: any;
}

export interface minimalWindow {
  name: 'minimalWindow';
  height: number;
  width: number;
  left: number;
}

export interface emitter {
  name: 'emitter';
  item: any;
}

export interface notification {
  url: string;
  title: string;
  text: string;
  image?: string;
  sticky?: boolean;
}

export interface notificationMessage {
  name: 'notification';
  options: notification;
}

export type sendMessageI =
  | xhrI
  | iframeDone
  | videoTime
  | videoTimeSet
  | minimalWindow
  | content
  | emitter
  | notificationMessage;

export type responseMessageI = xhrResponseI;
