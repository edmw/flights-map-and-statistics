/**
 * @file trips.service.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import Service from './service';

import { Logger } from './util.logger';

/**
 * TripsService is a {@link Service} adapter to access the servers Trips API.
 * @class TripsService
 * @param {String} resource
 */
export default class TripsService extends Service {
    constructor(resource) {
        super(resource, '');
    }

    /**
     * Loads the trips data from the server.
     * @public
     * @method TripsService#getTripsData
     * @param {Object} options - see {@link Service#get}
     * @returns {Promise} Promise which will be resolved with the trips data
     *      on success.
     */
    getTripsData(options) {
        return super.get(options);
    }

    /**
     * Factory method to create an instance of this service adpater for
     * the given resource.
     * @public
     * @static
     * @method TripsService.createServiceWithResource
     * @returns {TripsService}
     */
    static createServiceWithResource(resource) {
        return new TripsService(resource);
    }
}
