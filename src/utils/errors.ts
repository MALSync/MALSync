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
