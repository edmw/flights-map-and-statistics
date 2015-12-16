import Country from '../Sources/application/country';

describe('Country', () => {
    'use strict';

    var country;

    beforeEach(() => {
        country = new Country('codeOfCountry', 'nameOfCountry');
    });

    it('should have a code from constructor', () => {
        expect(country.code).toEqual('codeOfCountry');
    });
    it('should have a name from constructor', () => {
        expect(country.name).toEqual('nameOfCountry');
    });
    it('should have a method named "key" returning its code', () => {
        expect(country.key()).toEqual(country.code);
    });
    it('should have a toString value matching its name', () => {
        expect(country.toString()).toEqual(country.name);
    });
    it('should have a method named "isEqualTo" comparing two countrys by their code', () => {
        let anotherCountry = new Country('anotherCodeOfCountry', 'anotherNameOfCountry');
        expect(country.isEqualTo(country)).toEqual(true);
        expect(country.isEqualTo(anotherCountry)).toEqual(false);
    });
});
