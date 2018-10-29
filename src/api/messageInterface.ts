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

export type sendMessageI = xhrI | {name: 'iframeDone', id: string};

export type responseMessageI = xhrResponseI;
