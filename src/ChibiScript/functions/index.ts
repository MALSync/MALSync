import literalFunctions from './literalFunctions';
import controlFlowFunctions from './controlFlowFunctions';
import stringFunctions from './stringFunctions';
import domFunctions from './domFunctions';
import coreFunctions from './coreFunctions';
import utilsFunctions from './utilsFunctions';
import conditionFunctions from './conditionFunctions';
import arrayFunctions from './arrayFunctions';

export default {
  ...literalFunctions,
  ...controlFlowFunctions,
  ...stringFunctions,
  ...domFunctions,
  ...coreFunctions,
  ...utilsFunctions,
  ...conditionFunctions,
  ...arrayFunctions,
};
