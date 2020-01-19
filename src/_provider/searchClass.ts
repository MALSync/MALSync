export class searchClass {
  private sanitizedTitel;

  constructor(protected title: string, protected type: 'anime'|'manga'|'novel') {
    this.sanitizedTitel = this.sanitizeTitel(this.title);
  }

  getSanitizedTitel() {
    return this.sanitizedTitel;
  }

  public sanitizeTitel(title) {
    title = title.replace(/ *(\(dub\)|\(sub\)|\(uncensored\)|\(uncut\))/i, '');
    title = title.replace(/ *\([^\)]+audio\)/i, '');
    title = title.replace(/ BD( |$)/i, '');
    title = title.trim();
    return title;
  }
}
