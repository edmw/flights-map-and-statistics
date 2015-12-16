import {
    default as Service,
    ServiceError,
    ServiceJSONError,
    SERVICE_ERROR_EXCEPTION
} from '../Sources/application/service';

describe('Service (JSON/Errors)', () => {
    'use strict';

    var service;

    beforeEach(() => {
        service = new Service('/base/Sources-Tests/service.json.errors.test');
    });

    it('should get a parse error while loading invalid json data', (done) => {
        service.get()
            .then(done.fail)
            .catch((error) => {
                expect(error instanceof ServiceJSONError).toBeTruthy();
                done();
            });
    });

});
