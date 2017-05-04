import isNumber from 'lodash/isNumber'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'
import isBoolean from 'lodash/isBoolean'
import * as constants from '../constants'
import { validateNodeLabel } from './labels'
import { validatePropertyUid, validateClassUid } from './uids'
import { reduceUid } from '../utils'

/* Cardinality helpers */
export function validateCardinality (cardinality) {
  throw new Error('Deprecated: validateCardinality')
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
  if (err) return err

  if ('minItems' in propertySpec && !isNumber(propertySpec.minItems)) {
    return 'minItems must be a number'
  }
  if ('maxItems' in propertySpec && !isNumber(propertySpec.maxItems) && propertySpec.maxItems !== null) {
    return 'maxItems must be a number or null'
  }
  if ('primaryKey' in propertySpec && !isBoolean(propertySpec.primaryKey)) {
    return 'primaryKey must be boolean'
  }
  if ('unique' in propertySpec && !isBoolean(propertySpec.unique)) {
    return 'unique must be boolean'
  }
  return null
}

export function validatePropertySpecs (propertySpecs) {
  if (!isArray(propertySpecs)) {
    return 'propertySpecs is required and must be an array'
  }
  const found = {}
  let primaryKeyDeclared = false

  let index = -1
  for (const propertySpec of propertySpecs) {
    index++

    const ref = propertySpec.ref
    const path = 'propertySpecs' + (ref ? `.${ref}` : `[${index}]`)

    if (found[ref]) {
      return `${path} was repeated`
    }
    found[ref] = true

    const err = validatePropertySpec(propertySpec)
    if (err) {
      return `${path}.${err}`
    }

    if ('primaryKey' in propertySpec && propertySpec.primaryKey) {
      if (primaryKeyDeclared) {
        return `${path}.primaryKey can't be declarred. There can be only one primary key.`
      }
      primaryKeyDeclared = true
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
  if (err) return err

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

  if (range.type === 'NestedObject') {
    err = validatePropertySpecs(range.propertySpecs)
    if (err) return err
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
  if (err) return err

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

  err = validatePropertySpecs(classNode.propertySpecs)
  if (err) return err

  if ('excludeParentProperties' in classNode) {
    if (!isArray(classNode.excludeParentProperties)) {
      return 'excludeParentProperties should be an array'
    }
    for (const parentProp of classNode.excludeParentProperties) {
      if (!isString(parentProp)) {
        return 'excludeParentProperties should be an array of strings'
      }
    }
  }
  return null
}

function _checkReference (type, cache, ref) {
  const lowerRef = ref.toLowerCase()
  const isUid = lowerRef.indexOf('u/') > -1 || lowerRef.indexOf('o/') > -1
  if (isUid) {
    const func = type === 'Class'
      ? validateClassUid
      : validatePropertyUid

    const err = func(lowerRef)
    if (err) return `${lowerRef} ${err}`

    const reduced = reduceUid(lowerRef)
    if (reduced.versionLabel === 'master') {
      return `${lowerRef} should not reference a master version`
    }
  } else if (!cache[lowerRef]) {
    return `"${ref}" has not been declared as a ${type}`
  }
  return null
}

const _checkClassReference = (context, ref) => _checkReference('Class', context.classes, ref)
const _checkPropertyReference = (context, ref) => _checkReference('Property', context.properties, ref)

function _checkPropertySpecs (context, propertySpecs) {
  if (!isArray(propertySpecs)) return
  let index = -1
  for (const propretySpec of propertySpecs) {
    index++
    const err = _checkPropertyReference(context, propretySpec.ref)
    if (err) return `propertySpecs[${index}].ref ${err}`
  }
  return null
}

function _checkRefsInProperties (context) {
  for (const key of Object.keys(context.properties)) {
    const propertyNode = context.properties[key]
    const location = `Property.${propertyNode.label}.`

    if (propertyNode.range.type === 'LinkedClass') {
      const err = _checkClassReference(context, propertyNode.range.ref)
      if (err) return `${location}range.ref ${err}`
    }

    if (propertyNode.range.type === 'NestedObject') {
      const err = _checkPropertySpecs(context, propertyNode.range.propertySpecs)
      if (err) return `${location}${err}`
    }
  }
  return null
}

/* Ensure propertySpecs and subClassOf resolve */
function _checkRefsInClasses (context) {
  for (const key of Object.keys(context.classes)) {
    const classNode = context.classes[key]
    const location = `Class.${classNode.label}.`

    let err = _checkPropertySpecs(context, classNode.propertySpecs)
    if (err) return `${location}${err}`

    if (classNode.subClassOf) {
      err = _checkClassReference(context, classNode.subClassOf)
      if (err) {
        return `${location}subClassOf ${err}`
      }
    }

    if (classNode.excludeParentProperties) {
      for (const parentProp of classNode.excludeParentProperties) {
        err = _checkPropertyReference(context, parentProp)
        if (err) return err
      }
    }
  }
}

function _fillContext (context, graph) {
  let index = -1
  for (const node of graph) {
    index++
    const nodeLabel = node.label && node.label.toLowerCase()

    let cache, validateFunc

    if (node.type === constants.CLASS) {
      cache = context.classes
      validateFunc = validateClassNode
    } else if (node.type === constants.PROPERTY) {
      cache = context.properties
      validateFunc = validatePropertyNode
    } else {
      return `graph[${index}].type must be "${constants.CLASS}" or "${constants.PROPERTY}"`
    }

    const location = node.label
      ? `${node.type}.${node.label}.`
      : `graph[${index}].`

    const err = validateFunc(node)
    if (err) return location + err

    if (cache[nodeLabel]) {
      return `${location}label "${node.label}" is declared more then once (label is case insensitive)`
    }
    cache[nodeLabel] = node
  }
  return null
}

export function validateGraph (graph, opts = {}) {
  if (!isArray(graph)) {
    return 'Graph must be an array of class and property nodes'
  }

  const context = {
    classes: {},
    properties: {}
  }

  let err = _fillContext(context, graph)
  if (err) return err

  err = _checkRefsInClasses(context)
  if (err) return err

  err = _checkRefsInProperties(context)
  if (err) return err

  return null
}
