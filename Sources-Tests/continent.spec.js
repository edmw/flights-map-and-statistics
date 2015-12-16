import Continent from '../Sources/application/continent';

describe('Continent', () => {
    'use strict';

    var continent;

    beforeEach(() => {
        continent = new Continent('codeOfContinent', 'nameOfContinent');
    });

    it('should have a code from constructor', () => {
        expect(continent.code).toEqual('codeOfContinent');
    });
    it('should have a name from constructor', () => {
        expect(continent.name).toEqual('nameOfContinent');
    });
    it('should have a method named "key" returning its code', () => {
        expect(continent.key()).toEqual(continent.code);
    });
    it('should have a toString value matching its name', () => {
        expect(continent.toString()).toEqual(continent.name);
    });
});
