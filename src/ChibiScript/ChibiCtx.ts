export class ChibiCtx {
  private variables: Record<string, any>;

  constructor() {
    this.variables = {};
  }

  set(name: string, value: any) {
    this.variables[name] = value;
  }

  get(name: string) {
    return this.variables[name];
  }
}
