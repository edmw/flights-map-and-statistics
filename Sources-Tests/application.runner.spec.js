import scope from '../Sources-Tests/application.scope.test';

import ApplicationInjector from '../Sources/application/application.injector';

import ApplicationRunner from '../Sources/application/application.runner';

import { Logger } from '../Sources/application/util.logger';

describe('ApplicationRunner', () => {
    'use strict';

    var continentsSpy;
    var countriesSpy;
    var regionsSpy;
    var airportsSpy;
    var flightsSpy;
    var tripsSpy;
    var viewSpy;
    var modelFactorySpy;

    var runnerWithSpies;
    var runner;

    beforeEach(() => {
        continentsSpy = jasmine.createSpyObj('continentsSpy', ['init', 'continentWithCode']);
        countriesSpy = jasmine.createSpyObj('countriesSpy', ['load', 'countryWithCode']);
        regionsSpy = jasmine.createSpyObj('regionsSpy', ['load', 'regionWithCode']);
        airportsSpy = jasmine.createSpyObj('airportsSpy', ['load', 'createAirport']);
        flightsSpy = jasmine.createSpyObj('flightsSpy', ['createFlight']);
        tripsSpy = jasmine.createSpyObj('tripsSpy', ['load']);
        viewSpy = jasmine.createSpyObj('viewSpy',
            [
                'init', 'block', 'unblock', 'subscribe',
                'showAirport', 'addFilter', 'getFilterValue', 'showTools',
                'update'
            ]
        );
        modelFactorySpy = jasmine.createSpyObj('modelFactorySpy', ['create']);
        runnerWithSpies = new ApplicationRunner(
            continentsSpy, countriesSpy, regionsSpy,
            airportsSpy, flightsSpy, tripsSpy,
            viewSpy, modelFactorySpy
        );

        let injector = new ApplicationInjector();
        runner = injector.injectApplicationRunner(scope);
        // mock view
        viewSpy.subscribe.and.callFake((event, callback) => { callback(); return viewSpy; });
        runner.view = viewSpy;
    });

    it('should have a continents object from constructor', () => {
        expect(runnerWithSpies.continents).toBe(continentsSpy);
    });
    it('should have a countries object from constructor', () => {
        expect(runnerWithSpies.countries).toBe(countriesSpy);
    });
    it('should have a regions object from constructor', () => {
        expect(runnerWithSpies.regions).toBe(regionsSpy);
    });
    it('should have a airports object from constructor', () => {
        expect(runnerWithSpies.airports).toBe(airportsSpy);
    });
    it('should have a flights object from constructor', () => {
        expect(runnerWithSpies.flights).toBe(flightsSpy);
    });
    it('should have a trips object from constructor', () => {
        expect(runnerWithSpies.trips).toBe(tripsSpy);
    });
    it('should have a view object from constructor', () => {
        expect(runnerWithSpies.view).toBe(viewSpy);
    });
    it('should have a model factory object from constructor', () => {
        expect(runnerWithSpies.modelFactory).toBe(modelFactorySpy);
    });

    it('should have a default logger', () => {
        expect(runnerWithSpies.logger).toBeDefined();
        expect(runnerWithSpies.logger instanceof Logger).toBeTruthy();
    });
    it('should have a setter to inject a logger', () => {
        let loggerSpy = jasmine.createSpy('logger');
        runnerWithSpies.setLogger(loggerSpy);
        expect(runnerWithSpies.logger).toBeDefined();
        expect(runnerWithSpies.logger.and.identity()).toEqual('logger');
    });

    it('should call callback after initialization', (done) => {
        runnerWithSpies.init(done);
    });

    // LOADING

    var ResolvedPromise = new Promise((resolve, reject) => { resolve(); });
    var RejectedPromise = new Promise((resolve, reject) => { reject(); });

    function checkLoading(done, expectedResult,
        continentsResult, countriesResult, regionsResult, airportsResult, tripsResult
    ) {
        continentsSpy.init.and.returnValue(continentsResult);
        countriesSpy.load.and.returnValue(countriesResult);
        regionsSpy.load.and.returnValue(regionsResult);
        airportsSpy.load.and.returnValue(airportsResult);
        tripsSpy.load.and.returnValue(tripsResult);
        runnerWithSpies.load()
            .then(() => {
                if (expectedResult) {
                    done();
                }
                else {
                    done.fail();
                }
            })
            .catch((error) => {
                if (expectedResult) {
                    done.fail();
                }
                else {
                    done();
                }
            });
    }

    it('should succeed when loading with spies', (done) => {
        checkLoading(done, true,
            ResolvedPromise, ResolvedPromise, ResolvedPromise, ResolvedPromise, ResolvedPromise
        );
    });
    it('should fail when loading with spies', (done) => {
        checkLoading(done, false,
            RejectedPromise, ResolvedPromise, ResolvedPromise, ResolvedPromise, ResolvedPromise
        );
        checkLoading(done, false,
            ResolvedPromise, RejectedPromise, ResolvedPromise, ResolvedPromise, ResolvedPromise
        );
        checkLoading(done, false,
            ResolvedPromise, ResolvedPromise, RejectedPromise, ResolvedPromise, ResolvedPromise
        );
        checkLoading(done, false,
            ResolvedPromise, ResolvedPromise, ResolvedPromise, RejectedPromise, ResolvedPromise
        );
        checkLoading(done, false,
            ResolvedPromise, ResolvedPromise, ResolvedPromise, ResolvedPromise, RejectedPromise
        );
    });
    it('should fail with error when loading with spies', (done) => {
        let RejectedPromiseWithError = new Promise((resolve, reject) => {
            reject(new Error());
        });
        checkLoading(done, false,
            RejectedPromiseWithError, ResolvedPromise, ResolvedPromise, ResolvedPromise, ResolvedPromise
        );
        checkLoading(done, false,
            ResolvedPromise, ResolvedPromise, ResolvedPromise, ResolvedPromise, RejectedPromiseWithError
        );
    });

    // STARTING

    it('should succeed when starting', (done) => {
        runner.start((result) => {
            expect(result).toEqual(0);
            done();
        });
    });

    it('should fail with init error when starting', (done) => {
        continentsSpy.init.and.returnValue(RejectedPromise);
        runner.continents = countriesSpy;
        runner.start((result) => {
            expect(result).not.toEqual(0);
            done();
        });
    });

});
