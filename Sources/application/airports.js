/**
 * @file airports.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import Airport from './airport';
import Municipal from './municipal';

import { Logger } from './util.logger';

/**
 * Airports class.
 * @class Airports
 * @param {Continents} continents
 * @param {Countries} countries
 * @param {Regions} regions
 * @param {AirportsService} service - Service Adapter to access the servers Airports API.
 */
export default class Airports {
    constructor(continents, countries, regions, service) {
        this.logger = new Logger();

        this.continents = continents;
        this.countries = countries;
        this.regions = regions;

        this.service = service;

        /**
         * @private
         * @member {Map} Airports#airportsByIATA - Lookup table for airports
         *      by IATA code.
         */
        this.airportsByIATA = new Map();
        /**
         * @private
         * @member {Map} Airports#airportsByICAO - Lookup table for airports
         *      by ICAO code.
         */
        this.airportsByICAO = new Map();

        /**
         * @private
         * @member {Number} Airports#airportId - Internal counter to ensure a
         *      unqiue airport id for {@link Airport} objects.
         */
        this.airportId = 1;
    }
    /**
     * Injects a logger. Usually this method is called by an injector class.
     * Because a logger is optional it is not injected via constructor.
     * @public
     * @method Airports#setLogger
     * @param {Logger} logger
     */
    setLogger(logger) {
        this.logger = logger;
    }

    /**
     * Total number of airports.
     * @public
     * @member {Number} Airports#numberOfAirports
     */
    get numberOfAirports() {
        return this.airportsByIATA.size;
    }

    /**
     * Processes the airports data loaded from the server. Builds internal
     * data structures.
     * @private
     * @method Airports#setAirportsData
     * @param {Object} airportsData - Data from server.
     */
    setAirportsData(airportsData) {
        // Builds the lookup tables for airport data by IATA or ICAO codes.
        // Emits a warning for duplicate codes but remembers only the
        // first airport found. So, keep the airport data clean.
        for (const airportData of airportsData) {
            const iata = airportData.iata;
            const icao = airportData.icao;
            if (this.airportsByIATA.get(iata) === undefined) {
                this.airportsByIATA.set(iata, airportData);
            }
            else {
                this.logger.warn('Airports', 'duplicate iata code for airport:', iata);
            }
            if (this.airportsByICAO.get(icao) === undefined) {
                this.airportsByICAO.set(icao, airportData);
            }
            else {
                this.logger.warn('Airports', 'duplicate icao code for airport:', icao);
            }
        }
    }

    /**
     * Gets the airport data associated with the given code.
     * Code can be either an IATA code or an ICAO code.
     * @private
     * @method Airports#getAirportDataWithCode
     * @param {String} code - IATA or ICAO code.
     * @returns {Object|null} Airport data
     */
    getAirportDataWithCode(code) {
        if (code) {
            if (code.length === 3 && this.airportsByIATA.has(code)) {
                return this.airportsByIATA.get(code);
            }
            else if (code.length === 4 && this.airportsByICAO.has(code)) {
                return this.airportsByICAO.get(code);
            }
        }
        return null;
    }

    /**
     * Loads the airports data from the server using the injected service for
     * the given language.
     * @public
     * @method Airports#load
     * @param {String} language - ISO Language code.
     * @returns {Promise}
     * @see {@link AirportsService}
     * @see {@link Service}
     */
    load(language) {
        return this.service
            .getAirportsData()
            .then((data) => this.setAirportsData(data));
    }

    /**
     * Creates a new {@link Airport} object. Ensures that every different
     * airport has its unique id.
     * Searches airports data for the given code and instantiates
     * a new airport object with the data of the according airport.
     * @public
     * @method Airports#createAirport
     * @param {String} code - IATA or ICAO code for the desired airport.
     * @returns {Airport|null} {@link Airport} object
     */
    createAirport(code) {
        const airportData = this.getAirportDataWithCode(code);
        if (airportData) {
            const iata = airportData.iata;
            const icao = airportData.icao;
            const name = airportData.name;

            const airport = new Airport(
                this.airportId, iata, icao, name
            );
            this.airportId = this.airportId + 1;

            airport.type = airportData.type;
            airport.latitude = airportData.lat;
            airport.longitude = airportData.lon;
            airport.elevation = parseInt(airportData.elv);
            airport.timezone = airportData.tz;
            airport.continent = this.continents.continentWithCode(airportData.con);
            airport.country = this.countries.countryWithCode(airportData.cou);
            airport.region = this.regions.regionWithCode(airportData.reg);
            airport.municipal = new Municipal(airportData.mun);

            return airport;
        }
        return null;
    }
}
