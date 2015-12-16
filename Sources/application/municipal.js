/**
 * @file municipal.js
 * @author Michael Baumgärtner
 * @license MIT
 */

/**
 * Municipal class.
 * @class Municipal
 * @param {String} name - Name of this municipal, i.e. 'Frankfurt am Main'.
 */
 export default class Municipal {
    constructor(name) {
        this.name = name;
    }
    /**
     * Returns a unique key per municipal suitable to be used for collections
     * and more. Different objects representing the same municipal return the
     * same key.
     * @public
     * @method Municipal#key
     * @returns {String} Unique key per municipal.
     */
    key() {
        return this.name;
    }
    /**
     * Converts this object to a string.
     * @public
     * @method Municipal#toString
     * @returns {String}
     */
    toString() {
        return this.name;
    }
}
