import { isNumber } from 'lodash';
import * as constants from './constants';
import { ClassNode, getRefFromNode } from './design';

const rangeTypes = {
  nestedObject: (propertyRefs = []) => ({ type: constants.NESTED_OBJECT, propertyRefs }),

  linkedClass: nodeOrRef => {
    const ref = nodeOrRef instanceof ClassNode
      ? getRefFromNode(nodeOrRef)
      : nodeOrRef;
    return { type: constants.LINKED_CLASS, ref };
  },
  boolean: () => ({ type: constants.BOOLEAN }),
  enum: values => ({ type: constants.ENUM, values }),

  text: opts => {
    const range = { type: constants.TEXT };
    if (opts) {
      if (isNumber(opts.minLength)) {
        range.minLength = opts.minLength;
      }
      if (isNumber(opts.maxLength)) {
        range.maxLength = opts.maxLength;
      }
    }
    return range;
  },
  url: () => ({ type: constants.TEXT, format: constants.TEXT_URL }),
  email: () => ({ type: constants.TEXT, format: constants.TEXT_EMAIL }),
  hostname: () => ({ type: constants.TEXT, format: constants.TEXT_HOSTNAME }),
  regex: regex => ({ type: constants.TEXT, regex }),

  number: opts => {
    const range = { type: constants.NUMBER };
    if (opts) {
      if (isNumber(opts.min)) {
        range.min = opts.min;
      }
      if (isNumber(opts.max)) {
        range.max = opts.max;
      }
    }
    return range;
  },
  int: opts => Object.assign(rangeTypes.number(opts), { format: constants.NUMBER_INT }),
  int8: opts => Object.assign(rangeTypes.number(opts), { format: constants.NUMBER_INT_8 }),
  int16: opts => Object.assign(rangeTypes.number(opts), { format: constants.NUMBER_INT_16 }),
  int32: opts => Object.assign(rangeTypes.number(opts), { format: constants.NUMBER_INT_32 }),
  int64: opts => Object.assign(rangeTypes.number(opts), { format: constants.NUMBER_INT_64 }),
  float32: opts => Object.assign(rangeTypes.number(opts), { format: constants.NUMBER_FLOAT_32 }),
  float64: opts => Object.assign(rangeTypes.number(opts), { format: constants.NUMBER_FLOAT_64 }),

  shortDate: () => ({ type: constants.DATE, format: constants.DATE_SHORT }),
  dateTime: () => ({ type: constants.DATE, format: constants.DATE_DATETIME }),
  time: () => ({ type: constants.DATE, format: constants.DATE_TIME }),
};

export default rangeTypes;
