export abstract class ModeAbstract<T> {
  protected abstract execute(args: T): number | string;

  public getProgress(args: T): number {
    return Number(this.execute(args));
  }
}
