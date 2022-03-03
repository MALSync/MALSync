/* eslint-disable max-classes-per-file */
export class MissingPlayerError extends Error {
  public url;

  constructor(url: string) {
    const parts = url.split('/');
    let domain = url;
    if (parts.length > 2) domain = parts[2];
    super(domain);
    this.url = url;
    this.name = 'MissingPlayerError';
  }
}

export class SafeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SafeError';
  }
}

export class MissingDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingDataError';
  }
}

export class CustomDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomDomainError';
  }
}
