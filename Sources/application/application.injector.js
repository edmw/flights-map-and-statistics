/**
 * @file application.injector.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import ApplicationScope from './application.scope';
import ApplicationRunner from './application.runner';

import Continents from './continents';
import Countries from './countries';
import Regions from './regions';
import Airports from './airports';
import Flights from './flights';
import Trips from './trips';

import View from './view';
import MapView from './view.map';

import ModelFactory from './model.factory';

import CountriesServiceFactory from './countries.service';
import RegionsServiceFactory from './regions.service';
import AirportsServiceFactory from './airports.service';
import TripsServiceFactory from './trips.service';

import { BasicLogger } from './util.logger';

export const COUNTRIES_SERVICE = Symbol('ApplicationInjector.COUNTRIES_SERVICE');
export const REGIONS_SERVICE = Symbol('ApplicationInjector.REGIONS_SERVICE');
export const AIRPORTS_SERVICE = Symbol('ApplicationInjector.AIRPORTS_SERVICE');
export const TRIPS_SERVICE = Symbol('ApplicationInjector.TRIPS_SERVICE');

/**
 * DIY-DI (Do-It-Yourself Dependency Injection)
 *
 * Basically I'm not a great fan of sophisticated dependency injection frameworks.
 * In most cases the benefit using a framework for dependency injection is not very big
 * and the obfuscation of the overall dependency graph is often significant.
 *
 * Therefore I favor a concept called Do-It-Yourself Dependency Injection.
 *
 * @class ApplicationInjector
 * @see {@link http://blacksheep.parry.org/wp-content/uploads/2010/03/DIY-DI.pdf|DIY-DI (PDF)}
 */
export default class ApplicationInjector {
    constructor() {
        this.logger = null;

        this.continents = null;
        this.countries = null;
        this.regions = null;
        this.airports = null;
        this.flights = null;
        this.trips = null;

        this.view = null;
        this.mapView = null;

        this.modelFactory = null;

        this.prepareServiceInjector();
    }

    // Logger

    injectLogger(applicationScope) {
        if (this.logger === null) {
            this.logger = new BasicLogger(applicationScope.logLevel, console);
        }
        return this.logger;
    }

    // Service Adapters

    prepareServiceInjector() {
        this.serviceFactories = {};
        this.serviceFactories[COUNTRIES_SERVICE] = CountriesServiceFactory;
        this.serviceFactories[REGIONS_SERVICE] = RegionsServiceFactory;
        this.serviceFactories[AIRPORTS_SERVICE] = AirportsServiceFactory;
        this.serviceFactories[TRIPS_SERVICE] = TripsServiceFactory;

        this.services = new Map();
    }

    injectServiceAdapter(applicationScope, serviceType, serviceResource) {
        // lookup
        if (this.services.has(serviceType)) {
            if (this.services.get(serviceType).has(serviceResource)) {
                return this.services.get(serviceType).get(serviceResource);
            }
        }
        // create
        const serviceFactory = this.serviceFactories[serviceType];
        if (serviceFactory) {
            const service = serviceFactory.createServiceWithResource(serviceResource);
            if (service) {
                service.setLogger(this.injectLogger(applicationScope));

                if (this.services.has(serviceType) === false) {
                    this.services.set(serviceType, new Map());
                }
                this.services.get(serviceType).set(serviceResource, service);

                return service;
            }
        }

        return undefined;
    }

    // Continents

    injectContinents(applicationScope) {
        if (this.continents === null) {
            this.continents = new Continents();
            this.continents.setLogger(this.injectLogger(applicationScope));
        }
        return this.continents;
    }

    // Countries

    injectCountries(applicationScope) {
        if (this.countries === null) {
            this.countries = new Countries(
                this.injectServiceAdapter(applicationScope,
                    COUNTRIES_SERVICE, applicationScope.countriesServiceResource)
            );
            this.countries.setLogger(this.injectLogger(applicationScope));
        }
        return this.countries;
    }

    // Regions

    injectRegions(applicationScope) {
        if (this.regions === null) {
            this.regions = new Regions(
                this.injectServiceAdapter(applicationScope,
                    REGIONS_SERVICE, applicationScope.regionsServiceResource)
            );
            this.regions.setLogger(this.injectLogger(applicationScope));
        }
        return this.regions;
    }

    // Airports

    injectAirports(applicationScope) {
        if (this.airports === null) {
            this.airports = new Airports(
                this.injectContinents(applicationScope),
                this.injectCountries(applicationScope),
                this.injectRegions(applicationScope),
                this.injectServiceAdapter(applicationScope,
                    AIRPORTS_SERVICE, applicationScope.airportsServiceResource)
            );
            this.airports.setLogger(this.injectLogger(applicationScope));
        }
        return this.airports;
    }

    // Flights

    injectFlights(applicationScope) {
        if (this.flights === null) {
            this.flights = new Flights();
            this.flights.setLogger(this.injectLogger(applicationScope));
        }
        return this.flights;
    }

    // Trips

    injectTrips(applicationScope) {
        if (this.trips === null) {
            this.trips = new Trips(
                this.injectAirports(applicationScope),
                this.injectFlights(applicationScope),
                this.injectServiceAdapter(applicationScope,
                    TRIPS_SERVICE, applicationScope.tripsServiceResource)
            );
            this.trips.setLogger(this.injectLogger(applicationScope));
        }
        return this.trips;
    }

    // Model Factory

    injectModelFactory(applicationScope) {
        if (this.modelFactory === null) {
            this.modelFactory = new ModelFactory();
            this.modelFactory.setLogger(this.injectLogger(applicationScope));
        }
        return this.modelFactory;
    }

    // Map View

    injectMapView(applicationScope) {
        if (this.mapView === null) {
            this.mapView = new MapView();
        }
        return this.mapView;
    }

    // View

    injectView(applicationScope) {
        if (this.view === null) {
            this.view = new View(
                this.injectContinents(applicationScope),
                this.injectCountries(applicationScope),
                this.injectMapView(applicationScope)
            );
            this.view.setLogger(this.injectLogger(applicationScope));
        }
        return this.view;
    }

    /**
     * Factory method for an {@link ApplicationRunner} object. The returned
     * object will be glued together with all needed dependent objects
     * configured by the {@link ApplicationScope|application scope}.
     *
     * @public
     * @method ApplicationInjector#injectApplicationRunner
     * @param {ApplicationScope} applicationScope - An object holding all the
     *      application configuration parameters.
     * @returns {ApplicationRunner}
     */
    injectApplicationRunner(applicationScope) {
        const applicationRunner = new ApplicationRunner(
            this.injectContinents(applicationScope),
            this.injectCountries(applicationScope),
            this.injectRegions(applicationScope),
            this.injectAirports(applicationScope),
            this.injectFlights(applicationScope),
            this.injectTrips(applicationScope),
            this.injectView(applicationScope),
            this.injectModelFactory(applicationScope)
        );
        applicationRunner.setLogger(this.injectLogger(applicationScope));

        return applicationRunner;
    }
}
