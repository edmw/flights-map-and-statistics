import Airport from '../Sources/application/airport';

describe('Airport', () => {
    'use strict';

    var airport;

    beforeEach(() => {
        airport = new Airport(1234, 'iata', 'icao', 'nameOfAirport');
    });

    it('should have a iata code from constructor', () => {
        expect(airport.iata).toEqual('iata');
    });
    it('should have a icao code from constructor', () => {
        expect(airport.icao).toEqual('icao');
    });
    it('should have a name from constructor', () => {
        expect(airport.name).toEqual('nameOfAirport');
    });
    it('should have a getter for id from constructor', () => {
        expect(airport.id).toEqual(1234);
    });
    it('should have a method named "key" returning its combined code', () => {
        expect(airport.key()).toEqual('iataicao');
    });
    it('should have a toString value containing its id', () => {
        expect(airport.toString()).toMatch(/[^\d]1234[^\d]/);
    });
    it('should have a method named "isEqualTo" comparing two airports by their id', () => {
        let anotherAirport = new Airport(4321, 'iata', 'icao', 'nameOfAirport');
        expect(airport.isEqualTo(airport)).toBeTruthy();
        expect(airport.isEqualTo(anotherAirport)).toBeFalsy();
    });

});
