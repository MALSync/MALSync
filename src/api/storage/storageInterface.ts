export interface storageInterface {
  set(key: string, value: string): Promise<void>;

  get(key: string): Promise<string|undefined>;

  remove(key: string): Promise<void>;

  addStyle(css: string): Promise<void>;

  version(): string;

  assetUrl(filename: string): string;

  injectCssResource(res: string, head): void;

  injectjsResource(res: string, head): void;

  updateDom(head): void;
}
