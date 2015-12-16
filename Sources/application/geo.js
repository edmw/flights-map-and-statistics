/**
 * @file geo.js
 * @author Michael Baumgärtner
 * @license MIT
 */

/* global OpenLayers */

import { nearlyEqual } from './util.math';

// mean earth radius for the WGS84 ellipsoid
const EARTH_RADIUS = 6371.009; // km

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

// Helper

function isNumeric(obj) {
    return !Array.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
}

/**
 * Point geometry.
 * @class GEOPoint
 * @param {float} longitude - Longitude in decimal degrees
 * @param {float} latitude - Latitude in decimal degrees
 */
class GEOPoint {
    constructor(lon, lat) {
        this.x = parseFloat(lon); // longitude in degrees
        this.y = parseFloat(lat); // latitude in degrees
        this.λ = this.x * DEG2RAD; // longitude in radians
        this.φ = this.y * DEG2RAD; // latitude in radians
    }

    /**
     * Verifies if the coordinates of this point are in a valid range.
     * @public
     * @method GEOPoint#isValidPoint
     * @returns {Boolean}
     */
    isValidPoint() {
        if (isNumeric(this.x) && isNumeric(this.y)) {
            return (
                (this.x >= -180) &&
                (this.x <= +180) &&
                (this.y >= -90) &&
                (this.y <= +90)
            );
        }
        return false;
    }

    /**
     * Calculates a bearing from this point to the passed point.
     * @public
     * @method GEOPoint#bearingTo
     * @param {GEOPoint} p - Target point
     * @returns {float|null} Bearing in decimal degrees in the range 0 <= bearing < 360
     * @see http://www.movable-type.co.uk/scripts/latlong.html
     */
    bearingTo(p) {
        if (this.isValidPoint() && p.isValidPoint()) {
            const Δλ = p.λ - this.λ;

            const a = Math.cos(p.φ) * Math.sin(Δλ);
            const b1 = Math.cos(this.φ) * Math.sin(p.φ);
            const b2 = Math.sin(this.φ) * Math.cos(p.φ) * Math.cos(Δλ);
            const b = b1 - b2;

            // bearing in radians
            const θ = Math.atan2(a, b);
            // bearing in decimal degrees
            return (θ * RAD2DEG + 360.0) % 360.0;
        }
        return null;
    }

    /**
     * Calculates the distance from this point to the passed point
     * @public
     * @method GEOPoint#distanceTo
     * @param {GEOPoint} p - Target point
     * @returns {float|null} Distance in km
     * @see http://www.movable-type.co.uk/scripts/latlong.html
     */
    distanceTo(p) {
        if (this.isValidPoint() && p.isValidPoint()) {
            const Δφ = p.φ - this.φ;
            const Δλ = p.λ - this.λ;

            const a0 = Math.cos(this.φ) * Math.cos(p.φ);
            const a1 = Math.sin(Δφ / 2.0) * Math.sin(Δφ / 2.0);
            const a2 = Math.sin(Δλ / 2.0) * Math.sin(Δλ / 2.0);
            const a = a1 + a0 * a2;

            // angular distance in radians
            const δ = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
            // distance in km
            return δ * EARTH_RADIUS;
        }
        return null;
    }

    /**
     * Determines the location of a point that is 'distance' km from
     * object point in a direction of 'bearing'.
     * @public
     * @method GEOPoint#pointWithDistanceAndBearing
     * @param {float} distance - Distance in km
     * @param {float} bearing - Bearing in decimal degrees in the range 0 <= bearing < 360
     * @returns {GEOPoint} Point with the given distance and
     *      the given bearing from this point.
     * @see http://www.movable-type.co.uk/scripts/latlong.html
     */
    pointWithDistanceAndBearing(distance, bearing) {
        const δ = distance / EARTH_RADIUS; // angular distance in radians
        const θ = bearing * DEG2RAD; // bearing in radians (clockwise from north)

        const φ0 = Math.sin(this.φ) * Math.cos(δ);
        const φ1 = Math.cos(this.φ) * Math.sin(δ) * Math.cos(θ);
        const pφ = Math.asin(φ0 + φ1);

        const λ0 = Math.sin(θ) * Math.sin(δ) * Math.cos(this.φ);
        const λ1 = Math.cos(δ) - Math.sin(this.φ) * Math.sin(pφ);
        const pλ = this.λ + Math.atan2(λ0, λ1);

        return new GEOPoint(pλ * RAD2DEG, pφ * RAD2DEG);
    }
}

/**
 * Great circle geometry.
 * A great circle, also known as an orthodrome, of a sphere is the
 * intersection of the sphere and a plane which passes through the center
 * point of the sphere.
 * Great circles are used as rather accurate approximations of geodesics
 * on the Earth's surface.
 *
 * @class GEOGreatCircle
 * @param {GEOPoint} p0 - Origin point
 * @param {GEOPoint} p1 - End point
 */
class GEOGreatCircle {
    constructor(p0, p1) {
        this.p0 = new GEOPoint(p0.x, p0.y);
        this.p1 = new GEOPoint(p1.x, p1.y);
    }

    /**
     * Verifies if the points of this great circle are valid.
     * @public
     * @method GEOGreatCircle#isValidGreatCircle
     * @returns {Boolean}
     */
    isValidGreatCircle() {
        return this.p0.isValidPoint() && this.p1.isValidPoint();
    }

    /**
     * Calculates the distance from the passed point to this great circle.
     * @public
     * @method GEOGreatCircle#distanceToPoint
     * @param {GEOPoint} p - Target point
     * @returns {float} Distance in km (-ve if to left, +ve if to right of path)
     * @see http://www.movable-type.co.uk/scripts/latlong.html
     */
    distanceToPoint(p) {
        const δ13 = this.p0.distanceTo(p) / EARTH_RADIUS;
        const θ13 = this.p0.bearingTo(p) * DEG2RAD;
        const θ12 = this.p0.bearingTo(this.p1) * DEG2RAD;

        // angular distance in radians
        const δ = Math.asin(Math.sin(δ13) * Math.sin(θ13 - θ12));
        // distance in km
        return δ * EARTH_RADIUS;
    }

    /**
     * Converts this great circle to list of points along its path
     * on the surface of a sphere.
     * @public
     * @method GEOGreatCircle#toPoints
     * @param {float} fromLongitude - Starting longitude for the
     *      desired section of this great circle in decimal degrees.
     * @param {float} toLongitude - Ending longitude for the
     *      desired section of this great circle in decimal degrees.
     * @returns {Array} Array of {@link GEOPoint|GEOPoints} along the great circle path
     * @see http://gis.ibbeck.de/ginfo/apps/OLExamples/OL26/examples/javascript/greatcirclemod.js
     */
    toPoints(fromLongitude, toLongitude) {
        const λmin = fromLongitude * DEG2RAD;
        const λmax = toLongitude * DEG2RAD;

        const λ1 = this.p0.λ;
        const φ1 = this.p0.φ;
        let λ2 = this.p1.λ;
        let φ2 = this.p1.φ;

        const points = [];

        const arc = Math.PI / 180.0;

        if (Math.abs(λ1 - λ2) === 0) {
            // avoid 'divide by zero' error in following equation
            λ2 = λ2 + Math.PI;
        }

        if (nearlyEqual(Math.abs(λ2 - λ1), Math.PI, Number.EPSILON)) {
            if (φ1 + φ2 === 0.0) {
                φ2 += Math.PI / 180000000;
            }
        }

        let λ = λmin;
        while (λ <= λmax) {
            const a1 = Math.sin(φ1) * Math.cos(φ2) * Math.sin(λ - λ2);
            const a2 = Math.sin(φ2) * Math.cos(φ1) * Math.sin(λ - λ1);
            const a = a1 - a2;
            const b = Math.cos(φ1) * Math.cos(φ2) * Math.sin(λ1 - λ2);

            const φ = Math.atan(a / b);

            points.push(new GEOPoint(λ * RAD2DEG, φ * RAD2DEG));

            if (λ < λmax && (λ + arc) >= λmax) {
                λ = λmax;
            }
            else {
                λ = λ + arc;
            }
        }
        if (λmin === λmax) {
            // perpendicular line (meridian) => add extra end point
            const p = new GEOPoint(points[0].x, this.p1.y);
            points.push(p);
        }
        return points;
    }
}

/**
 * This module contains a variety of calculations for latitude/longitude points.
 * All the formulæ are for calculations on the basis of a spherical earth
 * (ignoring ellipsoidal effects).
 * @module Geo
 */
export default (function() {

    return {

        /**
         * Creates a {@link GEOPoint} with the given coordinates.
         * @param {float} longitude - Longitude in decimal degrees
         * @param {float} latitude - Latitude in decimal degrees
         * @returns {GEOPoint} Point
         */
        createPoint: function(longitude, latitude) {
            return new GEOPoint(longitude, latitude);
        },

        /**
         * Creates a {@link GEOGreatCircle} with the given coordinates.
         * @param {float} lon1 - Longitude in decimal degrees
         *      for the orgin point of the great circle.
         * @param {float} lat1 - Latitude in decimal degrees
         *      for the orgin point of the great circle.
         * @param {float} lon2 - Longitude in decimal degrees
         *      for the end point of the great circle.
         * @param {float} lat2 - Latitude in decimal degrees
         *      for the end point of the great circle.
         * @returns {GEOGreatCircle} Great Circle
         */
        createGreatCircle: function(lon1, lat1, lon2, lat2) {
            const p0 = new GEOPoint(lon1, lat1);
            const p1 = new GEOPoint(lon2, lat2);
            return new GEOGreatCircle(p0, p1);
        },

        /**
         * Calculates the orthodromic distance between the given points
         * on the surface of a spherical Earth.
         * @param {float} lon1 - Longitude in decimal degrees
         *      for the first point.
         * @param {float} lat1 - Latitude in decimal degrees
         *      for the first point.
         * @param {float} lon2 - Longitude in decimal degrees
         *      for the second point.
         * @param {float} lat2 - Latitude in decimal degrees
         *      for the second point.
         * @returns {float} Distance in km
         */
        distance: function(lon1, lat1, lon2, lat2) {
            const p0 = new GEOPoint(lon1, lat1);
            const p1 = new GEOPoint(lon2, lat2);
            return p0.distanceTo(p1);
        },

        /**
         * Calculates a orthodromic path (also known as Great Circle)
         * between the given points on the surface of a sphere.
         * The result will be a list of segments each consisting of a
         * list of {@link GEOPoint|GEOPoints}. Guarantees the direction
         * of the path to be going from origin to end point.
         * @param {float} lon1 - Longitude in decimal degrees
         *      for the orgin point of the path.
         * @param {float} lat1 - Latitude in decimal degrees
         *      for the orgin point of the path.
         * @param {float} lon2 - Longitude in decimal degrees
         *      for the end point of the path.
         * @param {float} lat2 - Latitude in decimal degrees
         *      for the end point of the path.
         * @returns {Array} Array of path segments. A segment is
         *      an array of {@link GEOPoint|GEOPoints}.
         */
        orthodrome: function(lon1, lat1, lon2, lat2) {
            const p0 = new GEOPoint(lon1, lat1);
            const p1 = new GEOPoint(lon2, lat2);

            const gc = new GEOGreatCircle(p0, p1);

            const x0 = p0.x;
            const x1 = p1.x;

            const segments = [];

            if (x0 < x1 && (x1 - x0) < 180) {
                const segment = gc.toPoints(x0, x1);
                segments.push(segment);
            }
            else {
                if (Math.abs(x0 - x1) < 180) {
                    const segment = gc.toPoints(x1, x0);
                    segment.reverse();
                    segments.push(segment);
                }
                else if (x0 > x1) {
                    const segment1 = gc.toPoints(x0, 180);
                    segments.push(segment1);
                    const segment2 = gc.toPoints(-180, x1);
                    segments.push(segment2);
                }
                else {
                    const segment1 = gc.toPoints(-180, x0);
                    segment1.reverse();
                    segments.push(segment1);
                    const segment2 = gc.toPoints(x1, 180);
                    segment2.reverse();
                    segments.push(segment2);
                }
            }
            return segments;
        },

    };

}());
