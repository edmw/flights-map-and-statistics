/**
 * @file application.scope.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import { LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR } from './util.logger';

/**
 * ApplicationScope class.
 * @class ApplicationScope
 * @param {Object} uri - Base URI for the application.
 * @param {Object} options
 * @param {String} options.countriesServiceResource - Resource URI for
 *      the Countries API service.
 * @param {String} options.regionsServiceResource - Resource URI for
 *      the Regions API service.
 * @param {String} options.airportsServiceResource - Resource URI for
 *      the Airports API service.
 * @param {String} options.tripsServiceResource - Resource URI for
 *      the Trips API service.
 * @param {Symbol} options.logLevel - LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR
 */
export default class ApplicationScope {
    constructor(uri, options = {}) {
        this.uri = uri;

        this.logLevel = options.logLevel || LOG_WARN;

        this.countriesServiceResource = options.countriesServiceResource;
        this.regionsServiceResource = options.regionsServiceResource;
        this.airportsServiceResource = options.airportsServiceResource;
        this.tripsServiceResource = options.tripsServiceResource;
    }
    /**
     * Converts this object to a string.
     * @method ApplicationScope#toString
     * @returns {String}
     */
    toString() {
        const options = [
            `uri=${this.uri}`,
        ].join(', ');
        return `[${this.constructor.name}(${options})]`;
    }
}
