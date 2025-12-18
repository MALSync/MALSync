import type { ProgressItem } from '../background/releaseProgressUtils';
import { IntlDateTime } from './IntlWrapper';

export class Progress {
  constructor(
    protected progressItem: ProgressItem | null,
    protected type: 'anime' | 'manga',
  ) {
    return this;
  }

  protected getProgressCurrentEpisode() {
    if (this.progressItem && this.progressItem.lastEp && this.progressItem.lastEp.total)
      return this.progressItem.lastEp.total;
    return null;
  }

  protected getProgressPrediction() {
    if (
      this.progressItem &&
      this.progressItem.predicition &&
      this.progressItem.predicition.timestamp
    )
      return this.progressItem.predicition.timestamp;
    return null;
  }

  protected getProgressLastTimestamp() {
    if (this.progressItem && this.progressItem.lastEp && this.progressItem.lastEp.timestamp)
      return this.progressItem.lastEp.timestamp;
    return null;
  }

  getCurrentEpisode() {
    if (!api.settings.get('epPredictions')) return null;
    return this.getProgressCurrentEpisode();
  }

  getPredictionTimestamp() {
    const progressPrediction = this.getProgressPrediction();
    if (!progressPrediction || new Date().getTime() > progressPrediction) return NaN;
    return progressPrediction;
  }

  getPrediction() {
    const timestamp = Number(this.getPredictionTimestamp());
    if (Number.isNaN(timestamp)) return '';
    const progress = new IntlDateTime(timestamp).getRelativeNowFriendlyText('Progress', {
      style: 'significantLongNarrow',
    });
    return progress;
  }

  getPredictionText() {
    const timestamp = Number(this.getPredictionTimestamp());
    if (Number.isNaN(timestamp)) return '';
    const dt = new IntlDateTime(Number(timestamp));
    const time = dt.getRelativeNowText('Progress', { style: 'long' });
    if (!dt.isValidDate()) return '';
    if (dt.isNow()) return api.storage.lang('bookmarksItem_now');
    return api.storage.lang(`prediction_Episode_${this.type}`, [time]);
  }

  getLastTimestamp() {
    if (!this.getProgressLastTimestamp()) return NaN;
    return this.getProgressLastTimestamp();
  }

  getLast() {
    const timestamp = Number(this.getLastTimestamp());
    if (Number.isNaN(timestamp)) return '';
    const last = new IntlDateTime(timestamp).getRelativeNowFriendlyText('Progress', {
      style: 'significantLongNarrow',
    });
    return last;
  }

  getLastText() {
    const timestamp = Number(this.getLastTimestamp());
    if (Number.isNaN(timestamp)) return '';
    const dt = new IntlDateTime(Number(timestamp));
    const time = dt.getRelativeNowText('Progress', { style: 'long' });
    if (!dt.isValidDate()) return '';
    if (dt.isNow()) return api.storage.lang('bookmarksItem_now');
    return api.storage.lang(`prediction_Last_${this.type}`, [time]);
  }

  getAuto() {
    const preT = this.getPrediction();
    if (preT) return preT;
    const lastT = this.getLast();
    if (lastT) return lastT;
    return '';
  }

  getAutoText(sourceInfo = false) {
    const textParts = [] as string[];
    if (this.getPredictionText()) {
      textParts.push(this.getPredictionText());
    } else if (this.getLastText()) {
      textParts.push(this.getLastText());
    }
    if (sourceInfo) {
      const sourceInfoText = this.getSourceInfo();
      if (sourceInfoText) textParts.push(sourceInfoText);
    }
    return textParts.join(' ');
  }

  getLang() {
    return this.progressItem?.lang;
  }

  getLangType() {
    return this.progressItem?.type;
  }

  getLanguageLabel() {
    const lang = this.getLang();
    if (!lang) return '';
    const languageService = new Intl.DisplayNames('en', { type: 'language' });
    return languageService.of(lang.replace(/^jp$/, 'ja')) || lang;
  }

  getState() {
    if (!this.progressItem) return null;
    return this.progressItem.state;
  }

  isDropped() {
    return this.getState() === 'dropped' || this.getState() === 'discontinued';
  }

  getId() {
    if (!this.progressItem) return null;
    return this.progressItem.id;
  }

  getSource() {
    if (!this.progressItem) return null;
    return this.progressItem.source;
  }

  getGroup() {
    if (!this.progressItem) return null;
    return this.progressItem.group;
  }

  getSourceInfo() {
    if (this.getGroup()) return `(${this.getGroup()})`;
    if (this.getSource()) return `(${this.getSource()})`;
    return '';
  }
}
