const reservedKeys = ['url', 'ui', 'provider', 'trigger', 'pageObject', 'element'] as const;
export type ReservedKey = (typeof reservedKeys)[number];
export function isReservedKey<T extends string>(key: T): T extends ReservedKey ? true : false {
  return reservedKeys.includes(key as ReservedKey) as ReturnType<typeof isReservedKey<T>>;
}

export class ChibiRegistry<T = any> {
  private store: Map<string, T> = new Map();

  public set(key: string, value: T): void {
    this.store.set(key, value);
  }

  public get(key: string): T | undefined {
    return this.store.get(key);
  }

  public has(key: string): boolean {
    return this.store.has(key);
  }

  public delete(key: string): boolean {
    return this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }

  public keys(): string[] {
    return Array.from(this.store.keys());
  }
}

export const chibiRegistrySingleton = new ChibiRegistry();
