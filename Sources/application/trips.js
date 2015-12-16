/**
 * @file trips.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import Trip from './trip';
import Airport from './airport';
import Flight from './flight';

import buckets from './util.buckets';

import { Logger } from './util.logger';

/**
 * Trips class. A collection of trips forming a journey.
 * @class Trips
 * @param {Airports} airports
 * @param {Flights} flights
 * @param {TripsService} service - Service Adapter to access the servers Trips API.
 */
export default class Trips {
    constructor(airports, flights, service) {
        this.logger = new Logger();

        this.airports = airports;
        this.flights = flights;

        this.service = service;

        this.init();
    }
    /**
     * Injects a logger. Usually this method is called by an injector class.
     * Because a logger is optional it is not injected via constructor.
     * @public
     * @method Trips#setLogger
     * @param {Logger} logger
     */
    setLogger(logger) {
        this.logger = logger;
    }

    init() {
        /**
         * @private
         * @member {Array} Trips#listOfTrips - Collection of all trips managed by this class.
         */
        this.listOfTrips = [];

        /**
         * @private
         * @member {Map} Trips#airportsByCode - Lookup table for airports by IATA code.
         */
        this.airportsByCode = {};

        /**
         * @private
         * @member {Number} Trips#tripId - Internal counter to ensure a
         *      unqiue trip id for {@link Trip} objects.
         */
        this.tripId = 0;

        /**
         * @public
         * @member {String} Trips#title
         */
        this.title = undefined;
        /**
         * @public
         * @member {Airport} Trips#homeAirport
         */
        this.homeAirport = undefined;
    }

    /**
     * Creates a new {@link Trip} object. Ensures that every different
     * trip has its unique id.
     * @private
     * @method Trips#createTrip
     * @param {String} label - Label to identify the trip.
     * @param {Array} participants - List of participants of the trip.
     * @returns {Trip}
     */
    createTrip(label, participants) {
        const trip = new Trip(this.tripId, label, participants);
        this.tripId = this.tripId + 1;
        return trip;
    }

    /**
     * Adds a {@link Trip} to this collection of trips.
     * @private
     * @method Trips#addTrip
     * @param {Trip} trip
     */
    addTrip(trip) {
        this.listOfTrips.push(trip);
    }

    /**
     * Returns a list of labels for all trips belonging to
     * this collection of trips.
     * @public
     * @method Trips#labels
     * @returns {Array} Sorted list of labels for all trips.
     */
    labels() {
        const l = [];
        for (const trip of this.listOfTrips) {
            l.push(trip.label);
        }
        return l.sort();
    }

    /**
     * Returns a list of participants for all trips belonging to
     * this collection of trips.
     * @public
     * @method Trips#participants
     * @returns {Array} Sorted list of participants for all trips.
     */
    participants() {
        const p = {};
        for (const trip of this.listOfTrips) {
            if (trip.participants && trip.participants.length > 0) {
                for (const participant of trip.participants) {
                    p[participant] = 1;
                }
            }
        }
        return Object.keys(p).sort();
    }

    /**
     * Returns a list of years for all trips belonging to
     * this collection of trips.
     * @public
     * @method Trips#years
     * @returns {Array} Sorted list of years for all trips.
     */
    years() {
        const y = {};
        for (const trip of this.listOfTrips) {
            if (trip.flights && trip.flights.length > 0) {
                for (const flight of trip.flights) {
                    y[flight.year] = 1;
                }
            }
        }
        return Object.keys(y).sort();
    }

    /**
     * Fetches all trips from this this collection of trips
     * which match the given filter.
     * @public
     * @method Trips#fetch
     * @param {Object} filter
     * @param {String} filter.label
     * @param {String} filter.participant
     * @param {String} filter.year
     * @returns {Object} result
     * @returns {Object} result.trips - List of all {@link Trip} objects
     *      matching the given filter.
     * @returns {Object} result.airports - List of all {@link Airport} objects
     *      of all trips matching the given filter.
     */
    fetch(filter) {
        let listOfTrips = this.listOfTrips;
        if (filter) {
            const {label, participant, year} = filter;
            const filteredListOfTrips = [];
            listOfTrips.forEach((trip) => {
                if (label && !trip.labelEquals(label)) {
                    return;
                }
                if (participant && !(trip.hasParticipant(participant))) {
                    return;
                }
                if (year && !trip.tookPlaceInYear(year)) {
                    return;
                }
                filteredListOfTrips.push(trip);
            });
            listOfTrips = filteredListOfTrips;
        }
        const setOfAirports = buckets.createSet(Airport);
        for (const trip of listOfTrips) {
            setOfAirports.union(trip.setOfAirports);
        }
        return {
            trips: listOfTrips,
            airports: setOfAirports.toArray(),
        };
    }

    /**
     * Gets an airport for the given code. Ensures that there is only one
     * instance per airport for this collection of trips.
     *
     * Creates a new airport if the requested airport
     * is not in the airports collection yet.
     *
     * @private
     * @method Trips#getAirport
     * @param {String} code - IATA or ICAO code for the desired airport.
     * @returns {Airport|null}
     */
    getAirport(code) {
        if (code) {
            let airport = this.airportsByCode[code];
            if (airport === undefined) {
                airport = this.airports.createAirport(code);
                if (airport) {
                    this.airportsByCode[airport.iata] = airport;
                    this.airportsByCode[airport.icao] = airport;
                }
            }
            return airport;
        }
        return null;
    }

    /**
     * Processes the trips data loaded from the server. Builds internal
     * data structures.
     * @private
     * @method Trips#setTripsData
     * @param {Object} data - Data from server.
     */
    setTripsData(data) {
        this.init();

        this.title = data.name;
        this.homeAirport = this.getAirport(data.home);

        for (const tripdata of data.trips) {
            const label = tripdata.label;
            const participants = tripdata.participants;
            const trip = this.createTrip(label, participants);
            for (const flightdata of tripdata.flights) {
                const origination = this.getAirport(flightdata[1]);
                const destination = this.getAirport(flightdata[2]);
                if (origination && destination) {
                    const flight = this.flights.createFlight(origination, destination);
                    flight.flightNumber = flightdata[3];
                    flight.parseDateTimes(flightdata[0], flightdata[4]);
                    trip.addFlight(flight);
                }
            }
            this.addTrip(trip);
        }
    }

    /**
     * Loads the trips data from the server using the injected service.
     * @public
     * @method Trips#load
     * @returns {Promise}
     * @see {@link TripService}
     * @see {@link Service}
     */
    load() {
        return this.service
            .getTripsData()
            .then((data) => this.setTripsData(data));
    }
}
