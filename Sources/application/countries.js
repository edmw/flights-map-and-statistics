/**
 * @file countries.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import Country from './country';

import { Logger } from './util.logger';

/**
 * Countries class.
 * @class Countries
 * @param {Object} service - Service Adapter to access the servers Countries API.
 */
export default class Countries {
    constructor(service) {
        this.logger = new Logger();

        this.service = service;

        /**
         * @private
         * @member {Map} Countries#countriesByCode - Lookup table for countries by ISO code.
         */
        this.countriesByCode = new Map();
    }
    /**
     * Injects a logger. Usually this method is called by an injector class.
     * Because a logger is optional it is not injected via constructor.
     * @public
     * @method Countries#setLogger
     * @param {Logger} logger
     */
    setLogger(logger) {
        this.logger = logger;
    }

    /**
     * Total number of countries.
     * @public
     * @member {Number} Countries#numberOfCountries
     */
    get numberOfCountries() {
        return this.countriesByCode.size;
    }

    /**
     * Processes the countries data loaded from the server. Builds internal data structures.
     * @private
     * @method Countries#setCountriesData
     * @param {Object} countriesData - Data from server.
     */
    setCountriesData(countriesData) {
        // Builds the lookup tables for countries by ISO codes.
        // Emits a warning for duplicate codes but remembers only the
        // first country found. So, keep the country data clean.
        for (const countryData of countriesData) {
            const iso = countryData.iso;
            if (this.countriesByCode.get(iso) === undefined) {
                const country = new Country(iso, countryData.name);
                this.countriesByCode.set(iso, country);
            }
            else {
                this.logger.warn('Countries', 'duplicate iso code for country:', iso);
            }
        }
    }

    /**
     * Loads the countries data from the server using the injected service for
     * the given language.
     * @public
     * @method Countries#load
     * @param {String} language - ISO Language code.
     * @returns {Promise}
     * @see {@link CountriesService}
     * @see {@link Service}
     */
    load(language) {
        return this.service
            .getCountriesData()
            .then((data) => this.setCountriesData(data));
    }

    /**
     * Returns a {@link Country} object for the given ISO country code.
     * @public
     * @method Countries#countryWithCode
     * @param {String} code - ISO country code, i.e. 'PH' for Philippines.
     * @returns {Country}
     */
    countryWithCode(code) {
        const country = this.countriesByCode.get(code);
        return country ? country : null;
    }
}
