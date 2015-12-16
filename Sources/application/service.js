/**
 * @file service.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import { Logger } from './util.logger';

export const SERVICE_ERROR = 1;
export const SERVICE_ERROR_EXCEPTION = 1;

export const SERVICE_ERROR_JSON = 10;
export const SERVICE_ERROR_HTTP = 20;

export const SERVICE_ERROR_RESOURCE_NOT_SPECIFED = 100;

/**
 * Error class for service errors.
 *
 * Note: Currently it is not possible to use Symbols for error codes, because
 * the toString method of the error base class will throw a type error then.
 *
 * @class ServiceError
 * @param {Number} code - Error code
 * @param {String} reason - Error reason
 */
export class ServiceError extends Error {
    constructor(code = SERVICE_ERROR, reason = 'Service error') {
        super(reason);

        this.code = code;
        this.reason = reason;
    }
}

/**
 * Error class for service JSON errors.
 *
 * @class ServiceJSONError
 * @param {String} reason - Error reason
 */
export class ServiceJSONError extends ServiceError {
    constructor(reason = 'Service JSON error') {
        super(SERVICE_ERROR_JSON, reason);
    }
}

/**
 * Error class for service HTTP errors.
 *
 * @class ServiceHTTPError
 * @param {Number} status - HTTP status
 * @param {String} reason - Error reason
 */
export class ServiceHTTPError extends ServiceError {
    constructor(status = 9999, reason = 'Service HTTP error') {
        super(SERVICE_ERROR_HTTP, reason);

        this.status = status;
    }
}

/**
 * Service adapter base class. This service adapter loads JSON data from the
 * given resource URI und returns the parsed data. The optional root element
 * can be specified to return the child elements for this element only.
 *
 * @class Service
 * @param {String} resource - Resource URI for this service.
 * @param {String} rootElement - Root element of the JSON data returned by
 *      the server.
 */
export default class Service {
    constructor(resource, rootElement = '') {
        this.logger = new Logger();

        /**
         * @private
         * @member {String} Service#resource - Resource URI for this service.
         */
        this.resource = resource;

        /**
         * @private
         * @member {String} Service#jsonRootElement - Root element of the JSON
         *      data returned by the server.
         */
        this.jsonRootElement = rootElement;

        /**
         * @private
         * @member {String} Service#data - Data returned by the server.
         */
        this.data = null;
    }
    /**
     * Injects a logger. Usually this method is called by an injector class.
     * Because a logger is optional it is not injected via constructor.
     * @public
     * @method Service#setLogger
     * @param {Logger} logger
     */
    setLogger(logger) {
        this.logger = logger;
    }

    /**
     * Loads the data from the given url. Expects JSON data from the server
     * and parses it before resolving the promise.
     *
     * @private
     * @method Service#getWithURL
     * @param {String} url
     * @returns {Promise} Promise which will be resolved with the loaded data
     *      on success.
     */
    getWithURL(url) {
        const service = this;

        return new Promise((resolve, reject) => {
            if (url) {
                service.logger.info(service, 'Get resource at URL ', `"${url}"`);
                try {
                    const xhr = new XMLHttpRequest();
                    xhr.withCredentials = true;
                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            try {
                                resolve(JSON.parse(xhr.responseText));
                            }
                            catch (e) {
                                const error = new ServiceJSONError(e.message);
                                reject(error);
                            }
                        }
                        else {
                            const error = new ServiceHTTPError(xhr.status, xhr.statusText);
                            reject(error);
                        }
                    };
                    xhr.onerror = (e) => {
                        const error = new ServiceHTTPError();
                        reject(error);
                    };
                    xhr.open('GET', url);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.send();
                }
                catch (e) {
                    const error = new ServiceError(
                        SERVICE_ERROR_EXCEPTION,
                        `Exception: ${e.name} (${e.code})`
                    );
                    reject(error);
                }
            }
            else {
                const error = new ServiceError(
                    SERVICE_ERROR_RESOURCE_NOT_SPECIFED,
                    'No URL specified'
                );
                reject(error);
            }
        });
    }

    /**
     * Loads the data from the server. If a language code is given, the service
     * tries to load localized data first. Otherwise, or if loading localized
     * data fails, the service tries to load the data without specifing a
     * language.
     *
     * @public
     * @method Service#get
     * @param {Object} options
     * @param {String} options.language - Optional ISO code for a language.
     * @returns {Promise} Promise which will be resolved with the loaded data
     *      on success.
     */
    get(options) {
        const service = this;

        return new Promise((resolve, reject) => {
            if (service.data === null) {

                const resolveGet = function(data) {
                    service.data = [];
                    if (data) {
                        if (service.jsonRootElement) {
                            if (data[service.jsonRootElement]) {
                                service.data = data[service.jsonRootElement];
                            }
                        }
                        else {
                            service.data = data;
                        }
                    }
                    service.logger.info(service, `#${Object.keys(service.data).length}`);
                    resolve(service.data);
                };

                let serviceURL = null;
                let serviceURLWithLanguage = null;

                // service url
                serviceURL = [service.resource, 'json'].join('.');

                // service url for language
                if (options && options.language) {
                    const language = options.language;
                    serviceURLWithLanguage = [service.resource, language.slice(0, 2), 'json'].join('.');
                }

                service.getWithURL(serviceURLWithLanguage)
                    .then(resolveGet)
                    .catch((error) => {
                        const notspecified = (error.code === SERVICE_ERROR_RESOURCE_NOT_SPECIFED);
                        const notfound = (error.code === SERVICE_ERROR_HTTP && error.status === 404);

                        if (notspecified || notfound) {
                            service.getWithURL(serviceURL)
                                .then(resolveGet)
                                .catch((error) => {
                                    reject(error);
                                });
                        }
                        else {
                            reject(error);
                        }
                    });
            }
            else {
                resolve(service.data);
            }
        });
    }
}
