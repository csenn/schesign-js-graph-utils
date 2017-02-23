import * as rangeTypes from '../../src/rangeTypes';
import {
  Design,
  ClassNode,
  PropertyNode,
} from '../../src/design';

const design = new Design();
const class3 = new ClassNode({ label: 'class3' });
const class4 = new ClassNode({ label: 'class4' });
const propC = new PropertyNode({ label: 'c', range: rangeTypes.linkedClass('https://www.schesign.com/o/tests/linked_nodes_1/master/class/class2') });
const propD = new PropertyNode({ label: 'd', range: rangeTypes.linkedClass(class4) });
const propE = new PropertyNode({ label: 'e', range: rangeTypes.text() });

class3.addProperty('https://www.schesign.com/o/tests/linked_nodes_1/master/property/a');
class3.addProperty(propC);
class3.addProperty(propD);

class4.addProperty('https://www.schesign.com/o/tests/linked_nodes_1/master/property/a');
class4.addProperty(propE);

design.addClass(class3);
design.addClass(class4);

export default design.toJSON();
