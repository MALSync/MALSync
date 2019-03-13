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

export interface iframeDone {
    name: 'iframeDone',
    id: string,
    epList: any
}

export type sendMessageI = xhrI | iframeDone | videoTime;

export type responseMessageI = xhrResponseI;
