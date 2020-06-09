export interface storageInterface {
  set(key: string, value: any): Promise<void>;

  get(key: string): Promise<any | undefined>;

  remove(key: string): Promise<void>;

  list(from?: string): Promise<any[]>;

  addStyle(css: string): Promise<void>;

  version(): string;

  lang(selector, args?: string[]): string;

  assetUrl(filename: string): string;

  injectCssResource(res: string, head): void;

  injectjsResource(res: string, head): void;

  updateDom(head): void;

  storageOnChanged(cb: (changes, namespace) => void): any;
}
