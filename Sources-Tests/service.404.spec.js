import {
    default as Service,
    ServiceHTTPError
} from '../Sources/application/service';

describe('Service (404)', () => {
    'use strict';

    var service;

    beforeEach(() => {
        service = new Service('/base/Sources-Tests/service.404');
    });

    it('should get a 404 while loading non-existing resource', (done) => {
        service.get()
            .then(done.fail)
            .catch((error) => {
                expect(error instanceof ServiceHTTPError).toBeTruthy();
                expect(error.status).toEqual(404);
                done();
            });
    });

    it('should get a 404 while loading non-existing resource with language option', (done) => {
        service.get({language: 'en'})
            .then(done.fail)
            .catch((error) => {
                expect(error instanceof ServiceHTTPError).toBeTruthy();
                expect(error.status).toEqual(404);
                done();
            });
    });

});
