import { localStore } from './localStore';

export class Cache {
  constructor(
    protected key: string,
    protected ttl: number,
    protected localStorage: boolean = true,
    protected refetchTtl: number = 0,
  ) {
    return this;
  }

  protected containsValue(value) {
    return typeof value !== 'undefined' && value !== null;
  }

  protected valueValid(value, ttl) {
    if (!value || !value.timestamp) return false;
    return new Date().getTime() < value.timestamp + ttl;
  }

  protected ttlValid(value) {
    return this.valueValid(value, this.ttl);
  }

  protected refetchTtlValid(value) {
    return this.valueValid(value, this.refetchTtl);
  }

  async hasValue() {
    const value = await this.getStorage();
    if (this.containsValue(value) && this.ttlValid(value)) {
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
      this.ttlValid(value)
    ) {
      return true;
    }
    return false;
  }

  async fullState() {
    const value = await this.getStorage();
    const hasValue = this.containsValue(value) && this.refetchTtlValid(value);
    const isValid = this.ttlValid(value);
    return {
      value,
      hasValue,
      isValid,
      refetch: hasValue && !isValid,
    };
  }

  async getValue() {
    const value = await this.getStorage();
    return value.data;
  }

  async setValue(result) {
    const save = { data: result, timestamp: new Date().getTime() };
    if (this.localStorage) {
      return localStore.setItem(this.key, JSON.stringify(save));
    }
    return api.storage.set(this.key, save);
  }

  async clearValue() {
    if (this.localStorage) {
      return localStore.removeItem(this.key);
    }
    return api.storage.remove(this.key);
  }

  protected async getStorage() {
    if (this.localStorage) {
      return JSON.parse(localStore.getItem(this.key)!);
    }
    return api.storage.get(this.key);
  }
}
