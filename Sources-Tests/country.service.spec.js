import scope from '../Sources-Tests/application.scope.test';

import {
    default as ApplicationInjector,
    COUNTRIES_SERVICE
} from '../Sources/application/application.injector';

import CountriesService from '../Sources/application/countries.service';

describe('CountriesService', () => {
    'use strict';

    var injector;

    beforeEach(() => {
        injector = new ApplicationInjector();
    });

    it('should load all countries', (done) => {
        injector.injectServiceAdapter(scope, COUNTRIES_SERVICE, scope.countriesServiceResource)
            .getCountriesData()
            .then((data) => {
                expect(data).toBeDefined();
                expect(Object.keys(data).length).toBeGreaterThan(0);
                done();
            }
        );
    });

});
