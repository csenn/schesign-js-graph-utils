
/* Import to export. There is probably a more standard way to expose these */
import rangeTypesExport from './rangeTypes'
import * as designExport from './design'
import * as printExport from './printDesign'
import * as validateExport from './validate'

export const Design = designExport.Design
export const ClassNode = designExport.ClassNode
export const PropertyNode = designExport.PropertyNode
export const rangeTypes = rangeTypesExport
export const printDesign = printExport.printDesign
export const validateGraph = validateExport.validateGraph
export const validateCardinality = validateExport.validateCardinality
export const validateRange = validateExport.validateRange



