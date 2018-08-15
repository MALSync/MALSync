export function urlPart(url:string, part:number){
  return url.split("/")[part].split("?")[0];
}
