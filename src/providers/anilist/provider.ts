import { ProviderBase, ProviderCredentials, ProviderUserInfo, ListEntry, SyncResult, Status, Score, contentType, StartFinishDate, FuzzyDate } from '../types';
import { httpClient, parseJson, NotAutenticatedError, NotFoundError, ServerOfflineError, UnexpectedResponseError } from '../../utils/http';
import { con } from '../../utils/logger';

const logger = con.m('anilist', '#3db4f2');

export class AniListProvider extends ProviderBase {
  constructor(credentials: ProviderCredentials) {
    super('anilist', credentials);
  }

  private translateStatus(aniStatus: string, malStatus?: Status): string | Status {
    const statusMap: Record<string, Status> = {
      CURRENT: Status.Watching,
      PLANNING: Status.PlanToWatch,
      COMPLETED: Status.Completed,
      DROPPED: Status.Dropped,
      PAUSED: Status.Onhold,
      REPEATING: Status.Rewatching,
    };

    if (malStatus !== undefined) {
      return Object.keys(statusMap).find(key => statusMap[key] === malStatus) || 'CURRENT';
    }
    return statusMap[aniStatus] || Status.Watching;
  }

  private parseFuzzyDate(date?: FuzzyDate): StartFinishDate {
    if (!date?.year || !date?.month || !date?.day) {
      return null;
    }

    const year = String(date.year).padStart(4, '0');
    const month = String(date.month).padStart(2, '0');
    const day = String(date.day).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private getFuzzyDate(date?: StartFinishDate): FuzzyDate {
    const fuzzyDate: FuzzyDate = {
      year: null,
      month: null,
      day: null,
    };

    const regexMatch = date?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (regexMatch?.[1] && regexMatch?.[2] && regexMatch?.[3]) {
      fuzzyDate.year = parseInt(regexMatch[1]);
      fuzzyDate.month = parseInt(regexMatch[2]);
      fuzzyDate.day = parseInt(regexMatch[3]);
    }

    return fuzzyDate;
  }

  private async apiCall(query: string, variables: any, requiresAuthentication = true): Promise<any> {
    if (requiresAuthentication && !this.credentials.accessToken) {
      throw new NotAutenticatedError('No token found');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.credentials.accessToken) {
      headers.Authorization = `Bearer ${this.credentials.accessToken}`;
    }

    const response = await httpClient.post('https://graphql.anilist.co', {
      query,
      variables,
    }, headers);

    try {
      const res = parseJson(response.responseText);

      if (typeof res.errors !== 'undefined' && res.errors.length) {
        logger.error('API Error', res.errors);
        const error = res.errors[0];
        switch (error.status) {
          case 400:
            if (error.message === 'Invalid token' && !requiresAuthentication) {
              throw new NotAutenticatedError('Invalid token');
            }
            if (error.message === 'validation') throw new Error('Wrong request format');
            if (error.message.includes('invalid')) throw new Error('Wrong request format');
            throw new NotAutenticatedError(error.message);
          case 404:
            throw new NotFoundError(error.message);
          default:
            throw new Error(error.message);
        }
      }

      return res;
    } catch (err) {
      if (err instanceof UnexpectedResponseError) {
        if ((response.status > 499 && response.status < 600) || response.status === 0) {
          throw new ServerOfflineError(`Server Offline status: ${response.status}`);
        }
        if (response.status === 403) {
          throw new Error('Blocked by AniList');
        }
      }
      throw err;
    }
  }

  public async getUserInfo(): Promise<ProviderUserInfo> {
    const query = `
      query {
        Viewer {
          name
          id
          avatar {
            large
          }
        }
      }
    `;

    const res = await this.apiCall(query, []);
    return {
      username: res.data.Viewer.name,
      picture: res.data.Viewer.avatar.large || '',
      href: `https://anilist.co/user/${res.data.Viewer.id}`,
    };
  }

  public async getList(type: contentType, status?: Status): Promise<ListEntry[]> {
    const query = `
      query ($userId: Int, $type: MediaType, $status: MediaListStatus) {
        MediaListCollection(userId: $userId, type: $type, status: $status) {
          lists {
            entries {
              id
              status
              score
              progress
              progressVolumes
              repeat
              priority
              private
              notes
              hiddenFromStatusLists
              customLists
              advancedScores
              startedAt {
                year
                month
                day
              }
              completedAt {
                year
                month
                day
              }
              updatedAt
              createdAt
              media {
                id
                idMal
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  medium
                  large
                }
                episodes
                volumes
                chapters
                status
                format
                averageScore
                popularity
                trending
                favourites
              }
            }
          }
        }
      }
    `;

    // Get user ID first
    const userInfo = await this.getUserInfo();
    const userId = parseInt(userInfo.href.split('/').pop() || '0');

    const variables = {
      userId,
      type: type.toUpperCase(),
      status: status ? this.translateStatus('', status) : undefined,
    };

    const res = await this.apiCall(query, variables);
    const entries: ListEntry[] = [];

    if (res.data.MediaListCollection?.lists) {
      for (const list of res.data.MediaListCollection.lists) {
        for (const entry of list.entries) {
          if (entry.media.idMal) {
            entries.push({
              malId: entry.media.idMal,
              title: entry.media.title.romaji || entry.media.title.english || entry.media.title.native,
              type,
              status: this.translateStatus(entry.status) as Status,
              score: entry.score || Score.NoScore,
              watchedEp: entry.progress || 0,
              totalEp: entry.media.episodes || 0,
              readVol: type === 'manga' ? entry.progressVolumes || 0 : undefined,
              totalVol: type === 'manga' ? entry.media.volumes || 0 : undefined,
              startDate: this.parseFuzzyDate(entry.startedAt),
              finishDate: this.parseFuzzyDate(entry.completedAt),
              rewatchCount: entry.repeat || 0,
              url: `https://anilist.co/${type}/${entry.media.id}`,
              image: entry.media.coverImage.medium,
              notes: entry.notes,
            });
          }
        }
      }
    }

    return entries;
  }

  public async updateEntry(entry: Partial<ListEntry>): Promise<SyncResult> {
    if (!entry.malId) {
      return { success: false, error: 'Missing MAL ID' };
    }

    try {
      // First, find the AniList ID for this MAL ID
      const anilistId = await this.malToAnilist(entry.malId, entry.type!);
      if (!anilistId) {
        return { success: false, error: 'Entry not found on AniList' };
      }

      const mutation = `
        mutation ($mediaId: Int, $status: MediaListStatus, $score: Int, $progress: Int, $progressVolumes: Int, $repeat: Int, $startedAt: FuzzyDateInput, $completedAt: FuzzyDateInput, $notes: String) {
          SaveMediaListEntry (mediaId: $mediaId, status: $status, score: $score, progress: $progress, progressVolumes: $progressVolumes, repeat: $repeat, startedAt: $startedAt, completedAt: $completedAt, notes: $notes) {
            id
            status
            score
            progress
            progressVolumes
            repeat
            startedAt {
              year
              month
              day
            }
            completedAt {
              year
              month
              day
            }
            notes
          }
        }
      `;

      const variables: any = {
        mediaId: anilistId,
      };

      if (entry.status !== undefined) {
        variables.status = this.translateStatus('', entry.status);
      }
      if (entry.score !== undefined) {
        variables.score = entry.score;
      }
      if (entry.watchedEp !== undefined) {
        variables.progress = entry.watchedEp;
      }
      if (entry.readVol !== undefined) {
        variables.progressVolumes = entry.readVol;
      }
      if (entry.rewatchCount !== undefined) {
        variables.repeat = entry.rewatchCount;
      }
      if (entry.startDate !== undefined) {
        variables.startedAt = this.getFuzzyDate(entry.startDate);
      }
      if (entry.finishDate !== undefined) {
        variables.completedAt = this.getFuzzyDate(entry.finishDate);
      }
      if (entry.notes !== undefined) {
        variables.notes = entry.notes;
      }

      const res = await this.apiCall(mutation, variables);
      
      if (res.data.SaveMediaListEntry) {
        return { success: true };
      } else {
        return { success: false, error: 'Failed to update entry' };
      }
    } catch (error: any) {
      logger.error('Update error:', error);
      return { success: false, error: error.message };
    }
  }

  public async deleteEntry(malId: number, type: contentType): Promise<SyncResult> {
    try {
      const anilistId = await this.malToAnilist(malId, type);
      if (!anilistId) {
        return { success: false, error: 'Entry not found on AniList' };
      }

      const mutation = `
        mutation ($id: Int) {
          DeleteMediaListEntry (id: $id) {
            deleted
          }
        }
      `;

      // First get the list entry ID
      const entry = await this.searchEntry('', type); // This would need the actual title
      if (!entry) {
        return { success: false, error: 'Entry not found' };
      }

      // This is a simplified implementation - in practice you'd need to get the list entry ID
      const res = await this.apiCall(mutation, { id: anilistId });
      
      return { success: true };
    } catch (error: any) {
      logger.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  }

  public async searchEntry(title: string, type: contentType): Promise<ListEntry | null> {
    // This is a simplified implementation
    // In practice, you'd search for the entry and return the first match
    return null;
  }

  private async malToAnilist(malId: number, type: contentType): Promise<number | null> {
    const query = `
      query ($id: Int, $type: MediaType) {
        Media (idMal: $id, type: $type) {
          id
          idMal
        }
      }
    `;

    const variables = {
      id: malId,
      type: type.toUpperCase(),
    };

    try {
      const response = await httpClient.post('https://graphql.anilist.co', {
        query,
        variables,
      }, {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });

      if (response.status === 404) return null;
      const res = parseJson(response.responseText);
      return res.data.Media.id;
    } catch (error) {
      logger.error('MAL to AniList conversion error:', error);
      return null;
    }
  }
}
