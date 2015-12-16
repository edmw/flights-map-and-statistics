import scope from '../Sources-Tests/application.scope.test';

import {
    default as ApplicationInjector,
    REGIONS_SERVICE
} from '../Sources/application/application.injector';

import RegionsService from '../Sources/application/regions.service';

describe('RegionsService', () => {
    'use strict';

    var injector;

    beforeEach(() => {
        injector = new ApplicationInjector();
    });

    it('should load all regions', (done) => {
        injector.injectServiceAdapter(scope, REGIONS_SERVICE, scope.regionsServiceResource)
            .getRegionsData()
            .then((data) => {
                expect(data).toBeDefined();
                expect(Object.keys(data).length).toBeGreaterThan(0);
                done();
            }
        );
    });

});
