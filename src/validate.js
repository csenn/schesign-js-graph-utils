import { isNumber, isArray, isString, isFinite } from 'lodash';
import { getUidType } from './utils';
import * as constants from './constants';

const LETTERS_NUMBERS_UNDERSCORE = /^[a-zA-Z0-9_]+$/;
const LETTERS_NUMBERS_UNDERSCORE_DASH = /^[a-zA-Z0-9_-]+$/;

export function validateDesignLabel(label) {
  if (!isString(label)) {
    return 'Label must be a string';
  }
  if (!LETTERS_NUMBERS_UNDERSCORE_DASH.test(label)) {
    return 'Label can only have letters, numbers, underscores, or dashes';
  }
  return null;
}

export function validateNodeLabel(label) {
  if (!isString(label)) {
    return 'Label must be a string';
  }
  if (!LETTERS_NUMBERS_UNDERSCORE.test(label)) {
    return 'Label can only have letters, numbers, or underscores';
  }
  return null;
}

export function validateVersionLabel(label) {
  if (!isString(label)) {
    return 'Label must be a string';
  }
  if (label === 'master') {
    return null;
  }

  const split = label.split('.');
  const ERROR_MESSAGE = 'Label should be of format *.*.*';
  if (split.length !== 3) {
    return ERROR_MESSAGE;
  }
  for (const el of split) {
    if (!isFinite(parseInt(el))) {
      return ERROR_MESSAGE;
    }
  }
  return null;
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
    return 'Key ownerType must be "u" or "o"';
  }
  if (!userOrOrg) {
    return 'Key userOrOrg must be provided';
  }

  if (designName) {
    const designError = validateDesignLabel(designName);
    if (designError) {
      return designError;
    }
    if (versionLabel) {
      if (resourceType) {
        if (resourceType !== 'class' && resourceType !== 'property') {
          return 'Bad resourceType, must be "class" or "property"';
        }
        const nodeLabelError = validateNodeLabel(classOrProperty);
        if (nodeLabelError) {
          return nodeLabelError;
        }
      }
    }
  }
  return null;
}

/* This will work for now */
export function validateUid(uid, expectedType) {
  try {
    const type = getUidType(uid);
    if (expectedType && expectedType !== type) {
      return `Uid is not of type: ${expectedType}`;
    }
    if (isString(type)) {
      return null;
    }
    return `Could not validate uid: ${uid}`;
  } catch (err) {
    return err;
  }
}

export function validateUserUid(uid) {
  const err = validateUid(uid, constants.USER_UID);
  return err || null;
}

export function validateOrganizationUid(uid) {
  const err = validateUid(uid, constants.ORGANIZATION_UID);
  return err || null;
}

export function validateDesignUid(uid) {
  const err = validateUid(uid, constants.DESIGN_UID);
  return err || null;
}

export function validateVersionUid(uid) {
  const err = validateUid(uid, constants.VERSION_UID);
  return err || null;
}

export function validateClassUid(uid) {
  const err = validateUid(uid, constants.CLASS_UID);
  return err || null;
}

export function validatePropertyUid(uid) {
  const err = validateUid(uid, constants.PROPERTY_UID);
  return err || null;
}

/* Cardinality helpers */
export function validateCardinality(cardinality) {
  const err = 'Bad Cardinality. Must be in format {minItems: [num], maxItems: [num || null]}';
  if (!cardinality) {
    return err;
  } else if (!isNumber(cardinality.minItems)) {
    return err;
  } else if (cardinality.maxItems !== null && !isNumber(cardinality.maxItems)) {
    return err;
  }
  return null;
}

/* Todo: check for index, foreign, etc when added */
export function validatePropertyRef(propertyRef, opts = {}) {
  let err;
  if (opts.skipUidValidation) {
    err = isString(propertyRef.ref) ? null : 'ref is required';
  } else {
    err = validateClassUid(propertyRef.ref);
  }
  if (err) {
    return err;
  }
  err = validateCardinality(propertyRef.cardinality);
  if (err) {
    return err;
  }
  return null;
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
export function validateRange(range, opts = {}) {
  let err;
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
      for (const ref of range.propertyRefs) {
        err = validatePropertyRef(ref, opts);
        if (err) {
          return `Bad NestedObject Range: ${err}`;
        }
      }
      break;
    case constants.LINKED_CLASS:
      if (opts.skipUidValidation) {
        err = isString(range.ref) ? null : 'ref is required';
      } else {
        err = validateClassUid(range.ref);
      }
      if (err) {
        return `Bad LinkedClass Range ${err}`;
      }
      break;
    default:
      return `Bad range type: ${range.type}`;
  }
  return null;
}

function validateNode(type, node, allowed) {
  if (!isString(node.label)) {
    return `${type} node is missing a label`;
  }
  const labelError = validateNodeLabel(node.label);
  if (labelError) {
    return labelError;
  }
  for (const key of Object.keys(node)) {
    if (!allowed.includes(key)) {
      return `Class node hello should not have property: ${key}`;
    }
  }
  return null;
}

export function validateClassNode(classNode, opts = {}) {
  const nodeErr = validateNode(constants.CLASS, classNode, [
    'uid',
    'type',
    'label',
    'propertyRefs',
    'description',
    'subClassOf',
    'excludeParentProperties',
  ]);
  if (nodeErr) {
    return nodeErr;
  }
  if (!isArray(classNode.propertyRefs)) {
    return `Class node ${classNode.label} is missing propertyRefs`;
  }
  for (const propertyRef of classNode.propertyRefs) {
    const err = validatePropertyRef(propertyRef, opts);
    if (err) {
      return `Class node ${classNode.label} has error: ${err}`;
    }
  }
  return null;
}

export function validatePropertyNode(propertyNode, opts = {}) {
  const nodeErr = validateNode(constants.CLASS, propertyNode, [
    'uid',
    'type',
    'label',
    'description',
    'range',
  ]);
  if (nodeErr) {
    return nodeErr;
  }
  const rangeError = validateRange(propertyNode.range, opts);
  if (rangeError) {
    return rangeError;
  }
  return null;
}

export function validateGraph(graph, opts = {}) {
  if (!isArray(graph)) {
    return 'Graph must be an array of class and property nodes';
  }
  const classes = {};
  const properties = {};

  for (const node of graph) {
    if (node.type === constants.CLASS) {
      const err = validateClassNode(node, opts);
      if (err) {
        return err;
      }
      const label = node.label.toLowerCase();
      if (classes[label]) {
        return `Class node (after becoming lowercase) is not unique: ${label}`;
      }
      classes[label] = node;
    } else if (node.type === constants.PROPERTY) {
      const err = validatePropertyNode(node, opts);
      if (err) {
        return err;
      }
      const label = node.label.toLowerCase();
      if (properties[label]) {
        return `Property node (after becoming lowercase) is not unique: ${label}`;
      }
      properties[label] = node;
    } else {
      return 'Node type must be either "Class" or "Property"';
    }
  }

  /* Use resolved to prevent recursion */
  const resolved = {};
  const resolvePropertyRefs = node => {
    const propertyRefs = node.type === constants.CLASS
      ? node.propertyRefs
      : node.range.propertyRefs;

    for (const propertyRef of propertyRefs) {
      const ref = propertyRef.ref.toLowerCase();
      if (resolved[ref]) {
        continue;
      }
      resolved[ref] = true;
      const uidError = validateUid(ref);
      if (!uidError) {
        continue;
      }
      const property = properties[ref];
      if (!property) {
        return `${node.type} node ${node.label} ref ${propertyRef.ref} does not exist`;
      }
      if (property.range.type === constants.NESTED_OBJECT) {
        const nestedObjectErr = resolvePropertyRefs(property);
        if (nestedObjectErr) {
          return nestedObjectErr;
        }
      }
    }
    return null;
  };

  /* Resolve propertyRefs and subClassOf for classNodes */
  for (const key of Object.keys(classes)) {
    const classNode = classes[key];
    const err = resolvePropertyRefs(classNode);
    if (err) {
      return err;
    }
    if (classNode.subClassOf) {
      const subClassOf = classNode.subClassOf.toLowerCase();
      const uidError = validateUid(subClassOf);
      if (!uidError) {
        continue;
      }
      if (!classes[subClassOf]) {
        return `In Class ${classNode.label} could not resolve subClassOf ${classNode.subClassOf}`;
      }
    }
  }

  /* Resolve classIds for properties with linked class range types */
  for (const key of Object.keys(properties)) {
    const propertyNode = properties[key];
    if (propertyNode.range.type === constants.LINKED_CLASS) {
      const ref = propertyNode.range.ref.toLowerCase();
      const uidError = validateUid(ref);
      if (!uidError) {
        continue;
      }
      if (!classes[ref]) {
        return `In property ${propertyNode.label} could not resolve ref ${propertyNode.range.ref}`;
      }
    }
  }

  return null;
}
