import scope from '../Sources-Tests/application.scope.test';

import ApplicationInjector from '../Sources/application/application.injector';

import Countries from '../Sources/application/countries';

import { Logger } from '../Sources/application/util.logger';

describe('Countries', () => {
    'use strict';

    var serviceSpy;

    var countriesWithSpies;
    var countries;

    beforeEach((done) => {
        serviceSpy = jasmine.createSpyObj('serviceSpy', ['getCountriesData']);
        countriesWithSpies = new Countries(serviceSpy);

        let injector = new ApplicationInjector();
        countries = injector.injectCountries(scope);
        countries.load('').then(() => {
            done();
        });
    });

    var countriesDataForDE = {
        'wiki': 'http://en.wikipedia.org/wiki/Germany',
        'iso': 'DE',
        'name': 'Germany'
    };

    it('should have a service object from constructor', () => {
        expect(countriesWithSpies.service).toEqual(serviceSpy);
    });

    it('should have a default logger', () => {
        expect(countriesWithSpies.logger).toBeDefined();
        expect(countriesWithSpies.logger instanceof Logger).toBeTruthy();
    });
    it('should have a setter to inject a logger', () => {
        let loggerSpy = jasmine.createSpy('logger');
        countriesWithSpies.setLogger(loggerSpy);
        expect(countriesWithSpies.logger).toBeDefined();
        expect(countriesWithSpies.logger.and.identity()).toEqual('logger');
    });

    it('should have zero countries initially', () => {
        expect(countriesWithSpies.numberOfCountries).toEqual(0);
        expect(countriesWithSpies.countryWithCode('DE')).toBeNull();
    });

    it('should throw error for invalid data', () => {
        expect(countriesWithSpies.setCountriesData.bind(countriesWithSpies, null))
            .toThrowError(TypeError);
    });

    it('should have one country from test data', () => {
        countriesWithSpies.setCountriesData([]);
        expect(countriesWithSpies.numberOfCountries).toEqual(0);
        countriesWithSpies.setCountriesData([countriesDataForDE]);
        expect(countriesWithSpies.numberOfCountries).toEqual(1);
        expect(countriesWithSpies.countryWithCode('DE')).not.toBeNull();
        countriesWithSpies.setCountriesData([countriesDataForDE]);
        expect(countriesWithSpies.numberOfCountries).toEqual(1);
    });

    it('should have many countries from countries data', () => {
        expect(countries.numberOfCountries).toBeGreaterThan(1);
        expect(countries.countryWithCode('DE')).not.toBeNull();
        expect(countries.countryWithCode('GB')).not.toBeNull();
    });

});
