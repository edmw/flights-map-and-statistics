/**
 * @file airport.js
 * @author Michael Baumgärtner
 * @license MIT
 */

/**
 * Airport class. Only use {@link Airports#createAirport} to instantiate a
 * new airport and ensure a unique airport id.
 * @class Airport
 * @param {Number} airportId - Identifier for this airport. MUST be unique.
 * @param {String} iata - IATA code for this airport, i.e. 'SIN' for Singapore Changi Airport.
 * @param {String} icao - ICAO code for this airport, i.e. 'LTBA' for Istanbul Atatürk Airport.
 * @param {String} name - Name of this airport, i.e. 'Miami International Airport'.
 */
export default class Airport {
    constructor(airportId, iata, icao, name) {
        this._id = airportId;
        this.iata = iata;
        this.icao = icao;
        this.name = name;
        this.municipal = null;
        this.region = null;
        this.country = null;
        this.latitude = null;
        this.longitude = null;
        this.elevation = null;
    }
    /**
     * Returns a unique key per airport suitable to be used for collections
     * and more. Different objects representing the same airport return the
     * same key.
     * @public
     * @method Airport#key
     * @returns {String} Unique key per airport.
     */
    key() {
        const iata = this.iata;
        const icao = this.icao;
        return `${iata}${icao}`;
    }
    /**
     * Converts this object to a string.
     * @public
     * @method Airport#toString
     * @returns {String}
     */
    toString() {
        const id = this._id;
        const iata = this.iata;
        return `Airport#${id}[${iata}]`;
    }
    /**
     * Compares this airport object to another airport object.
     * Two airport objects are considered equal if the have the same id
     * (This means, if the objects are legally generated using the facory
     * method {@link Airports#createAirport}, objects representing the
     * same actual airport are considered not equal).
     * @public
     * @method Airport#isEqualTo
     * @param {Airport} airport - Another airport object.
     * @returns {Boolean}
     */
    isEqualTo(airport) {
        return this._id === airport._id;
    }

    /**
     * Airport object id.
     * @public
     * @readonly
     * @member {Number} Airport#id
     */
    get id() {
        return this._id;
    }
}
