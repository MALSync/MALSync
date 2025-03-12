export class UnknownChibiFunctionError extends Error {
  constructor(functionName: string) {
    super(`Unknown function: ${functionName}`);
  }
}
