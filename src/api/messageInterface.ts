export interface xhrI {
    name: "xhr",
    method: "GET" | "POST",
    url: string|{url: string, data?:any, headers?:any},
}
export interface xhrResponseI {
    finalUrl: string,
    responseText: string,
    status: number
}

export interface videoTime {
    name: "videoTime",
    item: { current:number, duration:number}
}

export interface videoTimeSet {
    name: "videoTimeSet",
    time?:number,
    timeAdd?:number,
}

export interface iframeDone {
    name: 'iframeDone',
    id: string,
    epList: any
}

export interface minimalWindow {
    name: 'minimalWindow',
}

export type sendMessageI = xhrI | iframeDone | videoTime | videoTimeSet | minimalWindow;

export type responseMessageI = xhrResponseI;
