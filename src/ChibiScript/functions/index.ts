import urlFunction from './urlFunction';
import literalFunctions from './literalFunctions';
import controlFlowFunctions from './controlFlowFunctions';
import stringFunctions from './stringFunctions';

export default {
  ...literalFunctions,
  ...controlFlowFunctions,
  ...stringFunctions,
  urlFunction,
};
