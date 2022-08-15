import { reactive, Ref, watch } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-shadow
type Parameter<G> = G extends (arg: infer G) => any ? G : never;

export function createRequest<F extends (arg: any) => Promise<any>>(
  parameter: Ref<Parameter<F>>,
  fn: F,
) {
  const result = reactive({
    loading: true,
    data: null as null | Awaited<ReturnType<F>>,
    error: null,
  });

  const execute = (params: Ref<Parameter<F>>) => {
    result.loading = true;
    result.error = null;
    fn(params)
      .then(res => {
        result.loading = false;
        result.data = res;
      })
      .catch(err => {
        con.error(err);
        result.loading = false;
        result.error = err;
      });
  };

  watch(parameter, value => execute(parameter), { deep: true });

  execute(parameter);

  return result;
}
