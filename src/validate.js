import { isNumber, isArray, isString, isFinite } from 'lodash';
import { reduceUid, createUid } from './utils'
import * as constants from './constants'

const LETTERS_NUMBERS_UNDERSCORE = /^[a-zA-Z0-9_]+$/
const LETTERS_NUMBERS_UNDERSCORE_DASH = /^[a-zA-Z0-9_-]+$/

export function validateDesignLabel(label) {
  if (!isString(label)) {
    return 'Label must be a string'
  }
  if (!LETTERS_NUMBERS_UNDERSCORE_DASH.test(label)) {
    return 'Label can only have letters, numbers, underscores, or dashes'
  }
  return null
}

export function validateNodeLabel(label) {
  if (!isString(label)) {
    return 'Label must be a string'
  }
  if (!LETTERS_NUMBERS_UNDERSCORE.test(label)) {
    return 'Label can only have letters, numbers, or underscores'
  }
  return null
}

export function validateVersionLabel(label) {
  if (!isString(label)) {
    return 'Label must be a string'
  }
  if (label === 'master') {
    return null
  }

  const split = label.split('.')
  const ERROR_MESSAGE = 'Label should be of format *.*.*'
  if (split.length !== 3) {
    return ERROR_MESSAGE
  }
  for (let el of split) {
    console.log(el, parseInt(el), isNumber(parseInt(el)))
    if (!isFinite(parseInt(el))) {
      return ERROR_MESSAGE
    }
  }
  return null
}

/* This will work for now */
export function validateUid(uid) {
  try {
    const reduced = reduceUid(uid)
    const finalUid = createUid(reduced)
  } catch(err) {
    return err.toString()
  }
  return null
}

export function validateReducedUid(reduced) {
  const {
    ownerType,
    userOrOrg,
    designName,
    versionLabel,
    resourceType,
    classOrProperty,
  } = reduced;

  if (ownerType !== 'u' && ownerType !== 'o') {
    return 'Key ownerType, must be "u" or "o"'
  }
  if (!userOrOrg) {
    return 'Key userOrOrg, must be provided'
  }

  if (designName) {
    const designError = validateDesignLabel(designName)
    if (designError) {
      return designError
    }
    if (versionLabel) {
      if (resourceType) {
        if (resourceType !== 'class' && resourceType !== 'property') {
          return 'Bad resourceType, must be "class" or "property"'
        }
        if (!classOrProperty) {
          return 'Option classOrProperty required with resourceType'
        }
        const classError = validateNodeLabel(classOrProperty)
        if (classError) {
          return classError
        }
      }
    }
  }

  return null
}

/* Cardinality helpers */
export function validateCardinality(cardinality) {
  const err = 'Bad Cardinality. Must be in format {minItems: [num], maxItems: [num || null]}';
  if (!cardinality) {
    return err;
  } else if (Object.keys(cardinality).length > 2) {
    return err;
  } else if (!isNumber(cardinality.minItems)) {
    return err;
  } else if (cardinality.maxItems !== null && !isNumber(cardinality.maxItems)) {
    return err;
  }
  return null;
}

/* Todo: check for index, foreign, etc when added */
export function validatePropertyRef (propertyRef) {
  const err = validateCardinality(propertyRef.cardinality)
  if (err) {
    return err
  }
  return null
}

/* Range Helpers */
const textFormats = [
  constants.TEXT_URL,
  constants.TEXT_EMAIL,
  constants.TEXT_HOSTNAME,
];


const numberFormats = [
  constants.NUMBER_INT,
  constants.NUMBER_INT_8,
  constants.NUMBER_INT_16,
  constants.NUMBER_INT_32,
  constants.NUMBER_INT_64,
  constants.NUMBER_FLOAT_32,
  constants.NUMBER_FLOAT_64,
];

const dateFormats = [
  constants.DATE_SHORT,
  constants.DATE_DATETIME,
  constants.DATE_TIME,
];

/* Return an error message if there is an error */
export function validateRange(range) {
  switch (range.type) {
    case constants.BOOLEAN:
      break;
    case constants.TEXT:
      if (range.format && !textFormats.includes(range.format)) {
        return `Bad Text format for range.format: ${range.format}`;
      }
      break;
    case constants.NUMBER:
      if (range.format && !numberFormats.includes(range.format)) {
        return `Bad Number format with range.format: ${range.format}`;
      }
      break;
    case constants.DATE:
      if (range.format && !dateFormats.includes(range.format)) {
        return `Bad Date format with range.format: ${range.format}`;
      }
      break;
    case constants.ENUM:
      if (!isArray(range.values)) {
        return `Bad Enum range: ${range.values}`;
      }
      break;
    case constants.NESTED_OBJECT:
      if (!isArray(range.propertyRefs)) {
        return 'Bad NestedObject Range, propertyRefs required';
      }
      for (let ref of range.propertyRefs) {
        const error = validateCardinality(ref.cardinality);
        if (error) {
          return error;
        }
      }
      break;
    case constants.LINKED_CLASS:
      if (!range.ref) {
        return 'Bad LinkedClass range, ref required';
      }
      break;
    default:
      return `Bad range type: ${range.type}`;
  }
  return null;
}

function validateNode (type, node, allowed) {
  if (!isString(node.label)) {
    return `${type} node is missing a label`
  }
  for (let key of Object.keys(node)) {
    if (!allowed.includes(key)) {
      return `Class node hello should not have property: ${key}`
    }
  }
  return null
}

export function validateClassNode (classNode) {
  const nodeErr = validateNode(constants.CLASS, classNode, [
    'uid',
    'type',
    'label',
    'propertyRefs',
    'description',
    'subClassOf',
    'excludeParentProperties'
  ])
  if (nodeErr) {
    return nodeErr
  }
  if (!isArray(classNode.propertyRefs)) {
    return `Class node ${classNode.label} is missing propertyRefs`
  }
  for (let propertyRef of classNode.propertyRefs) {
    const err = validatePropertyRef(propertyRef)
    if (err) {
      return `Class node ${classNode.label} has error: ${err}`
    }
  }
  return null
}

export function validatePropertyNode (propertyNode) {
  const nodeErr = validateNode(constants.CLASS, propertyNode, [
    'uid',
    'type',
    'label',
    'description',
    'range'
  ])
  if (nodeErr) {
    return nodeErr
  }
  const rangeError = validateRange(propertyNode.range)
  if (rangeError) {
    return rangeError
  }
}

export function validateGraph (graph) {
  if (!isArray(graph)) {
    return 'Graph must be an array of class and property nodes'
  }
  const classes = {}
  const properties = {}

  for (let node of graph) {
    if (node.type === constants.CLASS) {
      const err = validateClassNode(node)
      if (err) {
        return err
      }
      const label = node.label.toLowerCase()
      if (classes[label]) {
        return `Class node (after becoming lowercase) is not unique: ${label}`
      }
      classes[label] = node
    }
    else if (node.type === constants.PROPERTY) {
      const err = validatePropertyNode(node)
      if (err) {
        return err
      }
      const label = node.label.toLowerCase()
      if (properties[label]) {
        return `Property node (after becoming lowercase) is not unique: ${label}`
      }
      properties[label] = node
    }
    else {
      return 'Node type must be either "Class" or "Property"'
    }
  }

  const resolvePropertyRefs = function(node) {
    const propertyRefs = node.type === constants.CLASS
      ? node.propertyRefs
      : node.range.propertyRefs

    for (let propertyRef of propertyRefs) {
      const { ref } = propertyRef
      if (!validateUid(ref)) {
        continue
      }
      const property = properties[ref]
      if (!property) {
        return `${node.type} node ${node.label} ref ${ref} does not exist`
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

  for (let key of Object.keys(classes)) {
    const classNode = classes[key]
    const err = resolvePropertyRefs(classNode)
    if (err) {
      return err
    }
  }
  return null
}