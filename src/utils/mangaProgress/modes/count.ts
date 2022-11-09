import { ModeAbstract } from '../ModeAbstract';

type arguements = {
  selector: string;
};

export class count extends ModeAbstract<arguements> {
  protected execute(args: arguements) {
    const total = j.$(args.selector).length;
    if (total === 0) throw new Error(`No element found for '${args.selector}'`);
    return total;
  }
}
