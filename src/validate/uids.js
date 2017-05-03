import isString from 'lodash/isString'
import * as constants from '../constants'
import { validateDesignLabel, validateNodeLabel } from './labels'
import { getUidType } from '../utils'

export function validateReducedUid (reduced) {
  const {
    ownerType,
    userOrOrg,
    designName,
    versionLabel,
    resourceType,
    classOrProperty
  } = reduced

  if (ownerType !== 'u' && ownerType !== 'o') {
    return 'Key ownerType must be "u" or "o"'
  }
  if (!userOrOrg) {
    return 'Key userOrOrg must be provided'
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
        const nodeLabelError = validateNodeLabel(classOrProperty)
        if (nodeLabelError) {
          return nodeLabelError
        }
      }
    }
  }
  return null
}

/* This will work for now */
export function validateUid (uid, expectedType) {
  let type
  try {
    type = getUidType(uid)
  } catch (err) {
    return err
  }
  if (expectedType && expectedType !== type) {
    return `uid is not of type "${expectedType}"`
  }
  if (isString(type)) {
    return null
  }
  return `Could not validate uid: ${uid}`
}

export function validateUserUid (uid) {
  const err = validateUid(uid, constants.USER_UID)
  return err || null
}

export function validateOrganizationUid (uid) {
  const err = validateUid(uid, constants.ORGANIZATION_UID)
  return err || null
}

export function validateDesignUid (uid) {
  const err = validateUid(uid, constants.DESIGN_UID)
  return err || null
}

export function validateVersionUid (uid) {
  const err = validateUid(uid, constants.VERSION_UID)
  return err || null
}

export function validateClassUid (uid) {
  const err = validateUid(uid, constants.CLASS_UID)
  return err || null
}

export function validatePropertyUid (uid) {
  const err = validateUid(uid, constants.PROPERTY_UID)
  return err || null
}
