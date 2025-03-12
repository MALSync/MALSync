import { ChibiCtx } from '../ChibiCtx';

export default function urlFunction(ctx: ChibiCtx, input: void): string {
  const url = ctx.get('url');

  if (url && typeof url === 'string') {
    return url;
  }

  return typeof window !== 'undefined' ? window.location.href : '';
}
