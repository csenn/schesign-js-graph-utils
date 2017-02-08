
/* Types other then primitives */
export const LINKED_CLASS = 'LinkedClass';
export const NESTED_OBJECT = 'NestedObject';

/* Main Primitives */
export const TEXT = 'Text';
export const NUMBER = 'Number';
export const BOOLEAN = 'Boolean';
export const DATE = 'Date';
export const ENUM = 'Enum';

/* Primitive Formats */
export const TEXT_FORMAT_URL = 'Url';
export const TEXT_FORMAT_EMAIL = 'Email';
export const TEXT_FORMAT_HOSTNAME = 'Hostname';

export const DATE_SHORT = 'ShortDate';
export const DATE_DATETIME = 'DateTime';
export const DATE_TIME = 'Time';

export const NUMBER_INT = 'Int';
export const NUMBER_INT_8 = 'Int8';
export const NUMBER_INT_16 = 'Int16';
export const NUMBER_INT_32 = 'Int32';
export const NUMBER_INT_64 = 'Int64';

export const NUMBER_FLOAT_32 = 'Float32'
export const NUMBER_FLOAT_64 = 'Float64'

/* Maybe use lodash... */
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/* Create a uid */
export function createUid(options) {
  const {
    ownerType,
    userOrOrg,
    designName,
    versionLabel,
    resourceType,
    classOrProperty,
  } = options;

  if (ownerType !== 'u' && ownerType !== 'o') {
    throw new Error('Bad owner type, must be "u" or "o"');
  }
  if (!userOrOrg) {
    throw new Error('Bad userOrOrg, must be provided');
  }

  let path = `/${ownerType}/${userOrOrg}`;

  if (designName) {
    path += `/${designName}`;
    if (versionLabel) {
      path += `/${versionLabel}`;
      if (resourceType) {
        if (resourceType !== 'class' && resourceType !== 'property') {
          throw new Error('Bad resourceType, must be "class" or "property"');
        }
        if (!classOrProperty) {
          throw new Error('Option classOrProperty required with resourceType');
        }
        path += `/${resourceType}/${classOrProperty}`;
      }
    }
  }

  return `https://www.schesign.com${path.toLowerCase()}`;
}

/* Cardinality helpers */
export function validateCardinality (cardinality) {
  if (!cardinality
    || !isNumber(cardinality.minItems)
    || !isNumber(cardinality.maxItems)
    || Object.keys(cardinality).length > 2)
  {
    return 'Bad Cardinality. Must be in format {minItems: [num], maxItems: [num]}'
  }
  return null
}

export function isRequiredCardinality(cardinality) {
  return cardinality.minItems > 0;
}

export function isMultipleCardinality(cardinality) {
  return !isNumber(cardinality.maxItems) || cardinality.maxItems > 1;
}

/* Range Helpers */
const textFormats = [
  TEXT_FORMAT_URL,
  TEXT_FORMAT_EMAIL,
  TEXT_FORMAT_HOSTNAME
]

const numberFormats = [
  NUMBER_INT,
  NUMBER_INT_8,
  NUMBER_INT_16,
  NUMBER_INT_32,
  NUMBER_INT_64,
  NUMBER_FLOAT_32,
  NUMBER_FLOAT_64
]

const dateFormats = [
  DATE_SHORT,
  DATE_DATETIME,
  DATE_TIME
]

/* Return an error message if there is an error */
export function validateRange (range) {
  switch (range.type) {
    case BOOLEAN:
      break
    case TEXT:
      if (range.format && !textFormats.includes(range.format)) {
        return `Bad Text format for range.format: ${range.format}`
      }
      break
    case NUMBER:
      if (range.format && !numberFormats.includes(range.format)) {
        return `Bad Number format with range.format: ${range.format}`
      }
      break
    case DATE:
      if (range.format && !dateFormats.includes(range.format)) {
        return `Bad Date format with range.format: ${range.format}`
      }
      break
    case ENUM:
      if (!range.values) {
        return `Bad Enum range: ${range.values}`
      }
      break
    case NESTED_OBJECT:
      if (!range.propertyRefs) {
        return 'Bad NestedObject Range, propertyRefs required'
      }
      for (const ref of range.propertyRefs) {
        const error = validateCardinality(ref.cardinality)
        if (error) {
          return error
        }
      }
      break
    default:
      return `Bad range type: ${range.type}`
  }
  return null
}