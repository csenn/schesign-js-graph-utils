import {
  validateRange,
  validateCardinality,
  NESTED_OBJECT
} from './index'

function getPropertyRef (property, cardinality) {
  /* Use either the uid or label */
  const ref = property.uid || property.label
  const propertyRef = { ref }

  if (cardinality) {
    const err = validateCardinality(opts.cardinality)
    if (err) {
      throw new Error(`Cardinality error for property ref ${ref}: ${err}`)
    }
    propertyRef.cardinality = opts.cardinality
  } else {
    propertyRef.cardinality = {
      minItems: 0,
      maxItems: 1
    }
  }

  return propertyRef
}

export class Node {
  constructor (type, opts) {
    this.type = type

    if (!opts.label) {
      throw new Error ('option: label is required')
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
      throw new Error ('option: range is required')
    }
    this.setRange(opts.range)
    this.propertyLookup = {}
  }

  setRange (range) {
    const nextRange = range && range.type === NESTED_OBJECT
      ? Object.assign({}, range, { propertyRefs: [] })
      : range

    const err = validateRange(nextRange)
    if (err) {
      throw new Error(`Range error for property ${this.label}: ${err}`)
    }
    this.range = nextRange
  }

  addPropertyRef (property, opts) {
    if (this.range.type !== NESTED_OBJECT) {
      throw new Error('Must have range NestedObject to add property ref')
    }

    if (!(property instanceof PropertyNode)) {
      throw new Error('Must be an instanceof PropertyNode');
    }

    const propertyRef = getPropertyRef(property, opts && opts.cardinality)
    const { ref } = propertyRef
    if (this.propertyLookup[ref]) {
      throw new Error (`Property has already been added to NestedObject: ${this.label}`)
    }
    this.propertyLookup[ref] = property

    this.range.propertyRefs.push(propertyRef)
  }


  toJSON() {
    return {
      type: this.type,
      label: this.label,
      description: this.description || null,
      range: this.range
    }
  }
}

export class ClassNode extends Node {
  constructor (opts) {
    super('Class', opts)

    if (opts.subClassOf) {
      this.subClassOf = opts.subClassOf
    }

    this.propertyRefs = []
    this.propertyLookup = {}
  }

  addPropertyRef (property, opts) {
    if (!(property instanceof PropertyNode)) {
      throw new Error('Must be an instanceof PropertyNode');
    }

    const propertyRef = getPropertyRef(property, opts && opts.cardinality)
    const { ref } = propertyRef
    if (this.propertyLookup[ref]) {
      throw new Error ('Property has already been added to class')
    }
    this.propertyLookup[ref] = property

    this.propertyRefs.push(propertyRef)
  }

  toJSON() {
    return {
      type: this.type,
      label: this.label,
      description: this.description || null,
      subClassOf: this.subClassOf || null,
      propertyRefs: this.propertyRefs
    }
  }
}

export class Design {
  constructor(opts) {
    this.graph = [];
  }

  addClassNode (node) {
    if (!(node instanceof ClassNode)) {
      throw new Error('Must be an instanceof ClassNode');
    }
    this.graph.push(node);
  }

  toJSON() {
    const properties = {}
    const graph = this.graph.map(node => {
      Object.assign(properties, node.propertyLookup)
      return node.toJSON()
    })

    Object.keys(properties).forEach(key => {
      const node = properties[key].toJSON()
      graph.push(node)
    })

    return { graph }
  }
}