/**
 * @file airport.service.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import Service from './service';

import { Logger } from './util.logger';

/**
 * AirportsService is a {@link Service} adapter to access the servers Airports API.
 * @class AirportsService
 * @param {String} resource
 */
export default class AirportsService extends Service {
    constructor(resource) {
        super(resource, 'airports');
    }

    /**
     * Loads the airports data from the server.
     * @public
     * @method AirportsService#getAirportsData
     * @param {Object} options - see {@link Service#get}
     * @returns {Promise} Promise which will be resolved with the airports data
     *		on success.
     */
    getAirportsData(options) {
        return super.get(options);
    }

    /**
     * Factory method to create an instance of this service adpater for
     * the given resource.
     * @public
     * @static
     * @method AirportsService.createServiceWithResource
     * @returns {AirportsService}
     */
    static createServiceWithResource(resource) {
        return new AirportsService(resource);
    }
}

