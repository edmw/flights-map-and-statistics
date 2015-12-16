/**
 * @file country.js
 * @author Michael Baumgärtner
 * @license MIT
 */

/**
 * Country class. Use {@link Countries#countryWithCode} to get an instance.
 * @class Country
 * @param {String} code - ISO code for this country, i.e. 'GU' for Guam.
 * @param {String} name - Name of this country (localized), i.e. 'Indonesia'.
 */
export default class Country {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
    /**
     * Returns a unique key per country suitable to be used for collections
     * and more. Different objects representing the same country return the
     * same key.
     * @method Country#key
     * @returns {String} Unique key per country.
     */
    key() {
        return this.code;
    }
    /**
     * Converts this object to a string.
     * @method Country#toString
     * @returns {String}
     */
    toString() {
        return this.name;
    }
    /**
     * Compares this country object to another country object.
     * Two country objects are considered equal if the have the same ISO code.
     * @public
     * @method Country#isEqualTo
     * @param {Country} country - Another country object.
     * @returns {Boolean}
     */
    isEqualTo(country) {
        return this.code === country.code;
    }
}
