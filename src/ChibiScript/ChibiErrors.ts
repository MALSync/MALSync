/* eslint-disable max-classes-per-file */
export class ChibiError extends Error {}

export class UnknownChibiFunctionError extends ChibiError {
  constructor(functionName: string) {
    super(`Unknown function: ${functionName}`);
  }
}
