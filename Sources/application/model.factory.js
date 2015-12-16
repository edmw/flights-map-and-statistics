/**
 * Model factory.
 */

import Model from './model';

import { Logger } from './util.logger';

/**
 * Model factory class.
 * @class ModelFactory
 */
export default class ModelFactory {
    constructor() {
        this.logger = new Logger();
    }
    /**
     * Injects a logger. Usually this method is called by an injector class.
     * Because a logger is optional it is not injected via constructor.
     * @public
     * @method ModelFactory#setLogger
     * @param {Logger} logger
     */
    setLogger(logger) {
        this.logger = logger;
    }

    /**
     * Creates a model for the given trips and airports.
     * @public
     * @method ModelFactory#create
     * @param {Array} listOfTrips - List of trips to be handled by the model.
     * @param {Array} listOfAirports - List of airports to be handled by the model.
     * @returns {Model}
     */
    create(listOfTrips, listOfAirports) {
        this.logger.info(this, 'Create model');
        const model = new Model(listOfTrips, listOfAirports);
        model.setLogger(this.logger);
        return model;
    }
}
