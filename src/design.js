import values from 'lodash/values'
import isString from 'lodash/isString'
import { NESTED_OBJECT, CLASS } from './constants'
import {
  validateGraph,
  validateRange,
  validateCardinality
} from './validate'

export function getRefFromNode (node) {
  return node.uid || node.label
}

function cleanObject (obj) {
  const next = {}
  Object.keys(obj).forEach(key => {
    if (obj[key]) {
      next[key] = obj[key]
    }
  })
  return next
}

function getPropertyRef (propertyOrId, opts = {}) {
  if (!(propertyOrId instanceof PropertyNode) && !isString(propertyOrId)) {
    throw new Error('Must be an instanceof PropertyNode or a property uid')
  }

  const ref = propertyOrId instanceof PropertyNode
    ? getRefFromNode(propertyOrId)
    : propertyOrId

  /* Use either the uid or label */
  const propertyRef = { ref, cardinality: { minItems: 0, maxItems: 1 } }

  /* If cardinality is provided, it overwrites required or isMultiple */
  if ('cardinality' in opts) {
    propertyRef.cardinality = opts.cardinality
  } else {
    if ('required' in opts) {
      propertyRef.cardinality.minItems = 1
    }
    if ('isMultiple' in opts) {
      propertyRef.cardinality.maxItems = null
    }
  }

  const err = validateCardinality(propertyRef.cardinality)
  if (err) {
    throw new Error(`Cardinality error for property ref ${ref}: ${err}`)
  }

  return propertyRef
}

export class Node {
  constructor (type, opts) {
    this.type = type

    if (!opts.label) {
      throw new Error('option: label is required')
    }
    this.label = opts.label

    if (opts.description) {
      this.description = opts.description
    }
  }
}

export class PropertyNode extends Node {
  constructor (opts) {
    super('Property', opts)

    if (!opts.range) {
      throw new Error('option: range is required')
    }
    this.setRange(opts.range)
    this.propertyLookup = {}
  }

  setRange (range) {
    const nextRange = range && range.type === NESTED_OBJECT
      ? Object.assign({}, range, { propertyRefs: [] })
      : range

    const err = validateRange(nextRange, { skipUidValidation: true })
    if (err) {
      throw new Error(`Range error for property ${this.label}: ${err}`)
    }
    this.range = nextRange
  }

  addProperty (propertyOrRef, opts) {
    if (this.range.type !== NESTED_OBJECT) {
      throw new Error('Must have range NestedObject to add property ref')
    }

    const propertyRef = getPropertyRef(propertyOrRef, opts)
    const { ref } = propertyRef
    if (this.propertyLookup[ref]) {
      throw new Error(`Property has already been added to NestedObject: ${this.label}`)
    }

    this.range.propertyRefs.push(propertyRef)

    if (propertyOrRef instanceof PropertyNode) {
      this.propertyLookup[ref] = propertyOrRef
    }
  }

  toJSON () {
    return cleanObject({
      type: this.type,
      label: this.label,
      description: this.description || null,
      range: this.range
    })
  }
}

export class ClassNode extends Node {
  constructor (opts) {
    super('Class', opts)

    if (opts.subClassOf) {
      this.inheritsFrom(opts.subClassOf)
    }

    this.propertyRefs = []
    this.propertyLookup = {}
    this.excludeParentProperties = []
  }

  addProperty (propertyOrRef, opts) {
    const propertyRef = getPropertyRef(propertyOrRef, opts)
    const { ref } = propertyRef
    if (this.propertyLookup[ref]) {
      throw new Error('Property has already been added to class')
    }
    this.propertyRefs.push(propertyRef)
    if (propertyOrRef instanceof PropertyNode) {
      this.propertyLookup[ref] = propertyOrRef
    }
  }

  inheritsFrom (classOrRef) {
    if (classOrRef instanceof ClassNode) {
      this.subClassOf = getRefFromNode(classOrRef)
    } else {
      this.subClassOf = classOrRef
    }
  }

  excludeParentProperty (propertyOrRef) {
    if (propertyOrRef instanceof PropertyNode) {
      this.excludeParentProperties.push(getRefFromNode(propertyOrRef))
    } else {
      this.excludeParentProperties.push(propertyOrRef)
    }
  }

  toJSON () {
    return cleanObject({
      type: this.type,
      label: this.label,
      description: this.description,
      subClassOf: this.subClassOf,
      propertyRefs: this.propertyRefs,
      excludeParentProperties: this.excludeParentProperties.length
        ? this.excludeParentProperties
        : null
    })
  }
}

export class Design {
  constructor (opts) {
    this.classes = []
    this.properties = []
  }

  addClass (node) {
    if (!(node instanceof ClassNode)) {
      throw new Error('Must be an instanceof ClassNode')
    }
    const found = this.classes.find(classNode => {
      return classNode.label.toLowerCase() === node.label.toLowerCase()
    })
    if (found) {
      throw new Error(`ClassNode has already been added ${found.label}`)
    }
    this.classes.push(node)
  }

  addProperty (node) {
    if (!(node instanceof PropertyNode)) {
      throw new Error('Must be an instance of PropertyNode')
    }
    const found = this.properties.find(propertyNode => {
      return propertyNode.label.toLowerCase() === node.label.toLowerCase()
    })
    if (!found) {
      this.properties.push(node)
    }
  }

  toJSON () {
    // const properties = {};

    const addUniqueProperty = property => {
      // const ref = getRefFromNode(property);
      this.addProperty(property)
      values(property.propertyLookup).forEach(addUniqueProperty)

      // if (!properties[ref]) {
      //   properties[ref] = property;
      //   values(property.propertyLookup).forEach(addUniqueProperty);
      // }
    }

    const graph = []

    this.classes.forEach(node => {
      values(node.propertyLookup).forEach(addUniqueProperty)
      graph.push(node.toJSON())
    })

    this.properties.forEach(node => {
      graph.push(node.toJSON())
    })

    graph.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === CLASS ? -1 : 1
      }
      const aLast = a.label.toLowerCase()
      const bLast = b.label.toLowerCase()
      return aLast > bLast ? 1 : -1
    })

    const err = validateGraph(graph, { skipUidValidation: true })
    if (err) {
      throw new Error(`Resulting graph is invalid: ${err}`)
    }

    return { graph }
  }
}
