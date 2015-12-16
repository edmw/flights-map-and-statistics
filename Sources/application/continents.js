/**
 * @file continents.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import Continent from './continent';

import { Logger } from './util.logger';

/**
 * Continents class.
 * @class Continents
 */
export default class Continents {
    constructor() {
        this.logger = new Logger();

        /**
         * @private
         * @member {Map} Continents#continentsByCode - Lookup table for continents by ISO code.
         */
        this.continentsByCode = new Map();
    }
    /**
     * Injects a logger. Usually this method is called by an injector class.
     * Because a logger is optional it is not injected via constructor.
     * @public
     * @method Continents#setLogger
     * @param {Logger} logger
     */
    setLogger(logger) {
        this.logger = logger;
    }

    /**
     * Initializes the continents data.
     * @public
     * @method Continents#init
     * @returns {Promise}
     */
    init() {
        return new Promise((resolve, reject) => {
            this.continentsByCode.set('AF', new Continent('AF', 'Africa'));
            this.continentsByCode.set('AN', new Continent('AN', 'Antarctica'));
            this.continentsByCode.set('AS', new Continent('AS', 'Asia'));
            this.continentsByCode.set('EU', new Continent('EU', 'Europe'));
            this.continentsByCode.set('NA', new Continent('NA', 'North america'));
            this.continentsByCode.set('OC', new Continent('OC', 'Oceania'));
            this.continentsByCode.set('SA', new Continent('SA', 'South america'));

            this.logger.info('Continents', `#${this.numberOfContinents}`);

            resolve();
        });
    }

    /**
     * Total number of continents.
     * @public
     * @member {Number} Continents#numberOfContinents
     */
    get numberOfContinents() {
        return this.continentsByCode.size;
    }

    /**
     * Returns a {@link Continent} object for the given ISO continent code.
     * @public
     * @method Continents#continentWithCode
     * @param {String} code - ISO continent code, i.e. 'OC' for Oceania.
     * @returns {Continent}
     */
    continentWithCode(code) {
        return this.continentsByCode.get(code);
    }
}
