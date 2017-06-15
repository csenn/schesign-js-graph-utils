import colors from 'colors/safe'
import { NESTED_OBJECT } from './constants'

export function printDesign (design, opts = {}) {
  const classes = []
  const properties = []
  const propertyMap = {}

  design.graph.forEach(node => {
    if (node.type === 'Class') {
      classes.push(node)
    }
    if (node.type === 'Property') {
      properties.push(node)
      propertyMap[node.uid || node.label] = node
    }
  })

  function printRange (range) {
    let str = ' ' + colors.cyan(range.type) + ' '
    Object.keys(range).forEach(key => {
      if (['type', 'propertySpecs'].includes(key)) {
        return
      }
      str += colors.magenta(key) + ':' + range[key] + ' '
    })
    return str
  }

  /* Prevent recursion for NestedObjects that point to themselves in a chain */
  function printPropertyRefs (propertySpecs, level, didRender) {
    propertySpecs.forEach(propertySpec => {
      const property = propertyMap[propertySpec.ref]
      if (didRender[property.label]) {
        return
      }
      didRender[property.label] = true
      let str = ''
      for (let i = 0; i < level; i++) {
        str += '  '
      }
      str += property.label
      str += printRange(property.range)
      str += colors.green('min:') + propertySpec.minItems + ' '
      str += colors.green('max:') + propertySpec.maxItems + ' '

      console.log(str)
      if (property.range.type === NESTED_OBJECT) {
        printPropertyRefs(property.range.propertySpecs, level + 1, didRender)
      }
    })
  }

  console.log('\n' + colors.bold('------ Notes ------'))
  console.log(' - SubClasses do show properties of parents')

  console.log('\n' + colors.bold('------ Classes ------'))
  classes.forEach(classNode => {
    let classLabel = colors.bold(classNode.label)
    if (classNode.subClassOf) {
      classLabel += ' inherits from ' + colors.magenta(classNode.subClassOf)
    }
    console.log(classLabel)
    printPropertyRefs(classNode.propertySpecs, 1, {})
    console.log('')
  })

  console.log('\n' + colors.bold('------ Properties ------'))
  properties.forEach(propertyNode => {
    let propertyLabel = colors.bold(propertyNode.label)
    propertyLabel += printRange(propertyNode.range)
    console.log(propertyLabel)
  })
}
