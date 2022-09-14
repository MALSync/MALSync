import { reactive, Ref, watch } from 'vue';
import { Cache } from '../../utils/Cache';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-shadow
type Parameter<G> = G extends (arg: infer G) => any ? G : never;

export function createRequest<F extends (arg: any) => Promise<any>>(
  parameter: Ref<Parameter<F>>,
  fn: F,
  options: {
    cache?: {
      prefix: string;
      ttl: number;
      refetchTtl: number;
      keyFn?: (param: Ref<Parameter<F>>) => string;
    };
    executeCondition?: (param: Ref<Parameter<F>>) => boolean;
    keepData?: boolean;
  } = {},
) {
  let id = 0;

  const result = reactive({
    loading: true,
    temporaryCache: false,
    cache: false,
    data: null as null | Awaited<ReturnType<F>>,
    error: null as null | Error,
    execute: () => Promise.resolve(),
  });

  const execute = async (params: Ref<Parameter<F>>, forceFresh = false) => {
    result.loading = true;
    result.temporaryCache = false;
    result.error = null;
    if (!options.keepData) result.data = null;
    const tempId = Math.random();
    id = tempId;

    let state;
    let cache;
    if (options.cache) {
      cache = new Cache(
        options.cache.prefix +
          (options.cache.keyFn ? options.cache.keyFn(params) : JSON.stringify(params.value)),
        options.cache.ttl,
        true,
        options.cache.refetchTtl,
      );

      if (forceFresh) {
        cache.clearValue();
      } else {
        state = await cache.fullState();
        if (state.hasValue) {
          result.data = state.value.data;
          result.loading = false;
          result.cache = true;
          result.temporaryCache = state.refetch;
        }
      }
    }

    if (state && !state.refetch && state.hasValue) return Promise.resolve();

    if (options.executeCondition && !options.executeCondition(params)) {
      result.loading = false;
      return Promise.resolve();
    }

    return fn(params)
      .then(res => {
        if (tempId !== id) return;
        result.loading = false;
        result.temporaryCache = false;
        result.cache = false;
        result.data = res;
        if (cache && res) cache.setValue(res);
      })
      .catch(err => {
        if (tempId !== id) return;
        con.error(err);
        result.loading = false;
        result.temporaryCache = false;
        result.cache = false;
        result.error = err;
      });
  };

  watch(parameter, value => execute(parameter), { deep: true });

  execute(parameter);

  result.execute = () => execute(parameter, true);

  return result;
}
