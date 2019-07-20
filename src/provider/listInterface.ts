export interface listElement {
  uid: number,
  malId: number,
  cacheKey: any,
  type: "anime"|"manga"
  title: string,
  url: string,
  watchedEp: number,
  totalEp: number,
  status: number,
  score: number,
  image: string,
  tags: string,
  airingState: number,
}

export interface metadataInterface {
  init(),
  getTitle: () => string,
  getDescription: () => string,
  getImage: () => string,
  getAltTitle: () => string[],
  getCharacters: () => {img: string, html: string}[],
  getStatistics: () => {title: string, body: string}[],
  getInfo: () => {title: string, body: string}[],
  getOpeningSongs: () => string[],
  getEndingSongs: () => string[],
  getRelated: () => {type: string, links: {url: string, title: string, statusTag: string}[]}[]
}

export type searchInterface = (
  keyword: string,
  type: "anime"|"manga",
  options?: {},
  sync?: boolean
) => Promise<[{
  id:number,
  name:string,
  url:string,
  malUrl: () => Promise<string|null>,
  image:string,
  media_type:string,
  score: string,
  year: string
}]>;
