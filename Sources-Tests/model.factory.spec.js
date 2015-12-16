import scope from '../Sources-Tests/application.scope.test';

import ModelFactory from '../Sources/application/model.factory';

import ApplicationInjector from '../Sources/application/application.injector';

import { Logger } from '../Sources/application/util.logger';

describe('ModelFactory', () => {
    'use strict';

    var factory;

    var trips;
    var airports;

    beforeEach((done) => {
        factory = new ModelFactory();

        let injector = new ApplicationInjector();
        let runner = injector.injectApplicationRunner(scope);
        runner.load().then(() => {
            let result = runner.trips.fetch();
            trips = result.trips;
            airports = result.airports;
            done();
        });
    });

    it('should have a default logger', () => {
        expect(factory.logger).toBeDefined();
        expect(factory.logger instanceof Logger).toBeTruthy();
    });
    it('should have a setter to inject a logger', () => {
        let loggerSpy = jasmine.createSpy('logger');
        factory.setLogger(loggerSpy);
        expect(factory.logger).toBeDefined();
        expect(factory.logger.and.identity()).toEqual('logger');
    });

    it('should create a model from a list of trips and airports', () => {
        let model = factory.create(trips, airports);
        expect(model.numberOfTrips).toEqual(2);
        expect(model.numberOfAirports).toEqual(5);
    });

});
