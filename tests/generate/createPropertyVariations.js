import * as rangeTypes from '../../src/rangeTypes';
import {
  Design,
  ClassNode,
  PropertyNode,
} from '../../src/design';

const design = new Design();
const class1 = new ClassNode({ label: 'class1', description: 'First Description' });
const class2 = new ClassNode({ label: 'class2' });
const propA = new PropertyNode({ label: 'a', range: rangeTypes.boolean() });
const propA1 = new PropertyNode({ label: 'a1', range: rangeTypes.text() });
const propB = new PropertyNode({ label: 'b', range: rangeTypes.text() });
const propC = new PropertyNode({ label: 'c', range: rangeTypes.text() });
const propD = new PropertyNode({ label: 'd', range: rangeTypes.url() });
const propE = new PropertyNode({ label: 'e', range: rangeTypes.email() });
const propF = new PropertyNode({ label: 'f', range: rangeTypes.hostname() });
const propG = new PropertyNode({ label: 'g', range: rangeTypes.regex('[a-z]') });
const propG1 = new PropertyNode({ label: 'g1', range: rangeTypes.text({ minLength: 0 }) });
const propG2 = new PropertyNode({ label: 'g2', range: rangeTypes.text({ minLength: 0, maxLength: 10 }) });
const propH = new PropertyNode({ label: 'h', range: rangeTypes.number() });
const propI = new PropertyNode({ label: 'i', range: rangeTypes.int() });
const propJ = new PropertyNode({ label: 'j', range: rangeTypes.int8() });
const propK = new PropertyNode({ label: 'k', range: rangeTypes.int16() });
const propL = new PropertyNode({ label: 'l', range: rangeTypes.int32() });
const propM = new PropertyNode({ label: 'm', range: rangeTypes.int64() });
const propN = new PropertyNode({ label: 'n', range: rangeTypes.float32() });
const propO = new PropertyNode({ label: 'o', range: rangeTypes.float64() });
const propP = new PropertyNode({ label: 'p', range: rangeTypes.number({ min: 0 }) });
const propQ = new PropertyNode({ label: 'q', range: rangeTypes.number({ min: 0, max: 10 }) });
const propR = new PropertyNode({ label: 'r', range: rangeTypes.enu(['one', 'two', 3, 4.5]) });
const propS = new PropertyNode({ label: 's', range: rangeTypes.dateTime() });
const propS1 = new PropertyNode({ label: 's1', range: rangeTypes.shortDate() });
const propS2 = new PropertyNode({ label: 's2', range: rangeTypes.dateTime() });
const propS3 = new PropertyNode({ label: 's3', range: rangeTypes.time() });
const propT = new PropertyNode({ label: 't', range: rangeTypes.nestedObject() });
const propU = new PropertyNode({ label: 'u', range: rangeTypes.text() });
const propV = new PropertyNode({ label: 'v', range: rangeTypes.nestedObject() });
const propW = new PropertyNode({ label: 'w', range: rangeTypes.text() });
const propX = new PropertyNode({ label: 'x', range: rangeTypes.linkedClass(class2) });
const propY = new PropertyNode({ label: 'y', range: rangeTypes.text() });

propV.addProperty(propW);
propT.addProperty(propU);
propT.addProperty(propV);

class1.addProperty(propA);
class1.addProperty(propA1);
class1.addProperty(propB, { required: true });
class1.addProperty(propC, { isMultiple: true });
class1.addProperty(propD);
class1.addProperty(propE);
class1.addProperty(propF);
class1.addProperty(propG);
class1.addProperty(propG1);
class1.addProperty(propG2);
class1.addProperty(propH);
class1.addProperty(propI);
class1.addProperty(propJ);
class1.addProperty(propK);
class1.addProperty(propL);
class1.addProperty(propM);
class1.addProperty(propN);
class1.addProperty(propO);
class1.addProperty(propP);
class1.addProperty(propQ);
class1.addProperty(propR);
class1.addProperty(propS);
class1.addProperty(propS1);
class1.addProperty(propS2);
class1.addProperty(propS3);
class1.addProperty(propT);
class1.addProperty(propX);

class2.addProperty(propY);

design.addClass(class1);
design.addClass(class2);

export default design.toJSON();
