export interface listElement {
  uid: number,
  malId: number,
  type: "anime"|"manga"
  title: string,
  url: string,
  watchedEp: number,
  totalEp: number,
  image: string,
  tags: string,
  airingState: number,
}
