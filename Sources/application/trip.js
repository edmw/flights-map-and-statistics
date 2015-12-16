/**
 * @file trip.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import Airport from './airport';
import Flight from './flight';

import buckets from './util.buckets';

/**
 * Trip class. Only use {@link Trips#createTrip} to instantiate a
 * new trip and ensure a unique airport id.
 * @class Trip
 * @param {Number} tripId - Identifier for this trip. MUST be unique.
 * @param {String} label - Label to identify this trip.
 * @param {Array} participants - List of participants of this trip.
 */
export default class Trip {
    constructor(tripId, label, participants) {
        this._id = tripId;
        this.label = label;
        this.participants = participants ? participants : [];
        this.flights = [];
        this.flightsByYear = buckets.createMultiDictionary('', Flight);
        this.setOfAirports = buckets.createSet(Airport);
        this.distanceForFlights = 0;
    }

    /**
     * Trip object id.
     * @private
     * @readonly
     * @member {Number} Trip#id
     */
    get id() {
        return this._id;
    }

    /**
     * Total number of flights for this trip.
     * @public
     * @readonly
     * @member {Number} Trip#numberOfFlights
     */
    get numberOfFlights() {
        return this.flights.length;
    }

    /**
     * Adds the given flight to this trip.
     * @public
     * @method Trip#addFlight
     * @param {Flight} flight
     */
    addFlight(flight) {
        this.flights.push(flight);
        // collect airports for this trip
        this.setOfAirports.add(flight.origination);
        this.setOfAirports.add(flight.destination);
        // manage flights by year
        this.flightsByYear.set(flight.year.toString(), flight);
        // add to total distance
        this.distanceForFlights += flight.distance;
    }

    /**
     * Filter function: Test, if this trips label equals the given label.
     * @public
     * @method Trip#labelEquals
     * @param {String} label - Label for trip.
     * @returns {Boolean}
     */
    labelEquals(label) {
        return (this.label === label);
    }
    /**
     * Filter function: Test, if this trip has the given participant.
     * @public
     * @method Trip#hasParticipant
     * @param {String} participant - Name of participant.
     * @returns {Boolean}
     */
    hasParticipant(participant) {
        return (this.participants.indexOf(participant) >= 0);
    }
    /**
     * Filter function: Test, if this trip has at least one flight which took
     *      place in the given year.
     * @public
     * @method Trip#tookPlaceInYear
     * @param {Number} year
     * @returns {Boolean}
     */
    tookPlaceInYear(year) {
        return (this.flightsByYear.containsKey(year.toString()));
    }
}
