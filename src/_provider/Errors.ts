/* eslint-disable max-classes-per-file */
export class NotAutenticatedError extends Error {
  public authenticationUrl;

  constructor(message: string, authenticationUrl = '') {
    super(message);
    this.name = 'NotAutenticatedError';
    this.authenticationUrl = authenticationUrl;
  }
}

export class UrlNotSuportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UrlNotSuportedError';
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

export function errorMessage(error) {
  if (typeof error.code === 'undefined') {
    return error;
  }

  if (error instanceof NotAutenticatedError) {
    return api.storage.lang('Error_Authenticate', [error.authenticationUrl]);
  }
  if (error instanceof ServerOfflineError) {
    return `[${this.shortName}] Server Offline`;
  }
  if (error instanceof UrlNotSuportedError) {
    return `Incorrect url provided [${error.message}]`;
  }
  if (error instanceof NotFoundError) {
    return `Could not find this entry`;
  }
  return error.message;
}
