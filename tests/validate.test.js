import { expect } from 'chai'
import {
  validatePropertySpec,
  validatePropertySpecs,
  validateRange,
  validateClassNode,
  validatePropertyNode,
  validateGraph,
  validateVersionLabel
} from '../src/validate'

const { describe, it } = global

/*
  TODO: should not print strigify here, kind of ugly
  Really should print a message for success
*/
function _validate (func, elem, error) {
  // const mess = result && `"${result}"`
  const message = error
    ? `Error: ${error}`
    : `Success: ${JSON.stringify(elem)}`

  it(message, () => {
    const err = func(elem)
    expect(err).to.equal(error)
  })
}

const SPEC_TYPES = 'ref, required, array, minItems, maxItems, index, primaryKey, unique'

describe('validate', () => {
  describe('validateVersionLabel()', () => {
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
  describe('graph', () => {
    describe('validatePropertySpec()', () => {
      const fail = [
        [null, 'must be an object'],
        [{}, 'ref is required'],
        [{ref: 1}, 'ref is required'],
        [{ref: 'one', hello: true}, `hello is invalid. Must be one of: ${SPEC_TYPES}`],
        [{ref: 'one', required: 'hello'}, `required must be a boolean`],
        [{ref: 'one', array: 'hello'}, `array must be a boolean`],
        [{ref: 'one', array: false, minItems: 0}, `minItems and maxItems are not valid with array=false`],
        [{ref: 'one', array: false, maxItems: 0}, `minItems and maxItems are not valid with array=false`],
        [{ref: 'one', array: true, minItems: 'hello'}, `minItems must be a number`],
        [{ref: 'one', array: true, maxItems: 'hello'}, `maxItems must be a number`],
        [{ref: 'one', array: true, maxItems: null}, `maxItems must be a number`],
        [{ref: 'one', primaryKey: null}, 'primaryKey must be boolean'],
        [{ref: 'one', unique: null}, 'unique must be boolean']
      ]

      const success = [
        {ref: 'label'},
        {ref: 'u/user_a'},
        {ref: 'u/user_a/design_a/property/a'},
        {ref: 'u/user_a/design_a/class/a'},
        {ref: 'u/user_a/design_a/class/a', required: true},
        {ref: 'u/user_a/design_a/class/a', required: false},
        {ref: 'u/user_a/design_a/class/a', array: false},
        {ref: 'u/user_a/design_a/class/a', array: true},
        {ref: 'u/user_a/design_a/class/a', array: true, minItems: 1},
        {ref: 'u/user_a/design_a/class/a', array: true, minItems: 1, maxItems: 100},
        {ref: 'label', primaryKey: true},
        {ref: 'label', primaryKey: false},
        {ref: 'label', unique: true},
        {ref: 'label', unique: false}
      ]

      fail.forEach(elems => _validate(validatePropertySpec, elems[0], elems[1]))
      success.forEach(elem => _validate(validatePropertySpec, elem, null))
    })
    describe('validatePropertySpecs()', () => {
      const fail = [
      [ [{ref1: 'a'}], 'propertySpecs[0].ref is required' ],
      [ [{ref: 'a', required: 'hello'}], 'propertySpecs[0].required must be a boolean' ],
      [ [{ref: 'a'}, {ref: 'a'}], 'propertySpecs[1] "a" was repeated' ],
      [ [{ref: 'a', primaryKey: true}, {ref: 'b', primaryKey: true}], `propertySpecs[1].primaryKey can't be declared. There can be only one primary key.`]
      ]
      const success = [
      [],
      [{ref: 'a'}, {ref: 'b'}],
      [{ref: 'a', primaryKey: true}, {ref: 'b'}]
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
      [{type: 'NestedObject', propertySpecs: [{ref: 'a', hello: 'ss'}]}, `propertySpecs[0].hello is invalid. Must be one of: ${SPEC_TYPES}`]
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
      [{type: 'Class', label: 'a a'}, 'label "a a" can only have letters, numbers, or underscores'],
      [{type: 'Class', label: 'a', description: 3}, 'description must be a string'],
      [{type: 'Class', label: 'a', subClassOf: 3}, 'subClassOf must be null or a string'],
      [{type: 'Class', label: 'a', propertySpecs: 'sdsd'}, 'propertySpecs is required and must be an array'],
      [{type: 'Class', label: 'a', propertySpecs: [{ref: 'a', hello: 'ss'}]}, `propertySpecs[0].hello is invalid. Must be one of: ${SPEC_TYPES}`],
      [{type: 'Class', label: 'a', propertySpecs: [], excludeParentProperties: 2}, `excludeParentProperties should be an array`],
      [{type: 'Class', label: 'a', propertySpecs: [], excludeParentProperties: [2]}, `excludeParentProperties should be an array of strings`]
      ]

      const success = [
      {type: 'Class', label: 'a', propertySpecs: []},
      {type: 'Class', label: 'a', propertySpecs: [], description: 'cool'},
      {type: 'Class', label: 'a', propertySpecs: [], description: ''},
      {type: 'Class', label: 'a', propertySpecs: [], subClassOf: 'a'},
      {type: 'Class', label: 'a', propertySpecs: [], subClassOf: null},
      {type: 'Class', label: 'a', propertySpecs: [{ref: 'b'}]},
      {type: 'Class', label: 'a', propertySpecs: [], excludeParentProperties: ['s']}
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
      [{type: 'Property', label: 'a a'}, 'label "a a" can only have letters, numbers, or underscores'],
      [{type: 'Property', label: 'hello'}, 'range is required'],
      [{type: 'Property', label: 'a', description: 3}, 'description must be a string'],
      [{type: 'Property', label: 'a', range: 4}, 'type is required']
      ]

      const success = [
      {type: 'Property', label: 'a', range: {type: 'Text'}},
      {type: 'Property', label: 'a', description: 'hello', range: {type: 'Text'}},
      {type: 'Property', label: 'a', description: '', range: {type: 'Text'}}
      ]

      fail.forEach(elems => _validate(validatePropertyNode, elems[0], elems[1]))
      success.forEach(elem => _validate(validatePropertyNode, elem, null))
    })

    describe('validateGraph()', () => {
      const fail = [
      [{}, 'Graph must be an array of class and property nodes'],
      [[{type: 'hello'}], 'graph[0].type must be "Class" or "Property"'],
        [
        [{type: 'Class', label: null}],
          'graph[0].label must be a string'
        ],
        [
        [{type: 'Class', label: 'a A'}],
          'Class.a A.label "a A" can only have letters, numbers, or underscores'
        ],
        [
        [{type: 'Property', label: null}],
          'graph[0].label must be a string'
        ],
        [
        [{type: 'Property', label: 'a'}],
          'Property.a.range is required'
        ],
        [
        [{type: 'Class', propertySpecs: [], label: 'a'}, {type: 'Class', label: 'A', propertySpecs: []}],
          'Class.A.label "A" is declared more then once (label is case insensitive)'
        ],
        [
        [{type: 'Property', label: 'a', range: {type: 'Text'}}, {type: 'Property', label: 'A', range: {type: 'Text'}}],
          'Property.A.label "A" is declared more then once (label is case insensitive)'
        ],
        [
        [{type: 'Class', label: 'a', propertySpecs: [], subClassOf: 'b'}],
          'Class.a.subClassOf "b" has not been declared as a Class'
        ],
        [
        [{type: 'Class', label: 'a', propertySpecs: [{ref: 'b'}]}],
          'Class.a.propertySpecs[0].ref "b" has not been declared as a Property'
        ],
        [
        [{type: 'Property', label: 'a', range: { type: 'NestedObject', propertySpecs: [{ref: 'b'}] }}],
          'Property.a.propertySpecs[0].ref "b" has not been declared as a Property'
        ],
        [
        [{type: 'Property', label: 'a', range: { type: 'LinkedClass', ref: 'b' }}],
          'Property.a.range.ref "b" has not been declared as a Class'
        ],
        [
        [{type: 'Class', label: 'a', propertySpecs: [{ref: 'u/user_a/design_a'}]}],
          'Class.a.propertySpecs[0].ref u/user_a/design_a uid is not of type "PropertyUid"'
        ],
        [
        [{type: 'Class', label: 'a', propertySpecs: [{ref: 'u/user_a/design_a/master/class/class1'}]}],
          'Class.a.propertySpecs[0].ref u/user_a/design_a/master/class/class1 uid is not of type "PropertyUid"'
        ],
        [
        [{type: 'Class', label: 'a', propertySpecs: [], excludeParentProperties: ['at']}],
          '"at" has not been declared as a Property'
        ]
      ]

      const success = [
      // Property Spec
        [
          {type: 'Class', label: 'a', propertySpecs: [{ref: 'a'}]},
          {type: 'Property', label: 'a', range: {type: 'Text'}}
        ],
      // uid
        [
          {type: 'Class', label: 'a', propertySpecs: [{ref: 'u/user_a/design_a/1.0.0/property/s'}]}
        ],
      // SubClassOf
        [
          {type: 'Class', label: 'A', propertySpecs: [], subClassOf: 'B'},
          {type: 'Class', label: 'B', propertySpecs: []}
        ],
      // LinkedClass
        [
          {type: 'Class', label: 'A', propertySpecs: []},
          {type: 'Property', label: 'a', range: {type: 'LinkedClass', ref: 'A'}}
        ],
      // NestedObject
        [
          {type: 'Property', label: 'a', range: {type: 'NestedObject', propertySpecs: [{ref: 'b'}]}},
          {type: 'Property', label: 'b', range: {type: 'Text'}}
        ],
      // Recursion
        [
          {type: 'Property', label: 'a', range: {type: 'NestedObject', propertySpecs: [{ref: 'a'}]}}
        ]
      ]

      fail.forEach(elems => _validate(validateGraph, elems[0], elems[1]))
      success.forEach(elem => _validate(validateGraph, elem, null))
    })
  })
})
