import scope from '../Sources-Tests/application.scope.test';

import ApplicationInjector from '../Sources/application/application.injector';

import Regions from '../Sources/application/regions';

import { Logger } from '../Sources/application/util.logger';

describe('Regions', () => {
    'use strict';

    var serviceSpy;

    var regionsWithSpies;
    var regions;

    beforeEach((done) => {
        serviceSpy = jasmine.createSpyObj('serviceSpy', ['getRegionsData']);
        regionsWithSpies = new Regions(serviceSpy);

        let injector = new ApplicationInjector();
        regions = injector.injectRegions(scope);
        regions.load('').then(() => {
            done();
        });
    });

    var regionsDataForGTQZ = {
        'wiki': 'http://en.wikipedia.org/wiki/Quetzaltenango',
        'iso': 'GT-QZ',
        'name': 'Quetzaltenango'
    };

    it('should have a service object from constructor', () => {
        expect(regionsWithSpies.service).toEqual(serviceSpy);
    });

    it('should have a default logger', () => {
        expect(regionsWithSpies.logger).toBeDefined();
        expect(regionsWithSpies.logger instanceof Logger).toBeTruthy();
    });
    it('should have a setter to inject a logger', () => {
        let loggerSpy = jasmine.createSpy('logger');
        regionsWithSpies.setLogger(loggerSpy);
        expect(regionsWithSpies.logger).toBeDefined();
        expect(regionsWithSpies.logger.and.identity()).toEqual('logger');
    });

    it('should have zero regions initially', () => {
        expect(regionsWithSpies.numberOfRegions).toEqual(0);
        expect(regionsWithSpies.regionWithCode('GT-QZ')).toBeNull();
    });

    it('should throw error for invalid data', () => {
        expect(regionsWithSpies.setRegionsData.bind(regionsWithSpies, null))
            .toThrowError(TypeError);
    });

    it('should have one region from test data', () => {
        regionsWithSpies.setRegionsData([]);
        expect(regionsWithSpies.numberOfRegions).toEqual(0);
        regionsWithSpies.setRegionsData([regionsDataForGTQZ]);
        expect(regionsWithSpies.numberOfRegions).toEqual(1);
        expect(regionsWithSpies.regionWithCode('GT-QZ')).not.toBeNull();
        regionsWithSpies.setRegionsData([regionsDataForGTQZ]);
        expect(regionsWithSpies.numberOfRegions).toEqual(1);
    });

    it('should have many regions from regions data', () => {
        expect(regions.numberOfRegions).toBeGreaterThan(1);
        expect(regions.regionWithCode('GT-QZ')).not.toBeNull();
        expect(regions.regionWithCode('IN-PB')).not.toBeNull();
    });

});
