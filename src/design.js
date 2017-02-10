import { values } from 'lodash';

import {
  validateRange,
  validateCardinality,
  NESTED_OBJECT,
} from './index';

export function getRefFromNode(node) {
  return node.uid || node.label;
}

function cleanObject(obj) {
  const next = {};
  Object.keys(obj).forEach(key => {
    if (obj[key]) {
      next[key] = obj[key];
    }
  });
  return next;
}

function getPropertyRef(property, opts = {}) {
  /* Use either the uid or label */
  const ref = getRefFromNode(property);
  const propertyRef = { ref, cardinality: { minItems: 0, maxItems: 1 } };

  /* If cardinality is provided, it overwrites required or isMultiple */
  if ('cardinality' in opts) {
    propertyRef.cardinality = opts.cardinality;
  } else {
    if ('required' in opts) {
      propertyRef.cardinality.minItems = 1;
    }
    if ('isMultiple' in opts) {
      propertyRef.cardinality.maxItems = null;
    }
  }

  const err = validateCardinality(propertyRef.cardinality);
  if (err) {
    throw new Error(`Cardinality error for property ref ${ref}: ${err}`);
  }

  return propertyRef;
}

export class Node {
  constructor(type, opts) {
    this.type = type;

    if (!opts.label) {
      throw new Error('option: label is required');
    }
    this.label = opts.label;

    if (opts.description) {
      this.description = opts.description;
    }
  }

}

export class PropertyNode extends Node {
  constructor(opts) {
    super('Property', opts);

    if (!opts.range) {
      throw new Error('option: range is required');
    }
    this.setRange(opts.range);
    this.propertyLookup = {};
  }

  setRange(range) {
    const nextRange = range && range.type === NESTED_OBJECT
      ? Object.assign({}, range, { propertyRefs: [] })
      : range;

    const err = validateRange(nextRange);
    if (err) {
      throw new Error(`Range error for property ${this.label}: ${err}`);
    }
    this.range = nextRange;
  }

  addProperty(property, opts) {
    if (this.range.type !== NESTED_OBJECT) {
      throw new Error('Must have range NestedObject to add property ref');
    }

    if (!(property instanceof PropertyNode)) {
      throw new Error('Must be an instanceof PropertyNode');
    }

    const propertyRef = getPropertyRef(property, opts);
    const { ref } = propertyRef;
    if (this.propertyLookup[ref]) {
      throw new Error(`Property has already been added to NestedObject: ${this.label}`);
    }
    this.propertyLookup[ref] = property;

    this.range.propertyRefs.push(propertyRef);
  }


  toJSON() {
    return cleanObject({
      type: this.type,
      label: this.label,
      description: this.description || null,
      range: this.range,
    });
  }
}

export class ClassNode extends Node {
  constructor(opts) {
    super('Class', opts);

    if (opts.subClassOf) {
      this.inheritsFrom(opts.subClassOf)
    }

    this.propertyRefs = [];
    this.propertyLookup = {};
    this.excludeParentProperties = []
  }

  addProperty(property, opts) {
    if (!(property instanceof PropertyNode)) {
      throw new Error('Must be an instanceof PropertyNode');
    }

    const propertyRef = getPropertyRef(property, opts);
    const { ref } = propertyRef;
    if (this.propertyLookup[ref]) {
      throw new Error('Property has already been added to class');
    }
    this.propertyLookup[ref] = property;

    this.propertyRefs.push(propertyRef);
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

  toJSON() {
    return cleanObject({
      type: this.type,
      label: this.label,
      description: this.description,
      subClassOf: this.subClassOf,
      propertyRefs: this.propertyRefs,
      excludeParentProperties: this.excludeParentProperties.length
        ? this.excludeParentProperties
        : null
    });
  }
}

export class Design {
  constructor(opts) {
    this.graph = [];
  }

  addClass(node) {
    if (!(node instanceof ClassNode)) {
      throw new Error('Must be an instanceof ClassNode');
    }
    this.graph.push(node);
  }

  toJSON() {
    const properties = {};

    const addProperty = property => {
      const ref = getRefFromNode(property);
      if (!properties[ref]) {
        properties[ref] = property;
      }
      values(property.propertyLookup).forEach(addProperty);
    };

    const graph = this.graph.map(node => {
      values(node.propertyLookup).forEach(addProperty);
      return node.toJSON();
    });

    values(properties).forEach(node => {
      graph.push(node.toJSON());
    });

    return { graph };
  }
}
