/* eslint-disable max-classes-per-file */
export class NotAutenticatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotAutenticatedError';
  }
}

export class UrlNotSupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UrlNotSupportedError';
  }
}

export class ServerOfflineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServerOfflineError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export function errorMessage(error, authenticationUrl: string) {
  if (error instanceof NotAutenticatedError) {
    return api.storage.lang('Error_Authenticate', [authenticationUrl]);
  }
  if (error instanceof ServerOfflineError) {
    return `[${this.shortName}] Server Offline`;
  }
  if (error instanceof UrlNotSupportedError) {
    return `Incorrect url provided [${error.message}]`;
  }
  if (error instanceof NotFoundError) {
    return `Could not find this entry`;
  }
  return error.message;
}
