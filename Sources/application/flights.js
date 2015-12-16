/**
 * @file flights.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import Flight from './flight';

import { Logger } from './util.logger';

/**
 * Flights class.
 * @class Flights
 */
export default class Flights {
    constructor() {
        this.logger = new Logger();

        /**
         * @private
         * @member {Number} Flights#flightId - Internal counter to ensure a
         *      unqiue flight id for {@link Flight} objects.
         */
        this.flightId = 1;
    }
    /**
     * Injects a logger. Usually this method is called by an injector class.
     * Because a logger is optional it is not injected via constructor.
     * @public
     * @method Flights#setLogger
     * @param {Logger} logger
     */
    setLogger(logger) {
        this.logger = logger;
    }

    /**
     * Creates a new {@link Flight} object. Ensures that every different
     * flight has its unique id.
     * @public
     * @method Flights#createFlight
     * @param {Airport} origination - Origination airport for this flight.
     * @param {Airport} destination - Destination airport for this flight.
     * @returns {Flight}
     */
    createFlight(origination, destination) {
        const flight = new Flight(
            this.flightId, origination, destination
        );
        this.flightId = this.flightId + 1;

        return flight;
    }
}
