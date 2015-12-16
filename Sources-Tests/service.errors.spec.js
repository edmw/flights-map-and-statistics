import {
    default as Service,
    ServiceError,
    SERVICE_ERROR_EXCEPTION
} from '../Sources/application/service';

describe('Service (Errors)', () => {
    'use strict';

    var service;

    beforeEach(() => {
        service = new Service('/base/Sources-Tests/service.test');
    });

    it('should catch an exception from XMLHttpRequest', (done) => {
        var send = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(data) {
            throw(new Error()); // fake error in send
        };
        let revert = function() {
            XMLHttpRequest.prototype.send = send;
        };

        service.get()
            .then(() => {
                revert();
                done.fail();
            })
            .catch((error) => {
                revert();
                expect(error instanceof ServiceError).toBeTruthy();
                expect(error.code).toEqual(SERVICE_ERROR_EXCEPTION);
                done();
            });
    });

});
