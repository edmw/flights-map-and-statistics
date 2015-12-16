import scope from '../Sources-Tests/application.scope.test';

import ApplicationInjector from '../Sources/application/application.injector';

import Trip from '../Sources/application/trip';

import Flight from '../Sources/application/flight';

describe('Trip', () => {
    'use strict';

    var trip;

    var airports;
    var flight;

    beforeEach((done) => {
        trip = new Trip(1234, 'label', ['participant1', 'participant2']);

        let injector = new ApplicationInjector();
        airports = injector.injectAirports(scope);
        airports.load('').then(() => {
            let origination = airports.createAirport('YSSY'); // Sydney
            let destination = airports.createAirport('EGLL'); // London
            flight = new Flight(1234, origination, destination);
            flight.parseDateTimes('19990909', '10:00-15:00');
            done();
        });
    });

    it('should have a label from constructor', () => {
        expect(trip.label).toEqual('label');
    });
    it('should have participants from constructor', () => {
        expect(trip.participants.length).toEqual(2);
    });
    it('should have a getter for id from constructor', () => {
        expect(trip.id).toEqual(1234);
    });
    it('should have a default for undefined participants in constructor', () => {
        let t = new Trip(0, 'label');
        expect(t.participants).toEqual([]);
    });

    it('should contain no airports initially', () => {
        expect(trip.setOfAirports.size()).toEqual(0);
    });

    it('should contain no flights initially', () => {
        expect(trip.flights.length).toEqual(0);
        expect(trip.flightsByYear.size()).toEqual(0);
        expect(trip.numberOfFlights).toEqual(0);
        expect(trip.distanceForFlights).toEqual(0);
    });

    it('should have a filter for its label', () => {
        expect(trip.labelEquals('label')).toBeTruthy();
        expect(trip.labelEquals('other')).toBeFalsy();
    });

    it('should have a filter for its participants', () => {
        expect(trip.hasParticipant('participant1')).toBeTruthy();
        expect(trip.hasParticipant('participant2')).toBeTruthy();
        expect(trip.hasParticipant('participant3')).toBeFalsy();
    });

    it('should have a filter for its year', () => {
        expect(trip.tookPlaceInYear(1999)).toBeFalsy();
        expect(trip.tookPlaceInYear(2015)).toBeFalsy();
        trip.addFlight(flight);
        expect(trip.tookPlaceInYear(1999)).toBeTruthy();
        expect(trip.tookPlaceInYear(2015)).toBeFalsy();
    });

    it('should calculate the total distance for flights', () => {
        expect(trip.distanceForFlights).toEqual(0);
        trip.addFlight(flight);
        expect(trip.distanceForFlights).toBeCloseTo(17020.677, 2);
        trip.addFlight(flight);
        expect(trip.distanceForFlights).toBeCloseTo(34041.355, 2);
    });

});
