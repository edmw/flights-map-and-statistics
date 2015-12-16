/**
 * @file application.runner.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import defaults from './defaults';

import { Logger } from './util.logger';

var i18n = require('i18next-client');
var moment = require('moment');
var numeral = require('numbro');
numeral.language('de', require('numbro/languages/de-DE'));

/**
 * ApplicationRunner class.
 * @class ApplicationRunner
 * @param {Continents} continents
 * @param {Countries} countries
 * @param {Regions} regions
 * @param {Airports} airports
 * @param {Flights} flights
 * @param {Trips} trips
 * @param {View} view
 * @param {ModelFactory} modelFactory
 */
export default class ApplicationRunner {
    constructor(continents, countries, regions, airports, flights, trips, view, modelFactory) {
        this.logger = new Logger();

        this.continents = continents;
        this.countries = countries;
        this.regions = regions;
        this.airports = airports;
        this.flights = flights;
        this.trips = trips;

        this.view = view;

        this.modelFactory = modelFactory;
    }
    /**
     * Injects a logger. Usually this method is called by an injector class.
     * Because a logger is optional it is not injected via constructor.
     * @public
     * @method ApplicationRunner#setLogger
     * @param {Logger} logger
     */
    setLogger(logger) {
        this.logger = logger;
    }

    /**
     * Initializes this application runner. Must be called before
     * ApplicationRunner#start.
     * Invokes the given callback after finishing.
     *
     * @example <caption>How to run the application</caption>
     *      applicationRunner.init(() => {
     *          applicationRunner.start();
     *      });
     *
     * @public
     * @method ApplicationRunner#init
     * @param {Function} callback
     */
    init(callback) {
        this.logger.info(this, 'Initialize');

        // initialize self (invoke callback after initialization)

        const app = this;

        app.language = 'en';
        i18n.init({
                fallbackLng: app.language,
                lowerCaseLng: true,
                resGetPath: 'locales/__lng__.json',
            },
            () => {
                app.language = i18n.lng();

                moment.locale(app.language);
                numeral.language(app.language.substring(0, 2));

                callback();
            }
        );

        return this;
    }

    /**
     * Loads all data.
     * @private
     * @method ApplicationRunner#load
     * @returns {Promise} Promise which will be resolved after loading.
     */
    load() {
        const app = this;

        return new Promise((resolve, reject) => {
            Promise.all([
                app.continents.init(),
                app.countries.load(app.language),
                app.regions.load(app.language),
                app.airports.load(app.language),
            ])
            .then(() => {
                app.trips.load().then(() => {
                    resolve();
                })
                .catch((error) => {
                    app.logger.error(error);
                    if (error) {
                        app.logger.error(error.stack);
                    }
                    reject();
                });
            })
            .catch((error) => {
                app.logger.error(error);
                if (error) {
                    app.logger.error(error.stack);
                }
                reject();
            });
        });
    }

    showHome() {
        this.view.showAirport(false, 4, this.trips.homeAirport);
    }

    showTrips() {
        // fetch trips
        const result = this.trips.fetch({
            label: this.view.getFilterValue('trip_label'),
            year: this.view.getFilterValue('trip_year'),
            participant: this.view.getFilterValue('trip_participant'),
        });
        // update view with model of result
        this.view.update(this.modelFactory.create(result.trips, result.airports));
    }

    /**
     * Starts this application runner.
     * @public
     * @method ApplicationRunner#start
     * @param {Function} callback
     */
    start(callback) {
        const app = this;

        app.view.block();
        app.view.subscribe('init_done', () => {
            app.load().then(() => {
                app.logger.info(app, 'Run');

                app.showHome();

                app.view.addFilter('trip_label',
                    app.trips.labels(),
                    {off: 'ui.all_trips'}
                );
                app.view.addFilter('trip_year',
                    app.trips.years(),
                    {off: 'ui.all_years'}
                );
                app.view.addFilter('trip_participant',
                    app.trips.participants(),
                    {off: 'ui.all_participants'}
                );
                app.view.subscribe('home_pressed', function() {
                    app.showHome();
                });
                app.view.subscribe('filter_changed', function() {
                    app.showTrips();
                });
                app.view.showTools();

                app.showTrips();

                app.view.unblock();

                callback(0);
            })
            .catch((error) => {
                app.view.unblock();

                callback(42);
            });
        }).init(defaults);
    }

}
