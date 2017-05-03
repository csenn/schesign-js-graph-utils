import isNumber from 'lodash/isNumber'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import * as constants from '../constants'
import { validateNodeLabel } from './labels'
import { validatePropertyUid, validateClassUid, validateUid } from './uids'

/* Cardinality helpers */
export function validateCardinality (cardinality) {
  throw new Error('Deprecated: validateCardinality')

  // const err = 'Bad Cardinality. Must be in format {minItems: [num], maxItems: [num || null]}'
  // if (!cardinality) {
  //   return err
  // } else if (!isNumber(cardinality.minItems)) {
  //   return err
  // } else if (cardinality.maxItems !== null && !isNumber(cardinality.maxItems)) {
  //   return err
  // }
  // return null
}

function _ensureAllowedKeys (keys, allowed) {
  for (const key of keys) {
    if (!allowed.includes(key)) {
      return `${key} is invalid. Must be one of: ${allowed.join(', ')}`
    }
  }
  return null
}

export function validatePropertySpec (propertySpec) {
  if (!propertySpec) {
    return 'must be an object'
  }
  if (!isString(propertySpec.ref) || !propertySpec.ref.length) {
    return 'ref is required'
  }

  const err = _ensureAllowedKeys(Object.keys(propertySpec), constants.PROPERTY_SPEC_KEYS)
  if (err) {
    return `${err}`
  }

  if ('minItems' in propertySpec && !isNumber(propertySpec.minItems)) {
    return 'minItems must be a number'
  }
  if ('maxItems' in propertySpec && !isNumber(propertySpec.maxItems) && propertySpec.maxItems !== null) {
    return 'maxItems must be a number or null'
  }
  if ('primaryKey' in propertySpec && !isBoolean(propertySpec.primaryKey)) {
    return 'primaryKey must be boolean'
  }
  return null
}

export function validatePropertySpecs (propertySpecs) {
  const found = {}
  let index = -1
  for (const propertySpec of propertySpecs) {
    index++
    let location = 'propertySpecs'
    location += propertySpec.ref ? `.${propertySpec.ref}` : `[${index}]`
    if (found[propertySpec.ref]) {
      return `${location} was repeated`
    }
    found[propertySpec.ref] = true
    const err = validatePropertySpec(propertySpec)
    if (err) {
      return `${location}.${err}`
    }
  }
  return null
}

const numberTypes = [
  constants.RANGE_MIN_LENGTH,
  constants.RANGE_MAX_LENGTH,
  constants.RANGE_MIN,
  constants.RANGE_MAX
]

export function validateRange (range) {
  const rangeKeys = Object.keys(range)
  if (!range.type) {
    return 'type is required'
  }

  /* Check valid range.type */
  if (!constants.RANGE_TYPES.includes(range.type)) {
    return `type.${range.type} is invalid. Must be one of: ${constants.RANGE_TYPES.join(', ')}`
  }

  /* Check keys are valid for range.type */
  let err = _ensureAllowedKeys(rangeKeys, constants.RANGE_CONSTRAINT_MAPPING[range.type])
  if (err) {
    return err
  }

  if ('format' in range) {
    if (!constants.RANGE_FORMAT_MAPPING[range.type].includes(range.format)) {
      return `format.${range.format} is invalid for type ${range.type}`
    }
  }

  for (const numberType of numberTypes) {
    if (range[numberType] && !isNumber(range[numberType])) {
      return `${numberType} must be a number`
    }
  }

  if ('regex' in range && !isString(range.regex)) {
    return `regex must be a string`
  }

  if (range.type === 'Enum') {
    if (!('values' in range) || !isArray(range.values)) {
      return `values is required for Enum`
    }
  }

  if (range.type === 'LinkedClass') {
    if (!('ref' in range) || !isString(range.ref)) {
      return `ref should be a string for LinkedClass`
    }
  }

  if (range.type === 'NestedObject' && 'propertySpecs' in range) {
    err = validatePropertySpecs(range.propertySpecs)
    if (err) {
      return err
    }
  }

  return null
}

function _validateNode (node) {
  let err = validateNodeLabel(node.label)
  if (err) {
    return err
  }
  if ('description' in node && !isString(node.description)) {
    return 'description must be a string'
  }
  return null
}

export function validatePropertyNode (propertyNode, opts = {}) {
  if (propertyNode.type !== 'Property') {
    return 'type must be "Property"'
  }

  let err = _ensureAllowedKeys(Object.keys(propertyNode), constants.VALID_PROPERTY_KEYS)
  if (err) {
    return err
  }

  err = _validateNode(propertyNode)
  if (err) return err

  if (!('range' in propertyNode)) {
    return 'range is required'
  }

  err = validateRange(propertyNode.range)
  if (err) return err

  return null
}

export function validateClassNode (classNode, opts = {}) {
  if (classNode.type !== 'Class') {
    return 'type must be "Class"'
  }

  let err = _ensureAllowedKeys(Object.keys(classNode), constants.VALID_CLASS_KEYS)
  if (err) {
    return err
  }

  err = _validateNode(classNode)
  if (err) return err

  if ('subClassOf' in classNode && !isString(classNode.subClassOf)) {
    return 'subClassOf must be a string'
  }
  if ('propertySpecs' in classNode) {
    err = validatePropertySpecs(classNode.propertySpecs)
    if (err) return err
  }
  if ('excludeParentProperties' in classNode && !isArray(classNode.excludeParentProperties)) {
    return 'excludeParentProperties should be an array'
  }
  return null
}

// export function validatePropertyNode (propertyNode, opts = {}) {
//   const nodeErr = _validateNode(constants.CLASS, propertyNode, [
//     'uid',
//     'type',
//     'label',
//     'description',
//     'range'
//   ])
//   if (nodeErr) {
//     return nodeErr
//   }
//   const rangeError = validateRange(propertyNode.range, opts)
//   if (rangeError) {
//     return rangeError
//   }
//   return null
// }

export function validateGraph (graph, opts = {}) {
  if (!isArray(graph)) {
    return 'Graph must be an array of class and property nodes'
  }
  const classes = {}
  const properties = {}

  for (const node of graph) {
    if (node.type === constants.CLASS) {
      const err = validateClassNode(node, opts)
      if (err) {
        return err
      }
      const label = node.label.toLowerCase()
      if (classes[label]) {
        return `Class node (after becoming lowercase) is not unique: ${label}`
      }
      classes[label] = node
    } else if (node.type === constants.PROPERTY) {
      const err = validatePropertyNode(node, opts)
      if (err) {
        return err
      }
      const label = node.label.toLowerCase()
      if (properties[label]) {
        return `Property node (after becoming lowercase) is not unique: ${label}`
      }
      properties[label] = node
    } else {
      return 'Node type must be either "Version", "Class", or "Property"'
    }
  }

  /* Use resolved to prevent recursion */
  const resolved = {}
  const resolvePropertyRefs = node => {
    const propertySpecs = node.type === constants.CLASS
      ? node.propertySpecs
      : node.range.propertySpecs

    for (const propertySpec of propertySpecs) {
      const ref = propertySpec.ref.toLowerCase()
      if (resolved[ref]) {
        continue
      }
      resolved[ref] = true
      const uidError = validateUid(ref)
      if (!uidError) {
        continue
      }
      const property = properties[ref]
      if (!property) {
        return `${node.type} node ${node.label} ref ${propertySpec.ref} does not exist`
      }
      if (property.range.type === constants.NESTED_OBJECT) {
        const nestedObjectErr = resolvePropertyRefs(property)
        if (nestedObjectErr) {
          return nestedObjectErr
        }
      }
    }
    return null
  }

  /* Resolve propertySpecs and subClassOf for classNodes */
  for (const key of Object.keys(classes)) {
    const classNode = classes[key]
    const err = resolvePropertyRefs(classNode)
    if (err) {
      return err
    }
    if (classNode.subClassOf) {
      const subClassOf = classNode.subClassOf.toLowerCase()
      const uidError = validateUid(subClassOf)
      if (!uidError) {
        continue
      }
      if (!classes[subClassOf]) {
        return `In Class ${classNode.label} could not resolve subClassOf ${classNode.subClassOf}`
      }
    }
  }

  /* Resolve classIds for properties with linked class range types */
  for (const key of Object.keys(properties)) {
    const propertyNode = properties[key]
    if (propertyNode.range.type === constants.LINKED_CLASS) {
      const ref = propertyNode.range.ref.toLowerCase()
      const uidError = validateUid(ref)
      if (!uidError) {
        continue
      }
      if (!classes[ref]) {
        return `In property ${propertyNode.label} could not resolve ref ${propertyNode.range.ref}`
      }
    }
  }

  return null
}
