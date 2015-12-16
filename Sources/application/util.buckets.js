/**
 * @file buckets.js
 * @author Michael Baumgärtner
 * @license MIT
 */

var buckets = require('buckets-js');

/**
 * Buckets utility class. Collection of static helper methods for collection handling.
 * @class Buckets
 */
export default class Buckets {
    constructor() {
        throw('Static class can not be instantiated');
    }

    /**
     * Creates a Set suitable to hold objects of the given type. Uses the key()
     * method to converts objects to unique strings.
     * @see {@link https://rawgit.com/mauriciosantos/buckets/master/doc/symbols/buckets.Set.html}
     *
     * @method Buckets.createSet
     * @param {Type} valuetype - Type of elements for the set.
     * @returns {Object} Set
     */
    static createSet(valuetype = '') {
        let objectToKey = null;
        if (typeof(valuetype) === 'function') {
            objectToKey = (object) => object.key();
        }
        return new buckets.Set(objectToKey);
    }

    /**
     * Creates a MultiDictionary suitable to hold objects of the given type.
     * Uses the key() method to converts objects to unique strings and the
     * isEqualTo() method to check equality between values.
     * @see {@link https://rawgit.com/mauriciosantos/buckets/master/doc/symbols/buckets.MultiDictionary.html}
     *
     * @method Buckets.createMultiDictionary
     * @param {Type} keytype - Type of the keys for the MultiDictionary.
     * @param {Type} valuetype - Type of the values for the MultiDictionary.
     * @returns {Object} MultiDictionary
     */
    static createMultiDictionary(keytype = '', valuetype = '') {
        let objectToKey = null;
        let objectsComparator = null;
        if (typeof(keytype) === 'function') {
            objectToKey = (object) => object.key();
        }
        if (typeof(valuetype) === 'function') {
            objectsComparator = (object1, object2) => object1.isEqualTo(object2);
        }
        return new buckets.MultiDictionary(objectToKey, objectsComparator);
    }

    /**
     * Returns the keys of the given MultiDictionary sorted by the number of
     * values per key.
     * @method Buckets.keysOfMultiDictionarySortedByLengthOfValue
     * @param {Object} multidictionary
     * @returns {Array} List of keys.
     */
    static keysOfMultiDictionarySortedByLengthOfValue(multidictionary) {
        const keys = multidictionary.keys().slice();
        keys.sort((a, b) => (multidictionary.get(b).length - multidictionary.get(a).length));
        return keys;
    }

}
