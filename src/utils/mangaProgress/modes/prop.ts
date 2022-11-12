import { ModeAbstract } from '../ModeAbstract';

type arguments = {
  selector: string;
  property: string;
  regex?: string;
  group?: number;
};

export class prop extends ModeAbstract<arguments> {
  execute(args: arguments) {
    let textString = j.$(args.selector).first().prop(args.property).trim();
    if (args.regex) {
      const regex = new RegExp(args.regex);
      const match = textString.match(regex);
      if (match) {
        textString = match[args.group || 0];
      }
    }
    const n = Number(textString);
    if (Number.isNaN(n) || n === 0)
      throw new Error(`No number found in property '${args.property}' for '${textString}' (${n})`);

    return n;
  }
}
