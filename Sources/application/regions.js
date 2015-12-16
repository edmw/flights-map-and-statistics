/**
 * @file regions.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import Region from './region';

import { Logger } from './util.logger';

/**
 * Regions class.
 * @class Regions
 * @param {Object} service - Service Adapter to access the servers Regions API.
 */
export default class Regions {
    constructor(service) {
        this.logger = new Logger();

        /**
         * @private
         * @member {Object} Regions#service - Service Adapter to access the
         *      servers Region API.
         */
        this.service = service;

        /**
         * @private
         * @member {Map} Regions#regionsByCode - Lookup table for regions by
         *      ISO code.
         */
        this.regionsByCode = new Map();
    }
    /**
     * Injects a logger. Usually this method is called by an injector class.
     * Because a logger is optional it is not injected via constructor.
     * @public
     * @method Regions#setLogger
     * @param {Logger} logger
     */
    setLogger(logger) {
        this.logger = logger;
    }

    /**
     * Total number of regions.
     * @public
     * @member {Number} Regions#numberOfRegions
     */
    get numberOfRegions() {
        return this.regionsByCode.size;
    }

    /**
     * Processes the regions data loaded from the server. Builds internal
     * data structures.
     * @private
     * @method Regions#setRegionsData
     */
    setRegionsData(regionsData) {
        // Builds the lookup tables for regions data by ISO codes.
        // Emits a warning for duplicate codes but remembers only the
        // first region found. So, keep the region data clean.
        for (const regionData of regionsData) {
            const iso = regionData.iso;
            if (this.regionsByCode.get(iso) === undefined) {
                const region = new Region(iso, regionData.name);
                this.regionsByCode.set(iso, region);
            }
            else {
                this.logger.warn('Regions', 'duplicate iso code for region:', iso);
            }
        }
    }

    /**
     * Loads the regions data from the server using the injected service for
     * the given language.
     * @public
     * @method Regions#load
     * @param {String} language - ISO Language code.
     * @returns {Promise}
     * @see {@link RegionsService}
     * @see {@link Service}
     */
    load(language) {
        return this.service
            .getRegionsData({language: language})
            .then((data) => this.setRegionsData(data));
    }

    /**
     * Returns a {@link Region} object for the given ISO region code.
     * @public
     * @method Regions#regionWithCode
     * @param {String} code - ISO region code, i.e. 'FI-LL' for Lapland.
     * @returns {Region}
     */
    regionWithCode(code) {
        const region = this.regionsByCode.get(code);
        return region ? region : null;
    }
}
