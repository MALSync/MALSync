export interface apiInterface {
  set(key: string, value: string): Promise<void>;

  get(key: string): Promise<string|undefined>;

  remove(key: string): Promise<void>;
}
