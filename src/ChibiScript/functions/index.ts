import urlFunction from './urlFunction';
import literalFunctions from './literalFunctions';
import controlFlowFunctions from './controlFlowFunctions';
import stringFunctions from './stringFunctions';
import domFunctions from './domFunctions';

export default {
  ...literalFunctions,
  ...controlFlowFunctions,
  ...stringFunctions,
  ...domFunctions,
  urlFunction,
};
