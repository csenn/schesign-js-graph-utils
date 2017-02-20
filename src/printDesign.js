import colors from 'colors/safe'
import { NESTED_OBJECT } from './constants'

function getNodeId (node) {
  return node.uid || node.label
}

export function printDesign (design) {
  const classes = []
  const properties = {}

  design.graph.forEach(node => {
    if (node.type === 'Class') {
      classes.push(node)
    }
    if (node.type === 'Property') {
      properties[getNodeId(node)] = node
    }
  })

  /* Prevent recursion for NestedObjects that point to themselves in a chain */
  function printPropertyRefs (propertyRefs, level, didRender) {
    propertyRefs.forEach(propertyRef => {
      const property = properties[propertyRef.ref]
      if (didRender[property.label]) {
        return
      }
      didRender[property.label] = true
      let str = ''
      for (let i=0; i<level; i++) {
        str += '  '
      }
      str += property.label
      str += ' ' + colors.cyan(property.range.type) + ' '
      str += colors.green('min:') + propertyRef.cardinality.minItems + ' '
      str += colors.green('max:') + propertyRef.cardinality.maxItems + ' '

      Object.keys(property.range).forEach(key => {
        if (['type', 'propertyRefs'].includes(key)) {
          return
        }
        str += colors.magenta(key) + ':' + property.range[key] + ' '
      })

      console.log(str)
      if (property.range.type === NESTED_OBJECT) {
        printPropertyRefs(property.range.propertyRefs, level + 1, didRender)
      }
    })
  }

  classes.forEach(classNode => {
    console.log('\n' + colors.bold(classNode.label))
    printPropertyRefs(classNode.propertyRefs, 1, {})
  })
}