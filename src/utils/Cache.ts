export class Cache {
  constructor(
    protected key: string,
    protected ttl: number,
    protected localStorage: boolean = true,
  ) {
    return this;
  }


  async hasValue() {
    var value = await this.getStorage();
    if(typeof value !== 'undefined' && value !== null && new Date().getTime() < value.timestamp){
      return true;
    }
    return false;
  }

  async getValue() {
    var value = await this.getStorage();
    return value.data;
  }

  async setValue(result) {
    var save = {data: result, timestamp: new Date().getTime() + this.ttl};
    if(this.localStorage) {
      return localStorage.setItem(this.key, JSON.stringify(save));
    }
    return api.storage.set(this.key, save)
  }

  protected async getStorage() {
    if(this.localStorage) {
      return JSON.parse(localStorage.getItem(this.key)!);
    }
    return api.storage.get(this.key);
  }
}

