import scope from '../Sources-Tests/application.scope.test';

import {
    default as ApplicationInjector,
    COUNTRIES_SERVICE,
    REGIONS_SERVICE,
    AIRPORTS_SERVICE,
    TRIPS_SERVICE
} from '../Sources/application/application.injector';

import ApplicationRunner from '../Sources/application/application.runner';

import CountriesService from '../Sources/application/countries.service';
import RegionsService from '../Sources/application/regions.service';
import AirportsService from '../Sources/application/airports.service';
import TripsService from '../Sources/application/trips.service';

import Continents from '../Sources/application/continents';
import Countries from '../Sources/application/countries';
import Regions from '../Sources/application/regions';
import Airports from '../Sources/application/airports';
import Flights from '../Sources/application/flights';
import Trips from '../Sources/application/trips';
import View from '../Sources/application/view';
import MapView from '../Sources/application/view.map';
import ModelFactory from '../Sources/application/model.factory';

import {Logger} from '../Sources/application/util.logger';

describe('ApplicationInjector', () => {
    'use strict';

    var injector;

    const NULL = Symbol('NULL');

    beforeEach(() => {
        injector = new ApplicationInjector();
        // add special factory to test failure of service creation
        injector.serviceFactories[NULL] = {
            createServiceWithResource: (resource) => { return null; }
        };
    });

    it('should inject a logger', () => {
        let logger = injector.injectLogger(scope);
        expect(logger).toBeDefined();
        expect(logger instanceof Logger).toBeTruthy();
    });

    var testServiceInjection = (serviceType, serviceClass, serviceResource) => {
        let service = injector.injectServiceAdapter(scope, serviceType, serviceResource);
        // service class should belong to service type
        expect(service).toBeDefined();
        expect(service instanceof serviceClass).toBeTruthy();
        // same service resource should result into the same service object
        let service2 = injector.injectServiceAdapter(scope, serviceType, serviceResource);
        expect(service2).toBe(service);
        // different service resource should result into different service object
        let service3 = injector.injectServiceAdapter(scope, serviceType, 'anotherResource');
        expect(service3).not.toBe(service);
    };

    it('should inject a countries service', () => {
        testServiceInjection(COUNTRIES_SERVICE, CountriesService, scope.countriesServiceResource);
    });
    it('should inject a regions service', () => {
        testServiceInjection(REGIONS_SERVICE, RegionsService, scope.regionsServiceResource);
    });
    it('should inject a airports service', () => {
        testServiceInjection(AIRPORTS_SERVICE, AirportsService, scope.airportsServiceResource);
    });
    it('should inject a trips service', () => {
        testServiceInjection(TRIPS_SERVICE, TripsService, scope.tripsServiceResource);
    });
    it('should fail to inject any service', () => {
        let service = injector.injectServiceAdapter(scope, 'any', 'any');
        expect(service).toBeUndefined();
    });
    it('should fail to inject null service', () => {
        let service = injector.injectServiceAdapter(scope, NULL, 'any');
        expect(service).toBeUndefined();
    });

    it('should inject a continents class', () => {
        let continents = injector.injectContinents(scope);
        expect(continents).toBeDefined();
        expect(continents instanceof Continents).toBeTruthy();
        expect(continents).toBe(injector.injectContinents(scope));
    });

    it('should inject a countries class', () => {
        let countries = injector.injectCountries(scope);
        expect(countries).toBeDefined();
        expect(countries instanceof Countries).toBeTruthy();
        expect(countries).toBe(injector.injectCountries(scope));
    });

    it('should inject a regions class', () => {
        let regions = injector.injectRegions(scope);
        expect(regions).toBeDefined();
        expect(regions instanceof Regions).toBeTruthy();
        expect(regions).toBe(injector.injectRegions(scope));
    });

    it('should inject a airports class', () => {
        let airports = injector.injectAirports(scope);
        expect(airports).toBeDefined();
        expect(airports instanceof Airports).toBeTruthy();
        expect(airports).toBe(injector.injectAirports(scope));
    });

    it('should inject a flights class', () => {
        let flights = injector.injectFlights(scope);
        expect(flights).toBeDefined();
        expect(flights instanceof Flights).toBeTruthy();
        expect(flights).toBe(injector.injectFlights(scope));
    });

    it('should inject a trips class', () => {
        let trips = injector.injectTrips(scope);
        expect(trips).toBeDefined();
        expect(trips instanceof Trips).toBeTruthy();
        expect(trips).toBe(injector.injectTrips(scope));
    });

    it('should inject a model factory', () => {
        let factory = injector.injectModelFactory(scope);
        expect(factory).toBeDefined();
        expect(factory instanceof ModelFactory).toBeTruthy();
        expect(factory).toBe(injector.injectModelFactory(scope));
    });

    it('should inject a map view', () => {
        let mapview = injector.injectMapView(scope);
        expect(mapview).toBeDefined();
        expect(mapview instanceof MapView).toBeTruthy();
        expect(mapview).toBe(injector.injectMapView(scope));
    });

    it('should inject a view', () => {
        let view = injector.injectView(scope);
        expect(view).toBeDefined();
        expect(view instanceof View).toBeTruthy();
        expect(view).toBe(injector.injectView(scope));
    });

    it('should inject a application runner', () => {
        let runner = injector.injectApplicationRunner(scope);
        expect(runner).toBeDefined();
        expect(runner instanceof ApplicationRunner).toBeTruthy();
        expect(runner).not.toBe(injector.injectApplicationRunner(scope));
    });

});
