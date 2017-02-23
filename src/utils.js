import colors from 'colors/safe';
import { validateReducedUid } from './validate';
import { isNumber, isArray, isString } from 'lodash';
import {
  NESTED_OBJECT,
  USER_UID,
  ORGANIZATION_UID,
  DESIGN_UID,
  VERSION_UID,
  PROPERTY_UID,
  CLASS_UID,
} from './constants';

/* Create a uid */
export function createUid(reduced) {
  const err = validateReducedUid(reduced);
  if (err) {
    throw new Error(err);
  }

  const {
    ownerType,
    userOrOrg,
    designName,
    versionLabel,
    resourceType,
    classOrProperty,
  } = reduced;

  let path = `/${ownerType}/${userOrOrg}`;

  if (designName) {
    path += `/${designName}`;
    if (versionLabel) {
      path += `/${versionLabel}`;
      if (resourceType) {
        path += `/${resourceType}/${classOrProperty}`;
      }
    }
  }

  return `https://www.schesign.com${path.toLowerCase()}`;
}

export function reduceUid(uid) {
  if (!isString(uid)) {
    throw new Error('Uid must be a string');
  }

  const shortened = uid.indexOf('schesign.com') > -1
    ? uid.substring(uid.indexOf('schesign.com') + 12)
    : uid;

  const parts = shortened.split('/');

  /* If a leading slash is provided */
  if (parts[0] === '') {
    parts.shift();
  }

  const result = {};
  const add = (index, key) => {
    if (parts[index]) {
      result[key] = parts[index];
    }
  };
  add(0, 'ownerType');
  add(1, 'userOrOrg');
  add(2, 'designName');
  add(3, 'versionLabel');
  add(4, 'resourceType');
  add(5, 'classOrProperty');
  return result;
}

export function getUidType(uid) {
  const reduced = reduceUid(uid);
  const err = validateReducedUid(reduced);
  if (err) {
    throw new Error(`Bad Uid: ${uid}`);
  }
  if (reduced.classOrProperty) {
    if (reduced.classOrProperty === 'class') {
      return CLASS_UID;
    }
    return PROPERTY_UID;
  }
  if (reduced.versionLabel) {
    return VERSION_UID;
  }
  if (reduced.designName) {
    return DESIGN_UID;
  }
  if (reduced.ownerType === 'o') {
    return ORGANIZATION_UID;
  }
  return USER_UID;
}

export function isRequiredCardinality(cardinality) {
  return cardinality.minItems > 0;
}

export function isMultipleCardinality(cardinality) {
  return !isNumber(cardinality.maxItems) || cardinality.maxItems > 1;
}

function getNodeId(node) {
  return node.uid || node.label;
}

export function printDesign(design) {
  const classes = [];
  const properties = {};

  design.graph.forEach(node => {
    if (node.type === 'Class') {
      classes.push(node);
    }
    if (node.type === 'Property') {
      properties[getNodeId(node)] = node;
    }
  });

  /* Prevent recursion for NestedObjects that point to themselves in a chain */
  function printPropertyRefs(propertyRefs, level, didRender) {
    propertyRefs.forEach(propertyRef => {
      const property = properties[propertyRef.ref];
      if (didRender[property.label]) {
        return;
      }
      didRender[property.label] = true;
      let str = '';
      for (let i = 0; i < level; i++) {
        str += '  ';
      }
      str += property.label;
      str += ' ' + colors.cyan(property.range.type) + ' ';
      str += colors.green('min:') + propertyRef.cardinality.minItems + ' ';
      str += colors.green('max:') + propertyRef.cardinality.maxItems + ' ';

      Object.keys(property.range).forEach(key => {
        if (['type', 'propertyRefs'].includes(key)) {
          return;
        }
        str += colors.magenta(key) + ':' + property.range[key] + ' ';
      });

      console.log(str);
      if (property.range.type === NESTED_OBJECT) {
        printPropertyRefs(property.range.propertyRefs, level + 1, didRender);
      }
    });
  }

  classes.forEach(classNode => {
    console.log('\n' + colors.bold(classNode.label));
    printPropertyRefs(classNode.propertyRefs, 1, {});
  });
}
