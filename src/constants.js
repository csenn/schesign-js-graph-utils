
/* Resource types */
export const CLASS = 'Class'
export const PROPERTY = 'Property'

/* Resource Keys */
export const NODE_TYPE = 'type'
export const NODE_LABEL = 'label'
export const NODE_DESCRIPTION = 'description'
export const NODE_SUBCLASSOF = 'subClassOf'
export const NODE_PROPERTY_SPECS = 'propertySpecs'
export const NODE_RANGE = 'range'
export const NODE_EXCLUDE_PARENT_PROPERTIES = 'excludeParentProperties'

export const VALID_CLASS_KEYS = [
  NODE_TYPE,
  NODE_LABEL,
  NODE_DESCRIPTION,
  NODE_SUBCLASSOF,
  NODE_PROPERTY_SPECS,
  NODE_EXCLUDE_PARENT_PROPERTIES
]

export const VALID_PROPERTY_KEYS = [
  NODE_TYPE,
  NODE_LABEL,
  NODE_DESCRIPTION,
  NODE_PROPERTY_SPECS,
  NODE_RANGE
]

/* Non Primitives */
export const LINKED_CLASS = 'LinkedClass'
export const NESTED_OBJECT = 'NestedObject'

/* Main Primitives */
export const TEXT = 'Text'
export const NUMBER = 'Number'
export const BOOLEAN = 'Boolean'
export const DATE = 'Date'
export const ENUM = 'Enum'

/* Primitive Formats */
export const TEXT_URL = 'Url'
export const TEXT_EMAIL = 'Email'
export const TEXT_HOSTNAME = 'Hostname'

export const DATE_SHORT = 'ShortDate'
export const DATE_DATETIME = 'DateTime'
export const DATE_TIME = 'Time'

export const NUMBER_INT = 'Int'
export const NUMBER_INT_8 = 'Int8'
export const NUMBER_INT_16 = 'Int16'
export const NUMBER_INT_32 = 'Int32'
export const NUMBER_INT_64 = 'Int64'

export const NUMBER_FLOAT_32 = 'Float32'
export const NUMBER_FLOAT_64 = 'Float64'

/* Range Types */
export const RANGE_TYPE = 'type'
export const RANGE_FORMAT = 'format'
export const RANGE_MIN_LENGTH = 'minLength'
export const RANGE_MAX_LENGTH = 'maxLength'
export const RANGE_MIN = 'min'
export const RANGE_MAX = 'max'
export const RANGE_VALUES = 'values'
export const RANGE_REGEX = 'regex'
export const RANGE_REF = 'ref'
export const RANGE_PROPERTY_SPECS = 'propertySpecs'

/* Uid Types */
export const USER_UID = 'UserUid'
export const ORGANIZATION_UID = 'OrganizationUid'
export const DESIGN_UID = 'DesignUid'
export const VERSION_UID = 'VersionUid'
export const PROPERTY_UID = 'PropertyUid'
export const CLASS_UID = 'ClassUid'

/* Group constants in convenient ways */

export const RANGE_TYPES = [
  BOOLEAN,
  TEXT,
  NUMBER,
  DATE,
  ENUM,
  NESTED_OBJECT,
  LINKED_CLASS
]

/* Range constraint Mappings */
export const RANGE_CONSTRAINT_MAPPING = {
  [BOOLEAN]: [
    RANGE_TYPE
  ],
  [TEXT]: [
    RANGE_TYPE,
    RANGE_FORMAT,
    RANGE_MIN_LENGTH,
    RANGE_MAX_LENGTH,
    RANGE_REGEX],
  [NUMBER]: [
    RANGE_TYPE,
    RANGE_FORMAT,
    RANGE_MIN,
    RANGE_MAX
  ],
  [ENUM]: [
    RANGE_TYPE,
    RANGE_VALUES
  ],
  [LINKED_CLASS]: [
    RANGE_TYPE,
    RANGE_REF
  ],
  [DATE]: [
    RANGE_TYPE,
    RANGE_FORMAT
  ],
  [NESTED_OBJECT]: [
    RANGE_TYPE,
    RANGE_PROPERTY_SPECS
  ]
}

/* Range Formats */
export const RANGE_FORMAT_MAPPING = {
  [TEXT]: [
    TEXT_URL,
    TEXT_EMAIL,
    TEXT_HOSTNAME
  ],
  [NUMBER]: [
    NUMBER_INT,
    NUMBER_INT_8,
    NUMBER_INT_16,
    NUMBER_INT_32,
    NUMBER_INT_64,
    NUMBER_FLOAT_32,
    NUMBER_FLOAT_64
  ],
  [DATE]: [
    DATE_SHORT,
    DATE_DATETIME,
    DATE_TIME
  ]
}

export const SPEC_REF = 'ref'
export const SPEC_MIN_ITEMS = 'minItems'
export const SPEC_MAX_ITEMS = 'maxItems'
export const SPEC_INDEX = 'index'
export const SPEC_PRIMARY_KEY = 'primaryKey'
export const SPEC_UNIQUE = 'unique'

export const PROPERTY_SPEC_KEYS = [
  SPEC_REF,
  SPEC_MIN_ITEMS,
  SPEC_MAX_ITEMS,
  SPEC_INDEX,
  SPEC_PRIMARY_KEY,
  SPEC_UNIQUE
]
