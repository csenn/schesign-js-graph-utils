import { expect } from 'chai';
import * as constants from '../src/index'
import {
  Design,
  ClassNode,
  PropertyNode
} from '../src/design'

const { describe, it } = global;

describe('Generating a design', () => {
  let design = new Design()
  describe('and creating properties', () => {
    it ('should create a property node', () => {
      const node = new PropertyNode({
        label: 'a'
      })
      expect(node.label).to.equal('a')
      expect(node.range).to.deep.equal({})
    })
    it ('should create a property node with range text', () => {
      const node = new PropertyNode({
        label: 'a',
        range: { type: constants.TEXT }
      })
      expect(node.label).to.equal('a')
      expect(node.range.type).to.equal(constants.TEXT)
    })
  })
  describe('and creating classes', () => {
    it ('should throw when a class is not provided', () => {
      const d = new Design()
      try {
        d.addClassNode({})
      } catch (err) {
        expect(err).to.eql(new Error('Must be an instanceof ClassNode'));
      }
    })
    it ('should add an empty class node', () => {
      const node = new ClassNode({ label: 'classA' })
      design.addClassNode(node)
      expect(node.label).to.equal('classA')
      expect(design.graph.length).to.equal(1)
    })
    it ('should add an propertyRef by reference to a class node', () => {
      const node = new ClassNode({ label: 'classA' })
      const propNode = new PropertyNode({ label: 'a' })
      node.addPropertyRef(propNode)
      expect(node.propertyRefs.length).to.equal(1)
      expect(node.propertyRefs[0].ref).to.equal('a')
      expect(node.propertyRefs[0].cardinality.minItems).to.equal(0)
      expect(node.propertyRefs[0].cardinality.maxItems).to.equal(1)
      expect(node.propertyLookup.a).to.equal(propNode)
    })
  })
  describe('and creating full design', () => {
    it ('should output a json version of the graph', () => {
      const design = new Design()
      const classA = new ClassNode({ label: 'classA' })
      const classB = new ClassNode({ label: 'classB' })
      const propA = new PropertyNode({ label: 'a', range: { type: constants.TEXT } })
      const propB = new PropertyNode({ label: 'b', range: { type: constants.TEXT } })
      const propC = new PropertyNode({ label: 'c', range: { type: constants.TEXT } })
      classA.addPropertyRef(propA)
      classA.addPropertyRef(propB)
      classB.addPropertyRef(propC)
      classB.addPropertyRef(propB)
      design.addClassNode(classA)
      design.addClassNode(classB)

      const result = design.toJSON()

      console.log(JSON.stringify(result, null, 4))

      expect(result).to.deep.equal({
        graph: [
          {
            label: 'classA',
            type: 'Class',
            subClassOf: null,
            description: null,
            propertyRefs: [
              { ref: 'a', cardinality: { minItems: 0, maxItems: 1} },
              { ref: 'b', cardinality: { minItems: 0, maxItems: 1} }
            ]
          },
          {
            label: 'classB',
            type: 'Class',
            subClassOf: null,
            description: null,
            propertyRefs: [
              { ref: 'c', cardinality: { minItems: 0, maxItems: 1} },
              { ref: 'b', cardinality: { minItems: 0, maxItems: 1} }
            ]
          },
          {
            label: 'a',
            type: 'Property',
            description: null,
            range: {
              type: 'Text'
            }
          },
          {
            label: 'b',
            type: 'Property',
            description: null,
            range: {
              type: 'Text'
            }
          },
          {
            label: 'c',
            type: 'Property',
            description: null,
            range: {
              type: 'Text'
            }
          }
        ]
      })
    })
  })
})