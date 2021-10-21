/* eslint-disable max-classes-per-file */
export class NotAutenticatedError extends Error {
  public authenticationUrl;

  constructor(message: string, authenticationUrl: string) {
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

