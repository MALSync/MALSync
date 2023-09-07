import { ModeAbstract } from '../ModeAbstract';

type arguments = {
  regex?: string;
  group?: number;
};

export class url extends ModeAbstract<arguments> {
  execute(args: arguments) {
    let textString = window.location.href.trim();
    if (args.regex) {
      const regex = new RegExp(args.regex);
      const match = textString.match(regex);
      if (match) {
        textString = match[args.group || 0];
      }
    }
    const n = Number(textString);
    if (Number.isNaN(n) || n === 0)
      throw new Error(`No number found in text '${textString}' (${n})`);

    return n;
  }
}
