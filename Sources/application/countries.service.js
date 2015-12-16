/**
 * @file countries.service.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import Service from './service';

import { Logger } from './util.logger';

/**
 * CountriesService is a {@link Service} adapter to access the servers Countries API.
 * @class CountriesService
 * @param {String} resource
 */
export default class CountriesService extends Service {
    constructor(resource) {
        super(resource, 'countries');
    }

    /**
     * Loads the countries data from the server.
     * @public
     * @method CountriesService#getCountriesData
     * @param {Object} options - see {@link Service#get}
     * @returns {Promise} Promise which will be resolved with the countries data
     *		on success.
     */
    getCountriesData(options) {
        return super.get(options);
    }

    /**
     * Factory method to create an instance of this service adpater for
     * the given resource.
     * @public
     * @static
     * @method CountriesService.createServiceWithResource
     * @returns {CountriesService}
     */
    static createServiceWithResource(resource) {
        return new CountriesService(resource);
    }
}
