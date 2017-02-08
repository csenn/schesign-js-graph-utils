import {
  validateRange,
  validateCardinality
} from './index'

export class PropertyNode {
  constructor (opts) {
    this.type = 'Property'

    if (!opts.label) {
      throw new Error ('option: label is required')
    }
    this.label = opts.label

    if (opts.description) {
      this.description = opts.description
    }

    if (opts.range) {
      this.setRange(opts.range)
    } else {
      this.range = {}
    }
  }

  setRange (range) {
    const err = validateRange (range)
    if (err) {
      throw new Error(`Range error for property ${this.label}: ${err}`)
    }
    this.range = range
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

export class ClassNode {
  constructor (opts) {
    this.type = 'Class'

    if (!opts.label) {
      throw new Error ('option: label is required')
    }
    this.label = opts.label

    if (opts.description) {
      this.description = opts.description
    }

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

    /* Use either the uid or label */
    const ref = property.uid || property.label

    if (this.propertyLookup[ref]) {
      throw new Error ('Property has already been added to class')
    }
    this.propertyLookup[ref] = property

    const propertyRef = { ref }

    if (opts && opts.cardinality) {
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