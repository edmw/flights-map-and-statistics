import scope from '../Sources-Tests/application.scope.test';

import {
    default as ApplicationInjector,
    AIRPORTS_SERVICE
} from '../Sources/application/application.injector';

import AirportsService from '../Sources/application/airports.service';

describe('AirportsService', () => {
    'use strict';

    var injector;

    beforeEach(() => {
        injector = new ApplicationInjector();
    });

    it('should load all airports', (done) => {
        injector.injectServiceAdapter(scope, AIRPORTS_SERVICE, scope.airportsServiceResource)
            .getAirportsData()
            .then((data) => {
                expect(data).toBeDefined();
                expect(Object.keys(data).length).toBeGreaterThan(0);
                done();
            }
        );
    });

});
