export class animeType{
  private vars;

  constructor(private url){

  }

  init(){
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  overview(){
    return new Promise((resolve, reject) => {
      resolve('test321');
    });
  }
}
