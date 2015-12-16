import scope from '../Sources-Tests/application.scope.test';

import ApplicationInjector from '../Sources/application/application.injector';

import Flights from '../Sources/application/flights';

import { Logger } from '../Sources/application/util.logger';

describe('Flights', () => {
    'use strict';

    var flights;

    var airports;

    beforeEach((done) => {
        flights = new Flights();

        let injector = new ApplicationInjector();
        airports = injector.injectAirports(scope);
        airports.load('').then(() => {
            done();
        });
    });

    it('should have a default logger', () => {
        expect(flights.logger).toBeDefined();
        expect(flights.logger instanceof Logger).toBeTruthy();
    });
    it('should have a setter to inject a logger', () => {
        let loggerSpy = jasmine.createSpy('logger');
        flights.setLogger(loggerSpy);
        expect(flights.logger).toBeDefined();
        expect(flights.logger.and.identity()).toEqual('logger');
    });

    it('should create a flight with two airports', () => {
        let flight1 = flights.createFlight(
            airports.createAirport('LHR'),
            airports.createAirport('FRA')
        );
        expect(flight1).not.toBeNull();
        expect(flight1.route).toEqual('EDDFEGLL');
        let flight2 = flights.createFlight(
            airports.createAirport('YSSY'),
            airports.createAirport('EGLL')
        );
        expect(flight2).not.toBeNull();
        expect(flight2.route).toEqual('EGLLYSSY');
        // check id
        expect(flight1.id).not.toEqual(flight2.id);
    });

});
