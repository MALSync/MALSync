import type { ChibiCtx } from '../ChibiCtx';

export default function regexFunction(
  ctx: ChibiCtx,
  input: string,
  regexDefinition: string,
  group: number,
) {
  const regex = new RegExp(regexDefinition);
  const match = input.match(regex);

  if (!match) {
    throw new Error(`No match found for regex '${regexDefinition}' in input '${input}'`);
  }

  return match[group];
}
