import type { ChibiGenerator, ChibiJson } from '../../../chibiScript/ChibiGenerator';
import { PageInterface } from '../../pageInterface';
import { batoV2 } from './mainV2';
import { batoV3 } from './mainV3';

function conditionalPageInterfaces(
  condition: (c: ChibiGenerator<any>) => ChibiJson<boolean>,
  interface1: PageInterface,
  interface2: PageInterface,
): PageInterface {
  const final = interface1;

  [
    'isSyncPage',
    'getTitle',
    'getIdentifier',
    'getOverviewUrl',
    'getEpisode',
    'getVolume',
    'nextEpUrl',
    'getImage',
  ].forEach(method => {
    final.sync[method] = conditionalMethod(
      condition,
      interface1.sync[method],
      interface2.sync[method],
    ) as any;
  });

  ['isOverviewPage', 'getTitle', 'getIdentifier', 'uiInjection', 'getImage'].forEach(method => {
    final.overview![method] = conditionalMethod(
      condition,
      interface1.overview![method],
      interface2.overview![method],
    ) as any;
  });

  ['elementsSelector', 'elementUrl', 'elementEp'].forEach(method => {
    final.list![method] = conditionalMethod(
      condition,
      interface1.list![method],
      interface2.list![method],
    ) as any;
  });

  ['setup'].forEach(method => {
    final.lifecycle[method] = conditionalMethod(
      condition,
      interface1.lifecycle[method],
      interface2.lifecycle[method],
    ) as any;
  });

  return final;
}

function conditionalMethod(
  condition: (c: ChibiGenerator<any>) => ChibiJson<boolean>,
  method1,
  method2,
) {
  const temp1 = method1;
  const temp2 = method2;
  return ($c: ChibiGenerator<any>) => {
    return $c.if(condition($c), temp1, temp2).run();
  };
}

export const bato: PageInterface = conditionalPageInterfaces(
  ($c: ChibiGenerator<any>) => $c.querySelector('a.position-absolute > small').boolean().run(),
  batoV2,
  batoV3,
);
