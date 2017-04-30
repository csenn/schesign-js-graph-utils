import isNumber from 'lodash/isNumber'
import * as constants from './constants'
import { ClassNode, getRefFromNode } from './design'

// const rangeTypes = {
export const nestedObject = (propertyRefs = []) =>
  ({ type: constants.NESTED_OBJECT, propertyRefs })

export const linkedClass = (nodeOrRef) => {
  const ref = nodeOrRef instanceof ClassNode
    ? getRefFromNode(nodeOrRef)
    : nodeOrRef
  return { type: constants.LINKED_CLASS, ref }
}
export const boolean = () => ({ type: constants.BOOLEAN })
export const enu = values => ({ type: constants.ENUM, values })

export const text = opts => {
  const range = { type: constants.TEXT }
  if (opts) {
    if (isNumber(opts.minLength)) {
      range.minLength = opts.minLength
    }
    if (isNumber(opts.maxLength)) {
      range.maxLength = opts.maxLength
    }
  }
  return range
}
export const url = () => ({ type: constants.TEXT, format: constants.TEXT_URL })
export const email = () => ({ type: constants.TEXT, format: constants.TEXT_EMAIL })
export const hostname = () => ({ type: constants.TEXT, format: constants.TEXT_HOSTNAME })
export const regex = regexString => ({ type: constants.TEXT, regex: regexString })

export const number = opts => {
  const range = { type: constants.NUMBER }
  if (opts) {
    if (isNumber(opts.min)) {
      range.min = opts.min
    }
    if (isNumber(opts.max)) {
      range.max = opts.max
    }
  }
  return range
}

export const int = opts => Object.assign(number(opts), { format: constants.NUMBER_INT })
export const int8 = opts => Object.assign(number(opts), { format: constants.NUMBER_INT_8 })
export const int16 = opts => Object.assign(number(opts), { format: constants.NUMBER_INT_16 })
export const int32 = opts => Object.assign(number(opts), { format: constants.NUMBER_INT_32 })
export const int64 = opts => Object.assign(number(opts), { format: constants.NUMBER_INT_64 })
export const float32 = opts => Object.assign(number(opts), { format: constants.NUMBER_FLOAT_32 })
export const float64 = opts => Object.assign(number(opts), { format: constants.NUMBER_FLOAT_64 })

export const shortDate = () => ({ type: constants.DATE, format: constants.DATE_SHORT })
export const dateTime = () => ({ type: constants.DATE, format: constants.DATE_DATETIME })
export const time = () => ({ type: constants.DATE, format: constants.DATE_TIME })
