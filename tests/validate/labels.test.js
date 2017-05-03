import { expect } from 'chai'
import {
  validateVersionLabel
} from '../../src/validate'

const { describe, it } = global

describe('validate/labels', () => {
  describe('validateVersionLabel()', () => {
    it('should fail when not a string', () => {
      const err = validateVersionLabel({})
      expect(err).to.equal('Label must be a string')
    })
    it('should fail for 1.0', () => {
      const err = validateVersionLabel('1.0')
      expect(err).to.equal('Label should be of format *.*.*')
    })
    it('should fail for 1.0.y', () => {
      const err = validateVersionLabel('1.0.y')
      expect(err).to.equal('Label should be of format *.*.*')
    })
    it('should not fail for master', () => {
      const err = validateVersionLabel('master')
      expect(err).to.equal(null)
    })
    it('should not fail for 1.0.89', () => {
      const err = validateVersionLabel('1.0.89')
      expect(err).to.equal(null)
    })
  })
})
