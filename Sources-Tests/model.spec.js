import scope from '../Sources-Tests/application.scope.test';

import ApplicationInjector from '../Sources/application/application.injector';

import Model from '../Sources/application/model';

import { Logger } from '../Sources/application/util.logger';

describe('Model', () => {
    'use strict';

    var model;

    beforeEach((done) => {
        let injector = new ApplicationInjector();
        let runner = injector.injectApplicationRunner(scope);
        runner.load().then(() => {
            let result = runner.trips.fetch();
            model = new Model(result.trips, result.airports);
            done();
        });
    });

    it('should have a default logger', () => {
        expect(model.logger).toBeDefined();
        expect(model.logger instanceof Logger).toBeTruthy();
    });
    it('should have a setter to inject a logger', () => {
        let loggerSpy = jasmine.createSpy('logger');
        model.setLogger(loggerSpy);
        expect(model.logger).toBeDefined();
        expect(model.logger.and.identity()).toEqual('logger');
    });

    // Trip 1: LHR - JFK: 5555 km
    // Trip 1: JFK - LAX: 3983 km
    // Trip 1: Total: 9538 km
    // Trip 2: LHR - MIA: 7121 km
    // Trip 2: MIA - SJO: 1797 km
    // Trip 2: Total: 8918 km
    // Total: 18456 km
    // LHR (25 m)
    // JFK (4 m)
    // LAX (38 m)
    // MIA (2 m)
    // SJO (921 m)

    it('should have 2 trips', () => {
        expect(model.numberOfTrips).toEqual(2);
    });

    it('should have 5 airports', () => {
        expect(model.numberOfAirports).toEqual(5);
    });

    it('should have a highest airport at approximate 921 m', () => {
        let airport = model.airportWithHighestElevation;
        expect(airport.iata).toEqual('SJO');
        // elevation is in feet
        expect(airport.elevation).toBeGreaterThan(3000);
        expect(airport.elevation).toBeLessThan(3040);
    });

    it('should have a lowest airport at approximate 2 m', () => {
        let airport = model.airportWithLowestElevation;
        expect(airport.iata).toEqual('MIA');
        // elevation is in feet
        expect(airport.elevation).toBeGreaterThan(0);
        expect(airport.elevation).toBeLessThan(10);
    });

    it('should count the airports', () => {
        for (let airport of model.airports) {
            if (airport.iata === 'SJO') {
                expect(model.getFrequencyForAirport(airport)).toEqual(1);
            }
            else if (airport.iata === 'LHR') {
                expect(model.getFrequencyForAirport(airport)).toEqual(2);
            }
        }
    });

    it('should have 4 flights', () => {
        expect(model.numberOfFlights).toEqual(4);
    });

    it('should have 1 domestic flights', () => {
        expect(model.numberOfDomesticFlights).toEqual(1);
    });

    it('should have 1 continental flights', () => {
        expect(model.numberOfContinentalFlights).toEqual(1);
    });

    it('should have 2 intercontinental flights', () => {
        expect(model.numberOfIntercontinentalFlights).toEqual(2);
    });

    it('should have a total distance of approximate 18450 km for flights', () => {
        expect(model.totalDistanceForFlights).toBeGreaterThan(18425);
        expect(model.totalDistanceForFlights).toBeLessThan(18475);
    });

    it('should have a longest flight with approximate 7120 km', () => {
        let flight = model.flightWithLongestDistance;
        expect(flight.distance).toBeGreaterThan(7100);
        expect(flight.distance).toBeLessThan(7140);
    });

    it('should have a shortest flight with approximate 1800 km', () => {
        let flight = model.flightWithShortestDistance;
        expect(flight.distance).toBeGreaterThan(1780);
        expect(flight.distance).toBeLessThan(1820);
    });

});
