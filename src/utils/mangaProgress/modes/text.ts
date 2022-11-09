import { ModeAbstract } from '../ModeAbstract';

type arguements = {
  selector: string;
};

export class text extends ModeAbstract<arguements> {
  execute(args: arguements) {
    const textString = j.$(args.selector).first().text();
    const n = Number(textString);
    if (Number.isNaN(n) || n === 0)
      throw new Error(`No number found in text '${textString}' (${n})`);

    return j.$(args.selector).first().text();
  }
}
