import Model from '../Sources/application/model';

import Continent from '../Sources/application/continent';
import Country from '../Sources/application/country';
import Municipal from '../Sources/application/municipal';

describe('Model (Empty)', () => {
    'use strict';

    var model;

    beforeEach(() => {
        model = new Model([], []);
    });

    it('should have zero trips', () => {
        expect(model.numberOfTrips).toEqual(0);
    });
    it('should return undefined for any trip id', () => {
        expect(model.getTripById(0)).toBeUndefined();
        expect(model.getTripById(1234)).toBeUndefined();
    });

    it('should have zero airports', () => {
        expect(model.numberOfAirports).toEqual(0);
    });
    it('should return undefined for any airport id', () => {
        expect(model.getAirportById(0)).toBeUndefined();
        expect(model.getAirportById(1234)).toBeUndefined();
    });

    it('should have zero flights', () => {
        expect(model.numberOfFlights).toEqual(0);
    });
    it('should have zero flights for continent', () => {
        let continent = new Continent('codeOfContinent', 'nameOfContinent');
        expect(model.getNumberOfFlightsForContinent(continent)).toEqual(0);
    });
    it('should have zero flights for country', () => {
        let country = new Country('codeOfCountry', 'nameOfCountry');
        expect(model.getNumberOfFlightsForCountry(country)).toEqual(0);
    });
    it('should have zero flights for municipal', () => {
        let municipal = new Municipal('municipal');
        expect(model.getNumberOfFlightsForMunicipal(municipal)).toEqual(0);
    });
    it('should return undefined for any flight id', () => {
        expect(model.getFlightById(0)).toBeUndefined();
        expect(model.getFlightById(1234)).toBeUndefined();
    });

});
