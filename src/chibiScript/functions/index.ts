import literalFunctions from './literalFunctions';
import controlFlowFunctions from './controlFlowFunctions';
import stringFunctions from './stringFunctions';
import domFunctions from './domFunctions';
import coreFunctions from './core';
import conditionFunctions from './conditionFunctions';
import arrayFunctions from './arrayFunctions';

export default {
  ...literalFunctions,
  ...controlFlowFunctions,
  ...stringFunctions,
  ...domFunctions,
  ...coreFunctions,
  ...conditionFunctions,
  ...arrayFunctions,
};
