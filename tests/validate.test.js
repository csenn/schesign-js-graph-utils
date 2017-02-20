import { expect } from 'chai';
import {
  validateVersionLabel,
  validateClassNode,
  validatePropertyNode,
  validateGraph
} from '../src/validate';

const { describe, it } = global;

describe('graph validation functions', () => {
  describe('validateVersionLabel', () => {
    it('should fail when not a string', () => {
      const err = validateVersionLabel({})
      expect(err).to.equal('Label must be a string')
    })
    it('should fail for 1.0', () => {
      const err = validateVersionLabel('1.0')
      expect(err).to.equal('Label should be of format *.*.*')
    })
    it('should fail for 1.0.y', () => {
      const err = validateVersionLabel('1.0.y')
      expect(err).to.equal('Label should be of format *.*.*')
    })
    it('should not fail for master', () => {
      const err = validateVersionLabel('master')
      expect(err).to.equal(null)
    })
    it('should not fail for 1.0.89', () => {
      const err = validateVersionLabel('1.0.89')
      expect(err).to.equal(null)
    })
  })
  describe('validateClassNode()', () => {
    it('should fail when a label is not provided', () => {
      const err = validateClassNode({})
      expect(err).to.equal('Class node is missing a label')
    })
    it('should fail when an invalid property is provided', () => {
      const err = validateClassNode({ label: 'hello', awesome: 'cheese' })
      expect(err).to.equal('Class node hello should not have property: awesome')
    })
    it('should fail when propertyRefs are not provided', () => {
      const err = validateClassNode({ label: 'hello' })
      expect(err).to.equal('Class node hello is missing propertyRefs')
    })
    it('should fail with a bad propertyRef', () => {
      const err = validateClassNode({ label: 'hello', propertyRefs: [{ ref: 'one', cardinality: {} }] })
      expect(err).to.equal('Class node hello has error: Bad Cardinality. Must be in format {minItems: [num], maxItems: [num || null]}')
    })
  })
  describe('validatePropertyNode()', () => {
    it('should fail when a label is not provided', () => {
      const err = validatePropertyNode({})
      expect(err).to.equal('Class node is missing a label')
    })
    it('should fail when an invalid property is provided', () => {
      const err = validatePropertyNode({ label: 'hello', awesome: 'cheese' })
      expect(err).to.equal('Class node hello should not have property: awesome')
    })
    it ('should fail when there is a range error', () => {
      const err = validatePropertyNode({
        label: 'hello',
        range: {
          type: 'i-dont-exist'
        }
      })
      expect(err).to.equal('Bad range type: i-dont-exist')
    })
  })
  describe('validateGraph()', () => {
    it('should fail when an array is not passed in', () => {
      const err = validateGraph({})
      expect(err).to.equal('Graph must be an array of class and property nodes')
    })

    it('should fail if a bad node type is passed in', () => {
      const err = validateGraph([
        {type: 'hello'}
      ])
      expect(err).to.equal('Node type must be either "Class" or "Property"')
    })

    it('should fail when class labels are duplicated', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'one', cardinality: {minItems: 0, maxItems: 1} }]
        },
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'one', cardinality: {minItems: 0, maxItems: 1} }]
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal('Class node (after becoming lowercase) is not unique: class1');
    });

    it('should fail when class labels are duplicated (case insensitive)', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'one', cardinality: {minItems: 0, maxItems: 1} }]
        },
        {
          type: 'Class',
          label: 'Class1',
          propertyRefs: [{ ref: 'one', cardinality: {minItems: 0, maxItems: 1} }]
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal('Class node (after becoming lowercase) is not unique: class1');
    });

    it('should fail when property labels are duplicated', () => {
      const graph = [
        {
          type: 'Property',
          label: 'property1',
          range: { type: 'Text' }
        },
        {
          type: 'Property',
          label: 'property1',
          range: { type: 'Text' }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal('Property node (after becoming lowercase) is not unique: property1');
    });

    it('should fail when property labels are duplicated (case insensitive)', () => {
      const graph = [
        {
          type: 'Property',
          label: 'property1',
          range: { type: 'Text' }
        },
        {
          type: 'Property',
          label: 'Property1',
          range: { type: 'Text' }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal('Property node (after becoming lowercase) is not unique: property1');
    });

    it('should pass when a class propertyRef is an external url', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{
            ref: 'https://www.schesign.com/u/user/design/1.0.0/property/pname',
            cardinality: {minItems: 0, maxItems: 1}
          }]
        },
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(null);
    });

    it('should fail when a class propertyRef does not resolve', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property2', cardinality: {minItems: 0, maxItems: 1} }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: { type: 'Text' }
        },
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(`Class node class1 ref property2 does not exist`);
    });

    it('should pass even when ref case does not match', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'PROPERTY1', cardinality: {minItems: 0, maxItems: 1} }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: { type: 'Text' }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(null);
    })

    it('should fail when a NestedObject propertyRef does not resolve', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: {minItems: 0, maxItems: 1} }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: {
            type: 'NestedObject',
            propertyRefs: [{ ref: 'property2', cardinality: {minItems: 0, maxItems: 1} }]
          }
        },
        {
          type: 'Property',
          label: 'property3',
          range: { type: 'Text' }
        },
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(`Property node property1 ref property2 does not exist`);
    });

    it('should succeed when a NestedObject propertyRef does resolve', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: {minItems: 0, maxItems: 1} }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: {
            type: 'NestedObject',
            propertyRefs: [{ ref: 'property2', cardinality: {minItems: 0, maxItems: 1} }]
          }
        },
        {
          type: 'Property',
          label: 'property2',
          range: { type: 'Text' }
        },
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(null);
    });

    it('should succeed when a NestedObject propertyRef does resolve with a recursive strucrure', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: {minItems: 0, maxItems: 1} }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: {
            type: 'NestedObject',
            propertyRefs: [{ ref: 'property2', cardinality: {minItems: 0, maxItems: 1} }]
          }
        },
        {
          type: 'Property',
          label: 'property2',
          range: {
            type: 'NestedObject',
            propertyRefs: [{ ref: 'property1', cardinality: {minItems: 0, maxItems: 1} }]
          }
        },
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(null);
    });

    it('should pass when a property linked class resolves', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: {minItems: 0, maxItems: 1} }]
        },
        {
          type: 'Class',
          label: 'class2',
          propertyRefs: [{ ref: 'property1', cardinality: {minItems: 0, maxItems: 1} }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: {
            type: 'LinkedClass',
            ref: 'class2'
          }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(null);
    });

    it('should pass when a property linked class is a uid', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: {minItems: 0, maxItems: 1} }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: {
            type: 'LinkedClass',
            ref: 'https://www.schesign.com/u/user/design/1.0.0/property/pname'
          }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(null);
    });

    it('should fail when a property linked class does not resolve', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: {minItems: 0, maxItems: 1} }]
        },
        {
          type: 'Class',
          label: 'class2',
          propertyRefs: [{ ref: 'property1', cardinality: {minItems: 0, maxItems: 1} }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: {
            type: 'LinkedClass',
            ref: 'class3'
          }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(`In property property1 could not resolve ref class3`);
    });
  });
});
