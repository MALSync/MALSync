/* eslint-disable max-classes-per-file */
export class NotAuthenticatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotAuthenticatedError';
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

export class UnexpectedResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnexpectedResponseError';
  }
}

export function parseJson(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new UnexpectedResponseError(e.message);
  }
}

export function errorMessage(error, authenticationUrl: string) {
  if (error instanceof NotAuthenticatedError) {
    return api.storage.lang('Error_Authenticate', [authenticationUrl]);
  }
  if (error instanceof ServerOfflineError) {
    return 'Server Offline';
  }
  if (error instanceof UrlNotSupportedError) {
    return `Incorrect url provided [${error.message}]`;
  }
  if (error instanceof NotFoundError) {
    return 'Could not find this entry';
  }
  return error.message;
}
