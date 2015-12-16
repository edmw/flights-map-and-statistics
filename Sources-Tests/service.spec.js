import {
    default as Service,
    ServiceError,
    ServiceJSONError,
    ServiceHTTPError,
    SERVICE_ERROR_JSON,
    SERVICE_ERROR_HTTP
} from '../Sources/application/service';

import { Logger } from '../Sources/application/util.logger';

describe('Service', () => {
    'use strict';

    var service;

    beforeEach(() => {
        service = new Service('/base/Sources-Tests/service.test');
    });

    it('should have a default logger', () => {
        expect(service.logger).toBeDefined();
        expect(service.logger instanceof Logger).toBeTruthy();
    });
    it('should have a setter to inject a logger', () => {
        let loggerSpy = jasmine.createSpy('logger');
        service.setLogger(loggerSpy);
        expect(service.logger).toBeDefined();
        expect(service.logger.and.identity()).toEqual('logger');
    });

    function checkServiceError(error, code, reason) {
        expect(error.code).toEqual(code);
        expect(error.reason).toEqual(reason);
    }
    it('should construct a ServiceError', () => {
        let code = 1234;
        let reason = 'reason';
        checkServiceError(new ServiceError(), 1, 'Service error');
        checkServiceError(new ServiceError(code), code, 'Service error');
        checkServiceError(new ServiceError(code, undefined), code, 'Service error');
        checkServiceError(new ServiceError(undefined, reason), 1, reason);
        checkServiceError(new ServiceError(code, reason), code, reason);
    });
    function checkServiceJSONError(error, reason) {
        expect(error.code).toEqual(SERVICE_ERROR_JSON);
        expect(error.reason).toEqual(reason);
    }
    it('should construct a ServiceJSONError', () => {
        let reason = 'text';
        checkServiceJSONError(new ServiceJSONError(), 'Service JSON error');
        checkServiceJSONError(new ServiceJSONError(reason), reason);
    });
    function checkServiceHTTPError(error, status, reason) {
        expect(error.code).toEqual(SERVICE_ERROR_HTTP);
        expect(error.status).toEqual(status);
        expect(error.reason).toEqual(reason);
    }
    it('should construct a ServiceHTTPError', () => {
        let status = 1234;
        let reason = 'text';
        checkServiceHTTPError(new ServiceHTTPError(), 9999, 'Service HTTP error');
        checkServiceHTTPError(new ServiceHTTPError(status), status, 'Service HTTP error');
        checkServiceHTTPError(new ServiceHTTPError(status, undefined), status, 'Service HTTP error');
        checkServiceHTTPError(new ServiceHTTPError(undefined, reason), 9999, reason);
        checkServiceHTTPError(new ServiceHTTPError(status, reason), status, reason);
    });

});
