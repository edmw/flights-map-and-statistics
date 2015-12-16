/**
 * @file region.js
 * @author Michael Baumgärtner
 * @license MIT
 */

/**
 * Region class. Use {@link Regions#regionWithCode} to get an instance.
 * @class Region
 * @param {String} code - ISO code for this region, i.e. 'CN-46' for Hainan Province.
 * @param {String} name - Name of this region (localized), i.e. 'Islas de la Bahia'.
 */
export default class Region {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
    /**
     * Returns a unique key per region suitable to be used for collections
     * and more. Different objects representing the same region return the
     * same key.
     * @method Region#key
     * @returns {String} Unique key per region.
     */
    key() {
        return this.code;
    }
    /**
     * Converts this object to a string.
     * @method Region#toString
     * @returns {String}
     */
    toString() {
        return this.name;
    }
    /**
     * Compares this region object to another region object.
     * Two region objects are considered equal if the have the same ISO code.
     * @public
     * @method Region#isEqualTo
     * @param {Region} region - Another region object.
     * @returns {Boolean}
     */
    isEqualTo(region) {
        return this.code === region.code;
    }
}
