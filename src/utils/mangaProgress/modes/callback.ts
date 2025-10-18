import { ModeAbstract } from '../ModeAbstract';

type arguments = {
  callback: () => string | number;
};

/**
 * @description If possible use a different mode instead of this one.
 */
export class callback extends ModeAbstract<arguments> {
  execute(args: arguments) {
    const textString = args.callback();

    const n = Number(textString);
    if (Number.isNaN(n)) throw new Error(`No number found in text '${textString}' (${n})`);

    return n;
  }
}
