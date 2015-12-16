import scope from '../Sources-Tests/application.scope.test';

import ApplicationInjector from '../Sources/application/application.injector';

import Flight from '../Sources/application/flight';

var moment = require('moment');

describe('Flight', () => {
    'use strict';

    var airports;
    var flight;

    beforeEach((done) => {
        let injector = new ApplicationInjector();
        airports = injector.injectAirports(scope);
        airports.load('').then(() => {
            let origination = airports.createAirport('YSSY'); // Sydney
            let destination = airports.createAirport('EGLL'); // London
            flight = new Flight(1234, origination, destination);
            done();
        });
    });

    it('should have a origination airport from constructor', () => {
        expect(flight.origination.icao).toEqual('YSSY');
    });
    it('should have a destination airport from constructor', () => {
        expect(flight.destination.icao).toEqual('EGLL');
    });
    it('should have a getter for id from constructor', () => {
        expect(flight.id).toEqual(1234);
    });
    it('should have a method named "key" returning the combined airport keys', () => {
        expect(flight.key()).toEqual(flight.origination.key() + flight.destination.key());
    });
    it('should have a toString value containing its id', () => {
        expect(flight.toString()).toMatch(/[^\d]1234[^\d]/);
    });
    it('should have a method named "isEqualTo" comparing two flights by their id', () => {
        let anotherFlight = new Flight(4321, flight.origination, flight.destination);
        expect(flight.isEqualTo(flight)).toEqual(true);
        expect(flight.isEqualTo(anotherFlight)).toEqual(false);
    });

    it('should have date and times initialized after construction', () => {
        expect(flight.date).toBeNull();
        expect(flight.departureTime).toBeNull();
        expect(flight.arrivalTime).toBeNull();
        expect(flight.year).toBeUndefined();
    });

    it('should have distance between orign and destination calculated after construction', () => {
        expect(flight.distance).toBeGreaterThan(17018);
        expect(flight.distance).toBeLessThan(17022);
    });

    it('should have a route identifier from constructor', () => {
        expect(flight.route).toEqual('EGLLYSSY');
    });
    it('should have a route identifier regardless of the direction of the flight', () => {
        let origination = flight.origination;
        let destination = flight.destination;
        let outbound = new Flight(1, origination, destination);
        let inbound = new Flight(2, destination, origination);
        expect(outbound.route).toEqual(inbound.route);
    });

    it('should parse and set date and time', () => {
        flight.parseDateTimes('20150203', '10:00-15:00');
        expect(flight.date.isSame('2015-02-03')).toBeTruthy();
        expect(flight.departureTime.isSame('2015-02-03 10:00')).toBeTruthy();
        expect(flight.arrivalTime.isSame('2015-02-03 15:00')).toBeTruthy();
        expect(flight.year).toEqual(2015);
    });

    it('should parse and set date defining only year and month', () => {
        flight.parseDateTimes('201502', '14:00-15:00');
        expect(flight.date.isSame('2015-02-01')).toBeTruthy();
        expect(flight.departureTime.isSame('2015-02-01 14:00')).toBeTruthy();
        expect(flight.arrivalTime.isSame('2015-02-01 15:00')).toBeTruthy();
        expect(flight.year).toEqual(2015);
    });

    it('should parse and set date defining only year', () => {
        flight.parseDateTimes('2015', '10:00-15:00');
        expect(flight.date.isSame('2015-01-01')).toBeTruthy();
        expect(flight.departureTime.isSame('2015-01-01 10:00')).toBeTruthy();
        expect(flight.arrivalTime.isSame('2015-01-01 15:00')).toBeTruthy();
        expect(flight.year).toEqual(2015);
    });

    it('should parse and set date to null if invalid', () => {
        flight.parseDateTimes(null, '10:00-15:00');
        expect(flight.date).toBeNull();
        expect(flight.departureTime).toBeNull();
        expect(flight.arrivalTime).toBeNull();
        expect(flight.year).toBeUndefined();
        flight.parseDateTimes('?', '10:00-15:00');
        expect(flight.date).toBeNull();
        expect(flight.departureTime).toBeNull();
        expect(flight.arrivalTime).toBeNull();
        expect(flight.year).toBeUndefined();
        flight.parseDateTimes('YEAR', '10:00-15:00');
        expect(flight.date).toBeNull();
        expect(flight.departureTime).toBeNull();
        expect(flight.arrivalTime).toBeNull();
        expect(flight.year).toBeUndefined();
    });

    it('should parse and set times with plus one day', () => {
        flight.parseDateTimes('20150101', '10:00-15:00+1');
        expect(flight.date.isSame('2015-01-01')).toBeTruthy();
        expect(flight.departureTime.isSame('2015-01-01 10:00')).toBeTruthy();
        expect(flight.arrivalTime.isSame('2015-01-02 15:00')).toBeTruthy();
        expect(flight.year).toEqual(2015);
    });

    it('should parse and set times to null if invalid', () => {
        flight.parseDateTimes('20150101', null);
        expect(flight.date).not.toBeNull();
        expect(flight.departureTime).toBeNull();
        expect(flight.arrivalTime).toBeNull();
        flight.parseDateTimes('20150101', 'null');
        expect(flight.date).not.toBeNull();
        expect(flight.departureTime).toBeNull();
        expect(flight.arrivalTime).toBeNull();
        flight.parseDateTimes('20150101', 'A0:00-15:00');
        expect(flight.date).not.toBeNull();
        expect(flight.departureTime).toBeNull();
        expect(flight.arrivalTime).toBeNull();
    });

    it('should format a string for the flights date', () => {
        // date not set yet
        expect(flight.dateToString()).toEqual('');
        // date
        flight.parseDateTimes('20150203', '10:00-15:00');
        expect(flight.dateToString()).toEqual(moment('2015-02-03').format('LL'));
        // just the year and month
        flight.parseDateTimes('201502', '10:00-15:00');
        expect(flight.dateToString()).toEqual(moment('2015-02-01').format('MMMM YYYY'));
        // just the year
        flight.parseDateTimes('2015', '10:00-15:00');
        expect(flight.dateToString()).toEqual(moment('2015-01-01').format('YYYY'));
        // break dateType
        flight.dateType = 'INVALID';
        expect(flight.dateToString()).toEqual('');
    });

    it('should format a string for the flights departure time', () => {
        // date not set yet
        expect(flight.departureTimeToString()).toEqual('');
        flight.parseDateTimes('20150203', '10:00-15:00');
        expect(flight.departureTimeToString()).toEqual('10:00');
    });

    it('should format a string for the flights arrival time', () => {
        // date not set yet
        expect(flight.arrivalTimeToString()).toEqual('');
        flight.parseDateTimes('20150203', '10:00-15:00');
        expect(flight.arrivalTimeToString()).toEqual('15:00');
        // plus 1 day
        flight.parseDateTimes('20150203', '10:00-15:00+1');
        expect(flight.arrivalTimeToString()).toEqual('15:00+1');
    });

});
