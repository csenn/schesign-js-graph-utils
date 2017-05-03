import * as rangeTypes from '../../src/rangeTypes'
import {
  Design,
  ClassNode,
  PropertyNode
} from '../../src/design'

export default function () {
  const design = new Design()
  const class4 = new ClassNode({ label: 'class4' })
  const class5 = new ClassNode({ label: 'class5' })
  const propD = new PropertyNode({ label: 'd', range: rangeTypes.text() })
  const propE = new PropertyNode({ label: 'e', range: rangeTypes.text() })
  const propA = new PropertyNode({ label: 'a', range: rangeTypes.boolean() })

  class4.addProperty(propD)
  class4.addProperty(propA)
  class5.addProperty(propE)

  class4.inheritsFrom('https://www.schesign.com/o/tests/inheritance_chain_1/0.1.0/class/class3')
  class5.inheritsFrom(class4)

  design.addClass(class4)
  design.addClass(class5)

  return design.toJSON()
}
