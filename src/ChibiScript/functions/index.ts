import regexFunction from './regexFunction';
import urlFunction from './urlFunction';
import literalFunctions from './literalFunctions';
import controlFlowFunctions from './controlFlowFunctions';

export default {
  ...literalFunctions,
  ...controlFlowFunctions,
  regexFunction,
  urlFunction,
};
