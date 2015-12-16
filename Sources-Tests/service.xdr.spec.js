import {
    default as Service,
    ServiceHTTPError
} from '../Sources/application/service';

describe('Service (XDR)', () => {
    'use strict';

    var service;

    beforeEach(() => {
        service = new Service('http://google.com/test');
    });

    it('should get an error while loading cross-domain resource', (done) => {
        service.get({language: 'en'})
            .then(done.fail)
            .catch((error) => {
                expect(error instanceof ServiceHTTPError).toBeTruthy();
                done();
            });
    });

});
