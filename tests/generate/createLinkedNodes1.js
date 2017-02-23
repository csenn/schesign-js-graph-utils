import * as rangeTypes from '../../src/rangeTypes';
import {
  Design,
  ClassNode,
  PropertyNode,
} from '../../src/design';

const design = new Design();
const class1 = new ClassNode({ label: 'class1' });
const class2 = new ClassNode({ label: 'class2' });
const propA = new PropertyNode({ label: 'a', range: rangeTypes.text() });
const propB = new PropertyNode({ label: 'b', range: rangeTypes.linkedClass(class1) });
const propC = new PropertyNode({ label: 'c', range: rangeTypes.linkedClass(class1) });

class1.addProperty(propA);
class1.addProperty(propB);
class2.addProperty(propA);
class2.addProperty(propC);

design.addClass(class1);
design.addClass(class2);

export default design.toJSON();
