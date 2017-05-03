import { expect } from 'chai'
import {
  validatePropertySpec,
  validatePropertySpecs,
  validateRange,
  validateClassNode,
  validatePropertyNode,
  validateGraph
} from '../../src/validate'

const { describe, it } = global

function _validate (func, elem, result) {
  const mess = result && `"${result}"`
  it(`Error ${mess} for: ${JSON.stringify(elem)}`, () => {
    const err = func(elem)
    expect(err).to.equal(result)
  })
}

const SPEC_TYPES = 'ref, minItems, maxItems, index, primaryKey'

describe('validate/graph', () => {
  describe('validatePropertySpec()', () => {
    const fail = [
      [null, 'must be an object'],
      [{}, 'ref is required'],
      [{ref: 1}, 'ref is required'],
      [{ref: 'one', hello: true}, `hello is invalid. Must be one of: ${SPEC_TYPES}`],
      [{ref: 'one', minItems: '1'}, 'minItems must be a number'],
      [{ref: 'one', maxItems: '1'}, 'maxItems must be a number or null'],
      [{ref: 'one', maxItems: 'null'}, 'maxItems must be a number or null'],
      [{ref: 'one', primaryKey: null}, 'primaryKey must be boolean']
    ]

    const success = [
      {ref: 'label'},
      {ref: 'u/user_a'},
      {ref: 'u/user_a/design_a/property/a'},
      {ref: 'u/user_a/design_a/class/a'},
      {ref: 'label', minItems: 1, maxItems: 1},
      {ref: 'label', minItems: 1, maxItems: null},
      {ref: 'label', primaryKey: true},
      {ref: 'label', primaryKey: false}
    ]

    fail.forEach(elems => _validate(validatePropertySpec, elems[0], elems[1]))
    success.forEach(elem => _validate(validatePropertySpec, elem, null))
  })
  describe('validatePropertySpecs()', () => {
    const fail = [
      [ [{ref1: 'a'}], 'propertySpecs[0].ref is required' ],
      [ [{ref: 'a', minItems: 'hello'}], 'propertySpecs.a.minItems must be a number' ],
      [ [{ref: 'a'}, {ref: 'a'}], 'propertySpecs.a was repeated' ]
    ]
    const success = [
      [],
      [{ref: 'a'}, {ref: 'b'}]
    ]

    fail.forEach(elems => _validate(validatePropertySpecs, elems[0], elems[1]))
    success.forEach(elem => _validate(validatePropertySpecs, elem, null))
  })
  describe('validateRange()', () => {
    const fail = [
      ['hello', 'type is required', 'sdsd'],
      [{}, 'type is required'],
      [{type: 'Awesome'}, 'type.Awesome is invalid. Must be one of: Boolean, Text, Number, Date, Enum, NestedObject, LinkedClass'],
      [{type: 'Text', hello: null}, 'hello is invalid. Must be one of: type, format, minLength, maxLength, regex'],
      [{type: 'Text', minItems: '4'}, 'minItems is invalid. Must be one of: type, format, minLength, maxLength, regex'],
      [{type: 'Text', minLength: '4'}, 'minLength must be a number'],
      [{type: 'Text', regex: null}, 'regex must be a string'],
      [{type: 'Number', minLength: 3}, 'minLength is invalid. Must be one of: type, format, min, max'],
      [{type: 'Enum', minItems: 2}, 'minItems is invalid. Must be one of: type, values'],
      [{type: 'Enum'}, 'values is required for Enum'],
      [{type: 'LinkedClass'}, 'ref should be a string for LinkedClass'],
      [{type: 'LinkedClass', ref: 2}, 'ref should be a string for LinkedClass'],
      [{type: 'NestedObject', properties: []}, 'properties is invalid. Must be one of: type, propertySpecs'],
      [{type: 'NestedObject', propertySpecs: [{}]}, 'propertySpecs[0].ref is required'],
      [{type: 'NestedObject', propertySpecs: [{ref: 'a', hello: 'ss'}]}, `propertySpecs.a.hello is invalid. Must be one of: ${SPEC_TYPES}`]
    ]

    const success = [
      {type: 'Text'},
      {type: 'Text', regex: '[a-z]', minLength: 1, maxLength: 2},
      {type: 'Text', format: 'Url'},
      {type: 'Text', format: 'Email'},
      {type: 'Text', format: 'Url', regex: '[a-z]', minLength: 1},
      {type: 'Number'},
      {type: 'Number', min: 0, max: 1},
      {type: 'Number', format: 'Int', min: 0, max: 1},
      {type: 'Number', format: 'Int8'},
      {type: 'Number', format: 'Int16'},
      {type: 'Number', format: 'Int32'},
      {type: 'Number', format: 'Int64'},
      {type: 'Number', format: 'Float32'},
      {type: 'Number', format: 'Float64'},
      {type: 'NestedObject'},
      {type: 'NestedObject', propertySpecs: []},
      {type: 'LinkedClass', ref: 'hello'},
      {type: 'NestedObject', propertySpecs: [{ref: 'a'}]}
    ]

    fail.forEach(elems => _validate(validateRange, elems[0], elems[1]))
    success.forEach(elem => _validate(validateRange, elem, null))
  })
  describe('validateClassNode()', () => {
    const fail = [
      [{}, 'type must be "Class"'],
      [{fish: 'Class'}, 'type must be "Class"'],
      [{type: 'Class', awesome: 'a'}, 'awesome is invalid. Must be one of: type, label, description, subClassOf, propertySpecs, excludeParentProperties'],
      [{type: 'Class', range: 'a'}, 'range is invalid. Must be one of: type, label, description, subClassOf, propertySpecs, excludeParentProperties'],
      [{type: 'Class'}, 'label must be a string'],
      [{type: 'Class', label: 'a a'}, 'label.a a can only have letters, numbers, or underscores'],
      [{type: 'Class', label: 'a', description: 3}, 'description must be a string'],
      [{type: 'Class', label: 'a', subClassOf: 3}, 'subClassOf must be a string'],
      [{type: 'Class', label: 'a', propertySpecs: 'sdsd'}, 'propertySpecs[0].ref is required'],
      [{type: 'Class', label: 'a', propertySpecs: [{ref: 'a', hello: 'ss'}]}, `propertySpecs.a.hello is invalid. Must be one of: ${SPEC_TYPES}`],
      [{type: 'Class', label: 'a', excludeParentProperties: 2}, `excludeParentProperties should be an array`]
    ]

    const success = [
      {type: 'Class', label: 'a'},
      {type: 'Class', label: 'a', description: 'cool'},
      {type: 'Class', label: 'a', propertySpecs: []},
      {type: 'Class', label: 'a', propertySpecs: [{ref: 'b'}]},
      {type: 'Class', label: 'a', excludeParentProperties: ['s']}
    ]

    fail.forEach(elems => _validate(validateClassNode, elems[0], elems[1]))
    success.forEach(elem => _validate(validateClassNode, elem, null))
  })

  describe('validatePropertyNode()', () => {
    const fail = [
      [{}, 'type must be "Property"'],
      [{fish: 'Property'}, 'type must be "Property"'],
      [{type: 'Property', awesome: 'a a'}, 'awesome is invalid. Must be one of: type, label, description, propertySpecs, range'],
      [{type: 'Property'}, 'label must be a string'],
      [{type: 'Property', label: 'a a'}, 'label.a a can only have letters, numbers, or underscores'],
      [{type: 'Property', label: 'hello'}, 'range is required'],
      [{type: 'Property', label: 'a', description: 3}, 'description must be a string'],
      [{type: 'Property', label: 'a', range: 4}, 'type is required']
    ]

    const success = [
      {type: 'Property', label: 'a', range: {type: 'Text'}},
      {type: 'Property', label: 'a', range: {type: 'Text'}, description: 'cool'}
    ]

    fail.forEach(elems => _validate(validatePropertyNode, elems[0], elems[1]))
    success.forEach(elem => _validate(validatePropertyNode, elem, null))
  })

  describe.skip('validateGraph()', () => {
    it('should fail when an array is not passed in', () => {
      const err = validateGraph({})
      expect(err).to.equal('Graph must be an array of class and property nodes')
    })

    it('should fail if a bad node type is passed in', () => {
      const err = validateGraph([
        { type: 'hello' }

      ])
      expect(err).to.equal('Node type must be either "Class" or "Property"')
    })

    it('should fail when class labels are duplicated', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'one', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'one', cardinality: { minItems: 0, maxItems: 1 } }]
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal('Class node (after becoming lowercase) is not unique: class1')
    })

    it('should fail when class labels are duplicated (case insensitive)', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'one', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Class',
          label: 'Class1',
          propertyRefs: [{ ref: 'one', cardinality: { minItems: 0, maxItems: 1 } }]
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal('Class node (after becoming lowercase) is not unique: class1')
    })

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
      expect(err).to.equal('Property node (after becoming lowercase) is not unique: property1')
    })

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
      expect(err).to.equal('Property node (after becoming lowercase) is not unique: property1')
    })

    it('should pass when a class propertyRef is an external url', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{
            ref: 'https://www.schesign.com/u/user/design/1.0.0/property/pname',
            cardinality: { minItems: 0, maxItems: 1 }
          }]
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(null)
    })

    it('should fail when a class propertyRef does not resolve', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property2', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: { type: 'Text' }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal('Class node class1 ref property2 does not exist')
    })

    it('should pass even when ref case does not match', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'PROPERTY1', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: { type: 'Text' }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(null)
    })

    it('should fail when a NestedObject propertyRef does not resolve', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: {
            type: 'NestedObject',
            propertyRefs: [{ ref: 'property2', cardinality: { minItems: 0, maxItems: 1 } }]
          }
        },
        {
          type: 'Property',
          label: 'property3',
          range: { type: 'Text' }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal('Property node property1 ref property2 does not exist')
    })

    it('should succeed when a NestedObject propertyRef does resolve', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: {
            type: 'NestedObject',
            propertyRefs: [{ ref: 'property2', cardinality: { minItems: 0, maxItems: 1 } }]
          }
        },
        {
          type: 'Property',
          label: 'property2',
          range: { type: 'Text' }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(null)
    })

    it('should succeed when a NestedObject propertyRef does resolve with a recursive strucrure', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: {
            type: 'NestedObject',
            propertyRefs: [{ ref: 'property2', cardinality: { minItems: 0, maxItems: 1 } }]
          }
        },
        {
          type: 'Property',
          label: 'property2',
          range: {
            type: 'NestedObject',
            propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
          }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(null)
    })

    it('should pass when a property linked class resolves', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Class',
          label: 'class2',
          propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
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
      expect(err).to.equal(null)
    })

    it('should pass when a property linked class is a uid', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
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
      expect(err).to.equal(null)
    })

    it('should fail when a property linked class does not resolve', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Class',
          label: 'class2',
          propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
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
      expect(err).to.equal('In property property1 could not resolve ref class3')
    })

    it('should pass when a class subClassOf resolves', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Class',
          label: 'class2',
          subClassOf: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: { type: 'Text' }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal(null)
    })

    it('should fail when a class subClassOf does not resolve', () => {
      const graph = [
        {
          type: 'Class',
          label: 'class1',
          propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Class',
          label: 'class2',
          subClassOf: 'class3',
          propertyRefs: [{ ref: 'property1', cardinality: { minItems: 0, maxItems: 1 } }]
        },
        {
          type: 'Property',
          label: 'property1',
          range: { type: 'Text' }
        }
      ]
      const err = validateGraph(graph)
      expect(err).to.equal('In Class class2 could not resolve subClassOf class3')
    })
  })
})
// _validate()

// describe('graph validation functions', () => {
//   describe('validatePropertyRef()', () => {
//     const fail = [
//       [null, 'must be an object'],
//       [{}, 'ref is required'],
//       [{ref: 1}, 'ref is required'],
//       [{ref: 1}, 'ref is required'],
//       [{ref: 'one', minItems: '1'}, 'minItems must be a number']
//     ]
//     const succeed = [
//       {ref: 'label'},
//       {ref: 'label', minItems: 1, maxItems: 1},
//       {ref: 'label', minItems: 1, maxItems: null},
//       {ref: 'u/user_a'},
//       {ref: 'u/user_a/design_a/property/a'},
//       {ref: 'u/user_a/design_a/class/a'}
//     ]
//     it('should pass all cases', () => {
//       fail.forEach(el => {
//         const err = validatePropertySpec(el[0])
//         expect(err).to.equal(el[1])
//       })
//     })
//   })
//   succeed.forEach(el => {
//     const err = validatePropertySpec(el)
//     it('hello', () => {

//     })
//     expect(err).to.equal(null)
//   })
  // })
