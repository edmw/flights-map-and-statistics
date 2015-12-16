/**
 * @file continent.js
 * @author Michael Baumgärtner
 * @license MIT
 */

/**
 * Continent class. Use {@link Continents#continentWithCode} to get an instance.
 * @class Continent
 * @param {String} code - ISO code for this continent, i.e. 'EU' for Europe.
 * @param {String} name - Name of this continent (in english), i.e. 'North america'.
 */
export default class Continent {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
    /**
     * Returns a unique key per continent suitable to be used for collections
     * and more. Different objects representing the same continent return the
     * same key.
     * @method Continent#key
     * @returns {String} Unique key per continent.
     */
    key() {
        return this.code;
    }
    /**
     * Converts this object to a string.
     * @method Continent#toString
     * @returns {String}
     */
    toString() {
        return this.name;
    }
}
