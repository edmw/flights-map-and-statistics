import {
    default as Service
} from '../Sources/application/service';

describe('Service (JSON/Null)', () => {
    'use strict';

    var service;

    beforeEach(() => {
        service = new Service('/base/Sources-Tests/service.json.null.test');
    });

    it('should return an empty array while loading null json data', (done) => {
        service.get()
            .then((data) => {
                expect(data).toEqual([]);
                done();
            })
            .catch((error) => {
                expect(error).toBeNull();
                done.fail();
            });
    });

});
