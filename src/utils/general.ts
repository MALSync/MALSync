export function urlPart(url:string, part:number){
  try{
      return url.split("/")[part].split("?")[0];
    }catch(e){
      return undefined;
    }

}
