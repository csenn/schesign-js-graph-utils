import { validateReducedUid } from './validate'
import { isNumber, isArray, isString } from 'lodash';

/* Create a uid */
export function createUid(reduced) {
  const err = validateReducedUid(reduced)
  if (err) {
    throw new Error(err)
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

export function reduceUid (uid) {
  if (!isString(uid)) {
    throw new Error('Uid must be a string')
  }

  const shortened = uid.indexOf('schesign.com') > -1
    ? uid.substring(uid.indexOf('schesign.com') + 12)
    : uid

  const parts = shortened.split('/')

  /* If a leading slash is provided */
  if (parts[0] === '') {
    parts.shift()
  }

  const result = {}
  const add = (index, key) => {
    if (parts[index]) {
      result[key] = parts[index]
    }
  }
  add(0, 'ownerType')
  add(1, 'userOrOrg')
  add(2, 'designName')
  add(3, 'versionLabel')
  add(4, 'resourceType')
  add(5, 'classOrProperty')
  return result
}

export function isRequiredCardinality(cardinality) {
  return cardinality.minItems > 0;
}

export function isMultipleCardinality(cardinality) {
  return !isNumber(cardinality.maxItems) || cardinality.maxItems > 1;
}