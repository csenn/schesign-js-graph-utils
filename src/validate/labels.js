import isString from 'lodash/isString'
import isFinite from 'lodash/isFinite'

const LETTERS_NUMBERS_UNDERSCORE = /^[a-zA-Z0-9_]+$/
const LETTERS_NUMBERS_UNDERSCORE_DASH = /^[a-zA-Z0-9_-]+$/

export function validateDesignLabel (label) {
  if (!isString(label)) {
    return 'Label must be a string'
  }
  if (!LETTERS_NUMBERS_UNDERSCORE_DASH.test(label)) {
    return 'Label can only have letters, numbers, underscores, or dashes'
  }
  return null
}

export function validateVersionLabel (label) {
  if (!isString(label)) {
    return 'Label must be a string'
  }
  if (label === 'master') {
    return null
  }

  const split = label.split('.')
  const ERROR_MESSAGE = 'Label should be of format *.*.*'
  if (split.length !== 3) {
    return ERROR_MESSAGE
  }
  for (const el of split) {
    if (!isFinite(parseInt(el))) {
      return ERROR_MESSAGE
    }
  }
  return null
}

export function validateNodeLabel (label) {
  if (!isString(label) || !label.length) {
    return 'label must be a string'
  }
  if (!LETTERS_NUMBERS_UNDERSCORE.test(label)) {
    return `label.${label} can only have letters, numbers, or underscores`
  }
  return null
}
