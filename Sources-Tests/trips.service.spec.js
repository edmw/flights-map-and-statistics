import scope from '../Sources-Tests/application.scope.test';

import {
    default as ApplicationInjector,
    TRIPS_SERVICE
} from '../Sources/application/application.injector';

import TripsService from '../Sources/application/trips.service';

describe('TripsService', () => {
    'use strict';

    var injector;

    beforeEach(() => {
        injector = new ApplicationInjector();
    });

    it('should load all test trips', (done) => {
        injector.injectServiceAdapter(scope, TRIPS_SERVICE, scope.tripsServiceResource)
            .getTripsData()
            .then((data) => {
                expect(data).toBeDefined();
                expect(Object.keys(data).length).toBeGreaterThan(0);
                done();
            }
        );
    });

});
