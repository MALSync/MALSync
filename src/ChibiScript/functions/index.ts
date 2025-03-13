import literalFunctions from './literalFunctions';
import controlFlowFunctions from './controlFlowFunctions';
import stringFunctions from './stringFunctions';
import domFunctions from './domFunctions';
import coreFunctions from './coreFunctions';
import utilsFunctions from './utilsFunctions';

export default {
  ...literalFunctions,
  ...controlFlowFunctions,
  ...stringFunctions,
  ...domFunctions,
  ...coreFunctions,
  ...utilsFunctions,
};
