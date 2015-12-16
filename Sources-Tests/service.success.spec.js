import {
    default as Service
} from '../Sources/application/service';

describe('Service (Success)', () => {
    'use strict';

    var service;
    var service2;
    var service3;

    beforeEach(() => {
        service = new Service('/base/Sources-Tests/service.test');
        service2 = new Service('/base/Sources-Tests/service.test', 'cards');
        service3 = new Service('/base/Sources-Tests/service.test', '???');
    });

    it('should return data when loading test resource', (done) => {
        service.get()
            .then((data) => {
                expect(data).not.toBeNull();
                expect(data.name).toEqual('Happy Holidays');
                expect(data.cards.length).toEqual(10);
                done();
            })
            .catch((error) => {
                expect(error).toBeNull();
                done.fail();
            });
    });

    it('should return data when loading test resource twice', (done) => {
        var first = null;
        service.get()
            .then((data) => {
                first = data;
                service.get()
                .then((data) => {
                    expect(data).toBe(first);
                    expect(data.name).toEqual(first.name);
                    expect(data.cards.length).toEqual(first.cards.length);
                    done();
                })
                .catch((error) => {
                    expect(error).toBeNull();
                    done.fail();
                });
            })
            .catch((error) => {
                expect(error).toBeNull();
                done.fail();
            });
    });

    it('should return data when loading test resource with language option', (done) => {
        service.get({language: 'de'})
            .then((data) => {
                expect(data).not.toBeNull();
                expect(data.name).toEqual('Schöne Ferien');
                expect(data.cards.length).toEqual(10);
                done();
            })
            .catch((error) => {
                expect(error).toBeNull();
                done.fail();
            });
    });

    it('should return data from root element', (done) => {
        service2.get()
            .then((data) => {
                expect(data).not.toBeNull();
                expect(data.length).toEqual(10);
                done();
            })
            .catch((error) => {
                expect(error).toBeNull();
                done.fail();
            });
    });

    it('should return empty array from invalid root element', (done) => {
        service3.get()
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
