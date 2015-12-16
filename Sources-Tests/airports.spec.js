import scope from '../Sources-Tests/application.scope.test';

import ApplicationInjector from '../Sources/application/application.injector';

import Airports from '../Sources/application/airports';

import { Logger } from '../Sources/application/util.logger';

describe('Airports', () => {
    'use strict';

    var continentsSpy;
    var countriesSpy;
    var regionsSpy;
    var serviceSpy;

    var airportsWithSpies;
    var airports;

    beforeEach((done) => {
        continentsSpy = jasmine.createSpyObj('continentsSpy', ['continentWithCode']);
        countriesSpy = jasmine.createSpyObj('countriesSpy', ['countryWithCode']);
        regionsSpy = jasmine.createSpyObj('regionsSpy', ['regionWithCode']);
        serviceSpy = jasmine.createSpyObj('serviceSpy', ['getAirportsData']);
        airportsWithSpies = new Airports(continentsSpy, countriesSpy, regionsSpy, serviceSpy);

        let injector = new ApplicationInjector();
        airports = injector.injectAirports(scope);
        airports.load('').then(() => {
            done();
        });
    });

    var airportDataForFRA = {
        'wiki': 'http://en.wikipedia.org/wiki/Frankfurt_Airport',
        'iata': 'FRA',
        'icao': 'EDDF',
        'lat': '50.0264015198',
        'tz': 'Europe/Berlin',
        'cou': 'DE',
        'name': 'Frankfurt am Main International Airport',
        'elv': '364',
        'lon': '8.54312992096',
        'mun': 'Frankfurt-am-Main',
        'type': 'L',
        'reg': 'DE-HE',
        'con': 'EU'
    };

    it('should have a continents object from constructor', () => {
        expect(airportsWithSpies.continents).toBe(continentsSpy);
    });
    it('should have a countries object from constructor', () => {
        expect(airportsWithSpies.countries).toBe(countriesSpy);
    });
    it('should have a regions object from constructor', () => {
        expect(airportsWithSpies.regions).toBe(regionsSpy);
    });
    it('should have a service object from constructor', () => {
        expect(airportsWithSpies.service).toBe(serviceSpy);
    });

    it('should have a default logger', () => {
        expect(airportsWithSpies.logger).toBeDefined();
        expect(airportsWithSpies.logger instanceof Logger).toBeTruthy();
    });
    it('should have a setter to inject a logger', () => {
        let loggerSpy = jasmine.createSpy('logger');
        airportsWithSpies.setLogger(loggerSpy);
        expect(airportsWithSpies.logger).toBeDefined();
        expect(airportsWithSpies.logger.and.identity()).toEqual('logger');
    });

    it('should have zero airports initially', () => {
        expect(airportsWithSpies.numberOfAirports).toEqual(0);
        expect(airportsWithSpies.getAirportDataWithCode(null)).toBeNull();
        expect(airportsWithSpies.getAirportDataWithCode('FRA')).toBeNull();
        expect(airportsWithSpies.getAirportDataWithCode('EDDF')).toBeNull();
        expect(airportsWithSpies.createAirport('FRA')).toBeNull();
    });

    it('should throw error for invalid data', () => {
        expect(airportsWithSpies.setAirportsData.bind(airportsWithSpies, null))
            .toThrowError(TypeError);
        expect(airportsWithSpies.setAirportsData.bind(airportsWithSpies, [null]))
            .toThrowError(TypeError);
    });

    it('should have one airport from test data', () => {
        airportsWithSpies.setAirportsData([airportDataForFRA]);
        expect(airportsWithSpies.numberOfAirports).toEqual(1);
        expect(airportsWithSpies.getAirportDataWithCode(null)).toBeNull();
        expect(airportsWithSpies.getAirportDataWithCode('FRA')).not.toBeNull();
        expect(airportsWithSpies.getAirportDataWithCode('EDDF')).not.toBeNull();
        expect(airportsWithSpies.createAirport('FRA')).not.toBeNull();
    });

    it('should create an airport with code from airports data', () => {
        let airport1 = airports.createAirport('LHR');
        expect(airport1).not.toBeNull();
        expect(airport1.iata).toEqual('LHR');
        let airport2 = airports.createAirport('FRA');
        expect(airport2).not.toBeNull();
        expect(airport2.iata).toEqual('FRA');
        // check id
        expect(airport1.id).not.toEqual(airport2.id);
    });

    it('should have many airports from airports data', () => {
        expect(airports.numberOfAirports).toBeGreaterThan(1);
        expect(airports.createAirport('LHR')).not.toBeNull();
        expect(airports.createAirport('EGLL')).not.toBeNull();
    });

});
