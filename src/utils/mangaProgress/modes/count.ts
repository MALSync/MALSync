import { ModeAbstract } from '../ModeAbstract';

type arguments = {
  selector: string;
};

export class count extends ModeAbstract<arguments> {
  protected execute(args: arguments) {
    const total = j.$(args.selector).length;
    if (total === 0) throw new Error(`No element found for '${args.selector}'`);
    return total;
  }
}
