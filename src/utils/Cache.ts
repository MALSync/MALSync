export class Cache {
  constructor(
    protected key: string,
    protected ttl: number,
    protected localStorage: boolean = true,
  ) {
    return this;
  }

  protected containsValue(value) {
    return typeof value !== 'undefined' && value !== null;
  }

  protected valueValid(value) {
    return new Date().getTime() < value.timestamp + this.ttl;
  }

  async hasValue() {
    const value = await this.getStorage();
    if (this.containsValue(value) && this.valueValid(value)) {
      return true;
    }
    return false;
  }

  async hasValueAndIsNotEmpty() {
    const value = await this.getStorage();
    if (
      this.containsValue(value) &&
      typeof value.data !== 'undefined' &&
      value.data !== null &&
      Object.keys(value.data).length &&
      this.valueValid(value)
    ) {
      return true;
    }
    return false;
  }

  async getValue() {
    const value = await this.getStorage();
    return value.data;
  }

  async setValue(result) {
    const save = { data: result, timestamp: new Date().getTime() };
    if (this.localStorage) {
      return localStorage.setItem(this.key, JSON.stringify(save));
    }
    return api.storage.set(this.key, save);
  }

  protected async getStorage() {
    if (this.localStorage) {
      return JSON.parse(localStorage.getItem(this.key)!);
    }
    return api.storage.get(this.key);
  }
}
