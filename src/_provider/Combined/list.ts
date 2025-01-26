import { ListAbstract } from '../listAbstract';
import * as helper from './helper';
import { UserList as MalList } from '../MyAnimeList_hybrid/list';
import { UserList as MalApiList } from '../MyAnimeList_api/list';
import { UserList as AnilistList } from '../AniList/list';
import { UserList as KitsuList } from '../Kitsu/list';
import { UserList as SimklList } from '../Simkl/list';
import { UserList as ShikiList } from '../Shikimori/list';
// import { UserList as LocalList } from '../Local/list';

export class UserList extends ListAbstract {
  name = 'combined';

  authenticationUrl = '';

  private syncMode: string;

  private lists: Record<string, ListAbstract>;

  private order: string[];

  private cacheKeys = new Set<any>();

  constructor(
    protected status: number = 1,
    protected listType: 'anime' | 'manga' = 'anime',
    protected sort: string = 'default',
  ) {
    super(status, listType, sort);
    this.syncMode = helper.getSyncMode(listType);
    this.lists = {
      MAL: new MalList(status, listType, sort),
      MALAPI: new MalApiList(status, listType, sort),
      ANILIST: new AnilistList(status, listType, sort),
      KITSU: new KitsuList(status, listType, sort),
      SIMKL: new SimklList(status, listType, sort),
      SHIKI: new ShikiList(status, listType, sort),
      // LOCAL: new LocalList(status, listType, sort),
    };
    this.name = this.lists[this.syncMode].name;
    this.authenticationUrl = (this.lists[this.syncMode] as UserList).authenticationUrl;
    this.order = [this.syncMode];
    for (const mode in this.lists) {
      this.order.push(mode);
    }
    return this;
  }

  async getUserObject() {
    return this.lists[this.syncMode].getUserObject();
  }

  _getSortingOptions() {
    return [];
  }

  async getPart() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.offset >= this.order.length) {
        this.done = true;
        return [];
      }
      const mode = this.order[this.offset];
      const list = this.lists[mode];
      con.log(
        '[UserList][Combined]',
        `status: ${this.status}`,
        `syncMode: ${this.syncMode}`,
        `mode: ${mode}`,
      );
      try {
        const part = await list.getPart().then(part =>
          part.filter(item => {
            const result = !this.cacheKeys.has(item.cacheKey);
            this.cacheKeys.add(item.cacheKey);
            return result;
          }),
        );
        if (list.isDone()) {
          this.offset++;
          this.done = this.offset >= this.order.length;
        }
        return part;
      } catch (e) {
        this.offset++;
        con.error(e);
      }
    }
  }
}
