import Municipal from '../Sources/application/municipal';

describe('Municipal', () => {
    'use strict';

    var municipal;

    beforeEach(() => {
        municipal = new Municipal('nameOfMunicipal');
    });

    it('should have a name from constructor', () => {
        expect(municipal.name).toEqual('nameOfMunicipal');
    });
    it('should have a method named "key" returning its name', () => {
        expect(municipal.key()).toEqual(municipal.name);
    });
    it('should have a toString value matching its name', () => {
        expect(municipal.toString()).toEqual(municipal.name);
    });
});
