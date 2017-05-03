// import { expect } from 'chai'
// import * as constants from '../src/constants'
// import rangeTypes from '../src/rangeTypes'
// import {
//   Design,
//   ClassNode,
//   PropertyNode
// } from '../src/design'

// import createPropertyVariations from './generate/createPropertyVariations'
// import createInheritanceChain1 from './generate/createInheritanceChain1'
// import createInheritanceChain2 from './generate/createInheritanceChain2'
// import createLinkedNodes1 from './generate/createLinkedNodes1'
// import createLinkedNodes2 from './generate/createLinkedNodes2'

// import propertyVariations from 'schesign-graph-examples/graphs/import/propertyVariations'
// import inheritanceChain1 from 'schesign-graph-examples/graphs/import/inheritanceChain1'
// import inheritanceChain2 from 'schesign-graph-examples/graphs/import/inheritanceChain2'
// import linkedNodes1 from 'schesign-graph-examples/graphs/import/linkedNodes1'
// import linkedNodes2 from 'schesign-graph-examples/graphs/import/linkedNodes2'

// const { describe, it } = global

// describe.skip('Generating a design', () => {
//   describe('and creating properties', () => {
//     it('should create a property node with range text', () => {
//       const node = new PropertyNode({
//         label: 'a',
//         range: { type: constants.TEXT }
//       })
//       expect(node.label).to.equal('a')
//       expect(node.range.type).to.equal(constants.TEXT)
//     })
//     it('should fail to create a NestedObject property node', () => {
//       const node = new PropertyNode({
//         label: 'a',
//         range: { type: constants.TEXT }
//       })
//       const nodeB = new PropertyNode({
//         label: 'b',
//         range: { type: constants.TEXT }
//       })
//       try {
//         node.addProperty(nodeB)
//       } catch (err) {
//         expect(err).to.eql(new Error('Must have range NestedObject to add property ref'))
//       }
//     })
//     it('should create a NestedObject property node', () => {
//       const node = new PropertyNode({
//         label: 'a',
//         range: { type: constants.NESTED_OBJECT }
//       })
//       const nodeB = new PropertyNode({
//         label: 'b',
//         range: { type: constants.TEXT }
//       })
//       node.addProperty(nodeB)
//       expect(node.label).to.equal('a')
//       expect(node.range).to.deep.equal({
//         type: constants.NESTED_OBJECT,
//         propertyRefs: [{ ref: nodeB.label, cardinality: { minItems: 0, maxItems: 1 } }]
//       })
//     })
//   })
//   describe('and creating classes', () => {
//     it('should throw when a class is not provided', () => {
//       const d = new Design()
//       try {
//         d.addClass({})
//       } catch (err) {
//         expect(err).to.eql(new Error('Must be an instanceof ClassNode'))
//       }
//     })
//     it('should throw when a class is added with same name', () => {
//       const d = new Design()
//       const class1 = new ClassNode({ label: 'class1' })
//       const class2 = new ClassNode({ label: 'class1' })
//       try {
//         d.addClass(class1)
//         d.addClass(class2)
//       } catch (err) {
//         expect(err).to.eql(new Error('ClassNode has already been added class1'))
//       }
//     })
//     it('should add an empty class node', () => {
//       const design = new Design()
//       const node = new ClassNode({ label: 'classA' })
//       design.addClass(node)
//       expect(node.label).to.equal('classA')
//       expect(design.classes.length).to.equal(1)
//     })
//     it('should add an propertyRef by reference to a class node', () => {
//       const node = new ClassNode({ label: 'classA' })
//       const propNode = new PropertyNode({ label: 'a', range: { type: constants.TEXT } })
//       node.addProperty(propNode)
//       expect(node.propertyRefs.length).to.equal(1)
//       expect(node.propertyRefs[0].ref).to.equal('a')
//       expect(node.propertyRefs[0].cardinality.minItems).to.equal(0)
//       expect(node.propertyRefs[0].cardinality.maxItems).to.equal(1)
//       expect(node.propertyLookup.a).to.equal(propNode)
//     })
//   })
//   describe('and creating full design', () => {
//     it('should output the propertyVariations graph', () => {
//       expect(createPropertyVariations).to.deep.equal(propertyVariations)
//     })
//     it('should output the inheritanceChain1 graph', () => {
//       expect(createInheritanceChain1).to.deep.equal(inheritanceChain1)
//     })
//     it('should output the inheritanceChain2 graph', () => {
//       expect(createInheritanceChain2).to.deep.equal(inheritanceChain2)
//     })
//     it('should output the linkedNodes1 graph', () => {
//       expect(createLinkedNodes1).to.deep.equal(linkedNodes1)
//     })
//     it('should output the linkedNodes2 graph', () => {
//       expect(createLinkedNodes2).to.deep.equal(linkedNodes2)
//     })
//   })
// })
