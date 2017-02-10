import { expect } from 'chai';
import * as constants from '../src/index';
import rangeTypes from '../src/rangeTypes';
import {
  Design,
  ClassNode,
  PropertyNode,
} from '../src/design';

import propertyVariations from '../graphs/import/propertyVariations';
import testInheritance1 from '../graphs/import/testInheritance1'
import testInheritance2 from '../graphs/import/testInheritance2'

const { describe, it } = global;

describe('Generating a design', () => {
  let design = new Design();
  describe('and creating properties', () => {
    it('should create a property node with range text', () => {
      const node = new PropertyNode({
        label: 'a',
        range: { type: constants.TEXT },
      });
      expect(node.label).to.equal('a');
      expect(node.range.type).to.equal(constants.TEXT);
    });
    it('should fail to create a NestedObject property node', () => {
      const node = new PropertyNode({
        label: 'a',
        range: { type: constants.TEXT },
      });
      const nodeB = new PropertyNode({
        label: 'b',
        range: { type: constants.TEXT },
      });
      try {
        node.addProperty(nodeB);
      } catch (err) {
        expect(err).to.eql(new Error('Must have range NestedObject to add property ref'));
      }
    });
    it('should create a NestedObject property node', () => {
      const node = new PropertyNode({
        label: 'a',
        range: { type: constants.NESTED_OBJECT },
      });
      const nodeB = new PropertyNode({
        label: 'b',
        range: { type: constants.TEXT },
      });
      node.addProperty(nodeB);
      expect(node.label).to.equal('a');
      expect(node.range).to.deep.equal({
        type: constants.NESTED_OBJECT,
        propertyRefs: [{ ref: nodeB.label, cardinality: { minItems: 0, maxItems: 1 } }],
      });
    });
  });
  describe('and creating classes', () => {
    it('should throw when a class is not provided', () => {
      const d = new Design();
      try {
        d.addClass({});
      } catch (err) {
        expect(err).to.eql(new Error('Must be an instanceof ClassNode'));
      }
    });
    it('should add an empty class node', () => {
      const node = new ClassNode({ label: 'classA' });
      design.addClass(node);
      expect(node.label).to.equal('classA');
      expect(design.graph.length).to.equal(1);
    });
    it('should add an propertyRef by reference to a class node', () => {
      const node = new ClassNode({ label: 'classA' });
      const propNode = new PropertyNode({ label: 'a', range: { type: constants.TEXT } });
      node.addProperty(propNode);
      expect(node.propertyRefs.length).to.equal(1);
      expect(node.propertyRefs[0].ref).to.equal('a');
      expect(node.propertyRefs[0].cardinality.minItems).to.equal(0);
      expect(node.propertyRefs[0].cardinality.maxItems).to.equal(1);
      expect(node.propertyLookup.a).to.equal(propNode);
    });
  });
  describe('and creating full design', () => {
    it('should output the propertyVariations graph', () => {
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
      const propR = new PropertyNode({ label: 'r', range: rangeTypes.enum(['one', 'two', 3, 4.5]) });
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

      const result = design.toJSON();
      expect(result).to.deep.equal(propertyVariations);
    });
    it('should output the testInheritance1 graph', () => {
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


      const result = design.toJSON()
      expect(result).to.deep.equal(testInheritance1)
    });
    it('should output the testInheritance2 graph', () => {
      const design = new Design();
      const class4 = new ClassNode({ label: 'class4' });
      const class5 = new ClassNode({ label: 'class5' });
      const propD = new PropertyNode({ label: 'd', range: rangeTypes.text() })
      const propE = new PropertyNode({ label: 'e', range: rangeTypes.text() })

      class4.addProperty(propD)
      class5.addProperty(propE)

      class4.inheritsFrom('https://www.schesign.com/u/csenn/test_inheritance_1/master/class/class3')
      class5.inheritsFrom(class4)

      design.addClass(class4)
      design.addClass(class5)

      const result = design.toJSON()
      expect(result).to.deep.equal(testInheritance2)
    });
  });
});
