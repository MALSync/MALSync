export interface xhrI {
    name: "xhr",
    method: "GET" | "POST",
    url: string
}
export interface xhrResponseI {
    finalUrl: string,
    responseText: string,
    status: number
}

export type sendMessageI = xhrI;

export type responseMessageI = xhrResponseI;
