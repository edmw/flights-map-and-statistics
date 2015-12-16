import Region from '../Sources/application/region';

describe('Region', () => {
    'use strict';

    var region;

    beforeEach(() => {
        region = new Region('codeOfRegion', 'nameOfRegion');
    });

    it('should have a code from constructor', () => {
        expect(region.code).toEqual('codeOfRegion');
    });
    it('should have a name from constructor', () => {
        expect(region.name).toEqual('nameOfRegion');
    });
    it('should have a method named "key" returning its code', () => {
        expect(region.key()).toEqual(region.code);
    });
    it('should have a toString value matching its name', () => {
        expect(region.toString()).toEqual(region.name);
    });
    it('should have a method named "isEqualTo" comparing two regions by their code', () => {
        let anotherRegion = new Region('anotherCodeOfRegion', 'anotherNameOfRegion');
        expect(region.isEqualTo(region)).toEqual(true);
        expect(region.isEqualTo(anotherRegion)).toEqual(false);
    });
});
