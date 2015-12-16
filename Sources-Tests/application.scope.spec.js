import ApplicationScope from '../Sources/application/application.scope';

import { LOG_WARN, LOG_ERROR } from '../Sources/application/util.logger';

var URI = require('URIjs');

describe('ApplicationScope', () => {
    'use strict';

    var scope;
    var defaultScope;

    beforeEach(() => {
        scope = new ApplicationScope(
            new URI('http://localhost/'),
            {
                logLevel: LOG_ERROR,
                countriesServiceResource: 'countriesServiceResource',
                regionsServiceResource: 'regionsServiceResource',
                airportsServiceResource: 'airportsServiceResource',
                tripsServiceResource: 'tripsServiceResource',
            }
        );
        defaultScope = new ApplicationScope(new URI('http://localhost/'));
    });

    it('should have an URI from constructor', () => {
        expect(scope.uri.domain()).toEqual('localhost');
    });

    it('should have a log level from constructor', () => {
        expect(scope.logLevel).toBe(LOG_ERROR);
    });
    it('should have a default log level', () => {
        expect(defaultScope.logLevel).toBe(LOG_WARN);
    });

    it('should have a countries service resource from options', () => {
        expect(scope.countriesServiceResource).toEqual('countriesServiceResource');
    });
    it('should have a regions service resource from options', () => {
        expect(scope.regionsServiceResource).toEqual('regionsServiceResource');
    });
    it('should have a airports service resource from options', () => {
        expect(scope.airportsServiceResource).toEqual('airportsServiceResource');
    });
    it('should have a trips service resource from options', () => {
        expect(scope.tripsServiceResource).toEqual('tripsServiceResource');
    });

    it('should have a non-empty toString', () => {
        expect(scope.toString()).toBeDefined();
        expect(scope.toString().length).toBeGreaterThan(0);
    });

});
