import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import colors from 'colors/safe'
import { validateReducedUid } from './validate'
import {
  NESTED_OBJECT,
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

export function isRequiredCardinality (cardinality) {
  return cardinality.minItems > 0
}

export function isMultipleCardinality (cardinality) {
  return !isNumber(cardinality.maxItems) || cardinality.maxItems > 1
}

function getNodeId (node) {
  return node.uid || node.label
}

export function printDesign (design, opts = {}) {
  const classes = []
  const properties = []
  const propertyMap = {}

  design.graph.forEach(node => {
    if (node.type === 'Class') {
      classes.push(node)
    }
    if (node.type === 'Property') {
      properties.push(node)
      propertyMap[getNodeId(node)] = node
    }
  })

  function printRange (range) {
    let str = ' ' + colors.cyan(range.type) + ' '
    Object.keys(range).forEach(key => {
      if (['type', 'propertyRefs'].includes(key)) {
        return
      }
      str += colors.magenta(key) + ':' + range[key] + ' '
    })
    return str
  }

  /* Prevent recursion for NestedObjects that point to themselves in a chain */
  function printPropertyRefs (propertyRefs, level, didRender) {
    propertyRefs.forEach(propertyRef => {
      const property = propertyMap[propertyRef.ref]
      if (didRender[property.label]) {
        return
      }
      didRender[property.label] = true
      let str = ''
      for (let i = 0; i < level; i++) {
        str += '  '
      }
      str += property.label
      str += printRange(property.range)
      str += colors.green('min:') + propertyRef.cardinality.minItems + ' '
      str += colors.green('max:') + propertyRef.cardinality.maxItems + ' '

      console.log(str)
      if (property.range.type === NESTED_OBJECT) {
        printPropertyRefs(property.range.propertyRefs, level + 1, didRender)
      }
    })
  }

  console.log('\n' + colors.bold('------ Notes ------'))
  console.log(' - SubClasses do show properties of parents')

  console.log('\n' + colors.bold('------ Classes ------'))
  classes.forEach(classNode => {
    let classLabel = colors.bold(classNode.label)
    if (classNode.subClassOf) {
      classLabel += ' inherits from ' + colors.magenta(classNode.subClassOf)
    }
    console.log(classLabel)
    printPropertyRefs(classNode.propertyRefs, 1, {})
    console.log('')
  })

  console.log('\n' + colors.bold('------ Properties ------'))
  properties.forEach(propertyNode => {
    let propertyLabel = colors.bold(propertyNode.label)
    propertyLabel += printRange(propertyNode.range)
    console.log(propertyLabel)
  })
}

export function shortenUid (graph) {
  throw new Error('utils.shortenUid is deprecated')

  // const shorten = uid => {
  //   if (isString(uid) && uid.indexOf('schesign.com') > -1) {
  //     return removeDomainFromUid(uid)
  //   }
  //   return uid
  // }

  // const fixPropertyRefs = (propertyRefs = []) => {
  //   return propertyRefs.map(propertyRef => {
  //     return Object.assign({}, propertyRef, {
  //       ref: shorten(propertyRef.ref)
  //     })
  //   })
  // }

  // const fixRange = range => {
  //   if (range.type === 'LinkedClass') {
  //     return Object.assign({}, range, {
  //       ref: shorten(range.ref)
  //     })
  //   } else if (range.type === 'NestedObject') {
  //     return Object.assign({}, range, {
  //       propertyRefs: fixPropertyRefs(range.propertyRefs)
  //     })
  //   }
  //   return Object.assign({}, range)
  // }

  // return graph.map(node => {
  //   if (node.type === 'Class') {
  //     return Object.assign({}, node, {
  //       uid: shorten(node.uid),
  //       subClassOf: shorten(node.subClassOf),
  //       excludeParentProperties: node.excludeParentProperties && node.excludeParentProperties.map(shorten),
  //       propertyRefs: fixPropertyRefs(node.propertyRefs)
  //     })
  //   } else if (node.type === 'Property') {
  //     return Object.assign({}, node, {
  //       uid: shorten(node.uid),
  //       range: fixRange(node.range)
  //     })
  //   } else if (node.type === 'Version') {
  //     return Object.assign({}, node, {
  //       uid: shorten(node.uid),
  //       classes: node.classes && node.classes.map(shorten),
  //       properties: node.properties && node.properties.map(shorten)
  //     })
  //   }
  //   return null
  // })
}
