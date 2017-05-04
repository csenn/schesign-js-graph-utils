import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import { validateReducedUid } from './validate'
import {
  USER_UID,
  ORGANIZATION_UID,
  DESIGN_UID,
  VERSION_UID,
  PROPERTY_UID,
  CLASS_UID
} from './constants'

const removeDomainFromUid = uid => uid.substring(uid.indexOf('schesign.com') + 13)

/* Create a uid */
export function createUid (reduced, long) {
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
    classOrProperty
  } = reduced

  let path = `${ownerType}/${userOrOrg}`

  if (designName) {
    path += `/${designName}`
    if (versionLabel) {
      path += `/${versionLabel}`
      if (resourceType) {
        path += `/${resourceType}/${classOrProperty}`
      }
    }
  }

  path = path.toLowerCase()

  return long
    ? `https://www.schesign.com/${path}`
    : path
}

export function reduceUid (uid) {
  if (!isString(uid)) {
    throw new Error('Uid must be a string')
  }

  const shortened = uid.indexOf('schesign.com') > -1
    ? removeDomainFromUid(uid)
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

export function areFromSameDesign (uidA, uidB) {
  const reducedA = reduceUid(uidA)
  const redcuedB = reduceUid(uidB)

  return reducedA.ownerType &&
    reducedA.userOrOrg &&
    reducedA.designName &&
    reducedA.ownerType === redcuedB.ownerType &&
    reducedA.userOrOrg === redcuedB.userOrOrg &&
    reducedA.designName === redcuedB.designName
}

export function getUidType (uid) {
  const reduced = reduceUid(uid)
  const err = validateReducedUid(reduced)
  if (err) {
    throw new Error(`Bad Uid: ${uid}`)
  }
  if (reduced.classOrProperty) {
    if (reduced.resourceType === 'class') {
      return CLASS_UID
    } else if (reduced.resourceType === 'property') {
      return PROPERTY_UID
    }
    throw new Error('resourceType must be a class or property')
  }
  if (reduced.versionLabel) {
    return VERSION_UID
  }
  if (reduced.designName) {
    return DESIGN_UID
  }
  if (reduced.ownerType === 'o') {
    return ORGANIZATION_UID
  }
  return USER_UID
}
