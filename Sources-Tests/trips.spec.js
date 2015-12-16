import scope from '../Sources-Tests/application.scope.test';

import ApplicationInjector from '../Sources/application/application.injector';

import Trips from '../Sources/application/trips';

import Flight from '../Sources/application/flight';

import { Logger } from '../Sources/application/util.logger';

describe('Trips', () => {
    'use strict';

    var airportsSpy;
    var flightsSpy;
    var serviceSpy;

    var tripsWithSpies;
    var trips;

    var flight;

    beforeEach((done) => {
        airportsSpy = jasmine.createSpyObj('airportsSpy', ['createAirport']);
        flightsSpy = jasmine.createSpyObj('flightsSpy', ['createFlight']);
        serviceSpy = jasmine.createSpyObj('serviceSpy', ['getTripsData']);
        tripsWithSpies = new Trips(airportsSpy, flightsSpy, serviceSpy);

        let injector = new ApplicationInjector();
        trips = injector.injectTrips(scope);
        Promise.all([
            trips.airports.continents.init(),
            trips.airports.countries.load(''),
            trips.airports.regions.load(''),
            trips.airports.load(''),
        ])
        .then(() => {
            trips.load().then(() => {
                // build flight for tests
                let origination = trips.airports.createAirport('YSSY'); // Sydney
                let destination = trips.airports.createAirport('EGLL'); // London
                flight = new Flight(1234, origination, destination);
                flight.parseDateTimes('19990909', '10:00-15:00');
                done();
            });
        });
    });

    it('should have a airports object from constructor', () => {
        expect(tripsWithSpies.airports).toBe(airportsSpy);
    });
    it('should have a flights object from constructor', () => {
        expect(tripsWithSpies.flights).toBe(flightsSpy);
    });
    it('should have a service object from constructor', () => {
        expect(tripsWithSpies.service).toBe(serviceSpy);
    });

    it('should have a default logger', () => {
        expect(tripsWithSpies.logger).toBeDefined();
        expect(tripsWithSpies.logger instanceof Logger).toBeTruthy();
    });
    it('should have a setter to inject a logger', () => {
        let loggerSpy = jasmine.createSpy('logger');
        tripsWithSpies.setLogger(loggerSpy);
        expect(tripsWithSpies.logger).toBeDefined();
        expect(tripsWithSpies.logger.and.identity()).toEqual('logger');
    });

    it('should have an undefined title initially', () => {
        expect(tripsWithSpies.title).toBeUndefined();
    });

    it('should have an undefined home airport initially', () => {
        expect(tripsWithSpies.homeAirport).toBeUndefined();
    });

    it('should return an empty list of labels initially', () => {
        expect(tripsWithSpies.labels()).toEqual([]);
    });
    it('should return an empty list of participants initially', () => {
        expect(tripsWithSpies.participants()).toEqual([]);
    });
    it('should return an empty list of years initially', () => {
        expect(tripsWithSpies.years()).toEqual([]);
    });

    it('should have an empty list of trips initially', () => {
        // private
        expect(tripsWithSpies.listOfTrips).toEqual([]);
    });

    it('should have an empty set of airports initially', () => {
        // private
        expect(tripsWithSpies.airportsByCode).toEqual({});
    });

    it('should have an trip id set to zero initially', () => {
        // private
        expect(tripsWithSpies.tripId).toEqual(0);
    });

    it('should create trips with unique trip id', () => {
        // private
        let trip1 = tripsWithSpies.createTrip('label1');
        let trip2 = tripsWithSpies.createTrip('label2');
        expect(trip1.id).not.toEqual(trip2.id);
    });

    it('should add trips to list of trips', () => {
        // private
        let trip1 = tripsWithSpies.createTrip('label1');
        tripsWithSpies.addTrip(trip1);
        expect(tripsWithSpies.listOfTrips.length).toEqual(1);
        expect(tripsWithSpies.listOfTrips).toEqual([trip1]);
        let trip2 = tripsWithSpies.createTrip('label2');
        tripsWithSpies.addTrip(trip2);
        expect(tripsWithSpies.listOfTrips.length).toEqual(2);
        expect(tripsWithSpies.listOfTrips).toEqual([trip1, trip2]);
    });

    it('should have labels from example data', () => {
        expect(trips.labels()).toEqual(['Trip 1', 'Trip 2']);
        // add extra trip
        trips.addTrip(trips.createTrip('label1'));
        expect(trips.labels()).toEqual(['Trip 1', 'Trip 2', 'label1']);
    });

    it('should have participants from example data', () => {
        expect(trips.participants()).toEqual(['Alice', 'Bob', 'Carol']);
        trips.addTrip(trips.createTrip('label1', ['Jay', 'Gloria']));
        trips.addTrip(trips.createTrip('label2'));
        expect(trips.participants()).toEqual(['Alice', 'Bob', 'Carol', 'Gloria', 'Jay']);
        // add extra trip (with no participants)
        trips.addTrip(trips.createTrip('label1'));
        expect(trips.participants()).toEqual(['Alice', 'Bob', 'Carol', 'Gloria', 'Jay']);
    });

    it('should have years from example data', () => {
        expect(trips.years()).toEqual(['2002', '2222']);
        let trip = trips.createTrip('label1');
        trip.addFlight(flight);
        trips.addTrip(trip);
        trips.addTrip(trips.createTrip('label2'));
        expect(trips.years()).toEqual(['1999', '2002', '2222']);
    });

    it('should get airport objects for codes', () => {
        // private
        expect(trips.getAirport(null)).toBeNull();
        expect(trips.getAirport(undefined)).toBeNull();
        expect(trips.getAirport('????')).toBeNull();
        let airportFrankfurtByIATA = trips.getAirport('FRA');
        expect(airportFrankfurtByIATA).not.toBeNull();
        expect(airportFrankfurtByIATA).toBe(trips.getAirport('FRA'));
        let airportFrankfurtByICAO = trips.getAirport('EDDF');
        expect(airportFrankfurtByICAO).toBe(airportFrankfurtByIATA);
    });

    // FETCHING

    it('should fetch no trips and no airports initially', () => {
        let result = tripsWithSpies.fetch();
        expect(result.trips.length).toEqual(0);
        expect(result.airports.length).toEqual(0);
    });

    it('should fetch trips and airports for example data', () => {
        let result = trips.fetch();
        expect(result.trips.length).toEqual(2);
        expect(result.airports.length).toEqual(5);
    });

    it('should fetch trips and airports filtered by label', () => {
        let result1 = trips.fetch({label: 'Trip 1'});
        expect(result1.trips.length).toEqual(1);
        expect(result1.airports.length).toEqual(3);
        let result2 = trips.fetch({label: 'Trip ?'});
        expect(result2.trips.length).toEqual(0);
        expect(result2.airports.length).toEqual(0);
    });

    it('should fetch trips and airports filtered by participant', () => {
        let result1 = trips.fetch({participant: 'Carol'});
        expect(result1.trips.length).toEqual(1);
        expect(result1.airports.length).toEqual(3);
        let result2 = trips.fetch({participant: 'Jay'});
        expect(result2.trips.length).toEqual(0);
        expect(result2.airports.length).toEqual(0);
    });

    it('should fetch trips and airports filtered by year', () => {
        let result1 = trips.fetch({year: 2002});
        expect(result1.trips.length).toEqual(1);
        expect(result1.airports.length).toEqual(3);
        let result2 = trips.fetch({year: 1999});
        expect(result2.trips.length).toEqual(0);
        expect(result2.airports.length).toEqual(0);
    });

    it('should fetch trips and airports with combined filters', () => {
        let result1 = trips.fetch({label: 'Trip 1', year: 2222});
        expect(result1.trips.length).toEqual(1);
        expect(result1.airports.length).toEqual(3);
        let result2 = trips.fetch({label: 'Trip 2', year: 2222});
        expect(result2.trips.length).toEqual(0);
        expect(result2.airports.length).toEqual(0);
    });

});
