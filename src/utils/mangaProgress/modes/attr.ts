import { ModeAbstract } from '../ModeAbstract';

type arguments = {
  selector: string;
  attribute: string;
  regex?: string;
  group?: number;
};

export class attr extends ModeAbstract<arguments> {
  execute(args: arguments) {
    let textString = j.$(args.selector).first().attr(args.attribute)!.trim();
    if (args.regex) {
      const regex = new RegExp(args.regex);
      const match = textString.match(regex);
      if (match) {
        textString = match[args.group || 0];
      }
    }
    const n = Number(textString);
    if (Number.isNaN(n) || n === 0)
      throw new Error(
        `No number found in attribute '${args.attribute}' for '${textString}' (${n})`,
      );

    return n;
  }
}
