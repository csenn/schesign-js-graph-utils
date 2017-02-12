import rangeTypes from '../../src/rangeTypes';
import {
  Design,
  ClassNode,
  PropertyNode,
} from '../../src/design';

const design = new Design();
const class1 = new ClassNode({ label: 'class1' });
const class2 = new ClassNode({ label: 'class2' });
const class3 = new ClassNode({ label: 'class3' });

const propA = new PropertyNode({ label: 'a', range: rangeTypes.text() })
const propA1 = new PropertyNode({ label: 'a1', range: rangeTypes.text() })
const propB = new PropertyNode({ label: 'b', range: rangeTypes.text() })
const propC = new PropertyNode({ label: 'c', range: rangeTypes.text() })

class1.addProperty(propA)
class1.addProperty(propA1)
class2.addProperty(propB)
class3.addProperty(propC)

class2.inheritsFrom(class1)
class3.inheritsFrom(class2)

class2.excludeParentProperty(propA1)

design.addClass(class1)
design.addClass(class2)
design.addClass(class3)

export default design.toJSON()