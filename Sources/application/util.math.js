/**
 * @file util.math.js
 * @author Michael Baumgärtner
 * @license MIT
 */

/**
 * This module contains mathematical functions.
 * @module Math
 */

// minimum number added to one that makes the result different than one
var minEpsilon = Number.EPSILON;

export function setMinimumEpsilon(epsilon) {
    minEpsilon = epsilon;
}

export function minimumEpsilon() {
    const epsilon = minEpsilon || 2.2204460492503130808472633361816E-16;
    return epsilon;
}

/**
 * Compares two floating point numbers.
 * @param {Number} x          - First value to compare
 * @param {Number} y          - Second value to compare
 * @param {Number} [epsilon]  - The maximum relative difference between x and y
 *                              If epsilon is undefined or null, the function will
 *                              test whether x and y are exactly equal.
 * @return {Boolean} whether the two numbers are equal
*/
export function nearlyEqual(x, y, epsilon) {
    // if epsilon is null or undefined, test whether x and y are exactly equal
    if (epsilon === null) {
        return x === y;
    }

    if (x === y) {
        return true;
    }

    // NaN
    if (isNaN(x) || isNaN(y)) {
        return false;
    }

    // at this point x and y should be finite
    if (isFinite(x) && isFinite(y)) {
        // check numbers are very close, needed when comparing numbers near zero
        const diff = Math.abs(x - y);
        if (diff < minimumEpsilon()) {
            return true;
        }
        else {
            // use relative error
            return diff <= Math.max(Math.abs(x), Math.abs(y)) * epsilon;
        }
    }

    // infinite and number or negative infinite and positive infinite cases
    return false;
}
