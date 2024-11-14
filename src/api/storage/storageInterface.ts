export interface storageInterface {
  set(key: string, value: any): Promise<void>;

  get(key: string): Promise<any | undefined>;

  remove(key: string): Promise<void>;

  list(from?: string): Promise<{ [key: string]: any }>;

  addStyle(css: string): Promise<void>;

  version(): string;

  lang(selector, args?: string[]): string;

  langDirection(): 'ltr' | 'rtl';

  assetUrl(filename: string): string;

  injectCssResource(res: string, head, code?: string | null): void;

  injectjsResource(res: string, head): void;

  addProxyScriptToTag(tag: HTMLScriptElement, name: string): HTMLScriptElement;

  updateDom(head): void;

  storageOnChanged(cb: (changes, namespace) => void): any;
}
