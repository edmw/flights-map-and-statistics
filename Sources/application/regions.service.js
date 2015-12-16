/**
 * @file regions.service.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import Service from './service';

import { Logger } from './util.logger';

/**
 * RegionsService is a {@link Service} adapter to access the servers
 * Regions API.
 * @class RegionsService
 * @param {String} resource
 */
export default class RegionsService extends Service {
    constructor(resource) {
        super(resource, 'regions');
    }

    /**
     * Loads the regions data from the server.
     * @public
     * @method RegionsService#getRegionsData
     * @param {Object} options - see {@link Service#get}
     * @returns {Promise} Promise which will be resolved with the regions data
     *		on success.
     */
    getRegionsData(options) {
        return super.get(options);
    }

    /**
     * Factory method to create an instance of this service adpater for
     * the given resource.
     * @public
     * @static
     * @method RegionsService.createServiceWithResource
     * @returns {RegionsService}
     */
    static createServiceWithResource(resource) {
        return new RegionsService(resource);
    }
}

