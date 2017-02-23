import { expect } from 'chai';
import {
  createUid,
  isRequiredCardinality,
  isMultipleCardinality,
} from '../src/utils';

const { describe, it } = global;

describe('graph util functions', () => {
  describe('createUid()', () => {
    it('should throw an error for a bad ownerType', () => {
      try {
        const uid = createUid({ ownerType: null });
      } catch (err) {
        expect(err).to.eql(new Error('Bad ownerType, must be "u" or "o"'));
      }
    });
    it('should throw an error for a bad userOrOrg', () => {
      try {
        const uid = createUid({ ownerType: 'u' });
      } catch (err) {
        expect(err).to.eql(new Error('Bad userOrOrg, must be provided'));
      }
    });
    it('should create a user identifier', () => {
      const uid = createUid({
        ownerType: 'u',
        userOrOrg: 'user_name',
      });
      expect(uid).to.equal('https://www.schesign.com/u/user_name');
    });
    it('should create an org identifier', () => {
      const uid = createUid({
        ownerType: 'o',
        userOrOrg: 'org_name',
      });
      expect(uid).to.equal('https://www.schesign.com/o/org_name');
    });
    it('should create a design identifier', () => {
      const uid = createUid({
        ownerType: 'u',
        userOrOrg: 'user_name',
        designName: 'design_name',
      });
      expect(uid).to.equal('https://www.schesign.com/u/user_name/design_name');
    });
    it('should create a version identifier', () => {
      const uid = createUid({
        ownerType: 'u',
        userOrOrg: 'user_name',
        designName: 'design_name',
        versionLabel: '1.0.0',
      });
      expect(uid).to.equal('https://www.schesign.com/u/user_name/design_name/1.0.0');
    });
    it('should throw an error for a bad resourceType', () => {
      try {
        const uid = createUid({
          ownerType: 'u',
          userOrOrg: 'user_name',
          designName: 'design_name',
          versionLabel: '1.0.0',
          resourceType: 'x',
        });
      } catch (err) {
        expect(err).to.eql(new Error('Bad resourceType, must be "class" or "property"'));
      }
    });
    it('should throw an error without a resource provided', () => {
      try {
        const uid = createUid({
          ownerType: 'u',
          userOrOrg: 'user_name',
          designName: 'design_name',
          versionLabel: '1.0.0',
          resourceType: 'class',
        });
      } catch (err) {
        expect(err).to.eql(new Error('Option classOrProperty required with resourceType'));
      }
    });
    it('should create a class identifier', () => {
      const uid = createUid({
        ownerType: 'u',
        userOrOrg: 'user_name',
        designName: 'design_name',
        versionLabel: '1.0.0',
        resourceType: 'class',
        classOrProperty: 'class_name',
      });
      expect(uid).to.equal('https://www.schesign.com/u/user_name/design_name/1.0.0/class/class_name');
    });
    it('should create a property identifier', () => {
      const uid = createUid({
        ownerType: 'u',
        userOrOrg: 'user_name',
        designName: 'design_name',
        versionLabel: '1.0.0',
        resourceType: 'property',
        classOrProperty: 'property_name',
      });
      expect(uid).to.equal('https://www.schesign.com/u/user_name/design_name/1.0.0/property/property_name');
    });
  });
  describe('isRequiredCardinality()', () => {
    it('should not be required { minItems: 0 }', () => {
      const isRequired = isRequiredCardinality({ minItems: 0 });
      expect(isRequired).to.equal(false);
    });
    it('should be required { minItems: 1 }', () => {
      const isRequired = isRequiredCardinality({ minItems: 1 });
      expect(isRequired).to.equal(true);
    });
    it('should be required { minItems: 2 }', () => {
      const isRequired = isRequiredCardinality({ minItems: 2 });
      expect(isRequired).to.equal(true);
    });
  });
  describe('isMultipleCardinality()', () => {
    it('should not be required { maxItems: null }', () => {
      const isMultiple = isMultipleCardinality({ maxItems: null });
      expect(isMultiple).to.equal(true);
    });
    it('should be required { maxItems: 1 }', () => {
      const isMultiple = isMultipleCardinality({ maxItems: 1 });
      expect(isMultiple).to.equal(false);
    });
    it('should be required { maxItems: 2 }', () => {
      const isMultiple = isMultipleCardinality({ maxItems: 2 });
      expect(isMultiple).to.equal(true);
    });
  });
  describe('print', () => {
    it('should print propertyVariations', () => {
      // printDesign(propertyVariations)
    });
  });
});
