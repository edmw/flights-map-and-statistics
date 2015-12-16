/**
 * Model module.
 */

import Airport from './airport';
import Flight from './flight';
import Continent from './continent';
import Country from './country';
import Region from './region';
import Municipal from './municipal';

import buckets from './util.buckets';

import { Logger } from './util.logger';

/**
 * Model class.
 * @class Model
 */
export default class Model {
    constructor(listOfTrips, listOfAirports) {
        this.logger = new Logger();

        this.trips = listOfTrips;
        this.airports = listOfAirports;

        // sort airports by name
        this.airports.sort((a, b) => { return a.name.localeCompare(b.name); });

        // collections

        this.tripById = {};
        this.flightById = {};
        this.flightsForRoute = buckets.createMultiDictionary('', Flight);
        this.flightsForContinent = buckets.createMultiDictionary(Continent, Flight);
        this.flightsForCountry = buckets.createMultiDictionary(Country, Flight);
        this.flightsForMunicipal = buckets.createMultiDictionary(Municipal, Flight);

        for (const trip of this.trips) {
            this.tripById[trip.id] = trip;
            for (const flight of trip.flights) {
                this.flightById[flight.id] = flight;
                this.flightsForRoute.set(flight.route, flight);
                this.flightsForContinent.set(flight.destination.continent, flight);
                this.flightsForCountry.set(flight.destination.country, flight);
                this.flightsForMunicipal.set(flight.destination.municipal, flight);
            }
        }

        this.airportById = {};
        this.airportForContinent = buckets.createMultiDictionary(Continent, Airport);
        this.airportForCountry = buckets.createMultiDictionary(Country, Airport);

        for (const airport of this.airports) {
            this.airportById[airport.id] = airport;
            this.airportForContinent.set(airport.continent, airport);
            this.airportForCountry.set(airport.country, airport);
        }

        // statistics

        const frequencyForAirport = {};

        this.totalDistanceForFlights = 0;
        this.flightWithLongestDistance = null;
        this.flightWithShortestDistance = null;

        this.numberOfDomesticFlights = 0;
        this.numberOfContinentalFlights = 0;
        this.numberOfIntercontinentalFlights = 0;

        this.airportWithHighestElevation = null;
        this.airportWithLowestElevation = null;

        let higestElevation = -Infinity;
        let lowestElevation = +Infinity;
        for (const airport of this.airports) {
            // highest located airport
            if (higestElevation < airport.elevation) {
                this.airportWithHighestElevation = airport;
                higestElevation = airport.elevation;
            }
            // lowest located airport
            if (lowestElevation > airport.elevation) {
                this.airportWithLowestElevation = airport;
                lowestElevation = airport.elevation;
            }
            // add airport to frequency list
            frequencyForAirport[airport.id] = 0;
        }

        let longestDistance = -Infinity;
        let shortestDistance = +Infinity;
        for (const trip of this.trips) {
            this.totalDistanceForFlights += trip.distanceForFlights;
            for (const flight of trip.flights) {
                const orig = flight.origination;
                const dest = flight.destination;
                // longest flight (distance)
                if (longestDistance < flight.distance) {
                    this.flightWithLongestDistance = flight;
                    longestDistance = flight.distance;
                }
                // shortest flight (distance)
                if (shortestDistance > flight.distance) {
                    this.flightWithShortestDistance = flight;
                    shortestDistance = flight.distance;
                }

                // domestic flights
                if (orig.country === dest.country) {
                    this.numberOfDomesticFlights += 1;
                }
                // continental flights
                else if (orig.continent === dest.continent) {
                    this.numberOfContinentalFlights += 1;
                }
                // intercontinental flights
                else {
                    this.numberOfIntercontinentalFlights += 1;
                }
                // airport frequency
                frequencyForAirport[orig.id] += 1;
                frequencyForAirport[dest.id] += 1;
            }
        }

        this.continentsByNumberOfFlights =
            buckets.keysOfMultiDictionarySortedByLengthOfValue(this.flightsForContinent);
        this.countriesByNumberOfFlights =
            buckets.keysOfMultiDictionarySortedByLengthOfValue(this.flightsForCountry);
        this.municipalsByNumberOfFlights =
            buckets.keysOfMultiDictionarySortedByLengthOfValue(this.flightsForMunicipal);

        this.frequencyForAirport = frequencyForAirport;
        this.airportsByFrequency = this.airports.slice();
        this.airportsByFrequency.sort((a, b) => {
            return frequencyForAirport[b.id] - frequencyForAirport[a.id];
        });
    }
    /**
     * Injects a logger. Usually this method is called by an injector class.
     * Because a logger is optional it is not injected via constructor.
     * @public
     * @method Model#setLogger
     * @param {Logger} logger
     */
    setLogger(logger) {
        this.logger = logger;
    }

    get numberOfTrips() {
        return this.trips.length;
    }

    getTripById(id) {
        return this.tripById[id];
    }

    get numberOfAirports() {
        return this.airports.length;
    }

    getAirportById(id) {
        return this.airportById[id];
    }

    getFrequencyForAirport(airport) {
        return this.frequencyForAirport[airport.id];
    }

    get numberOfFlights() {
        let nof = 0;
        for (const trip of this.trips) {
            nof += trip.numberOfFlights;
        }
        return nof;
    }

    getNumberOfFlightsForContinent(continent) {
        return this.flightsForContinent.get(continent).length;
    }

    getNumberOfFlightsForCountry(country) {
        return this.flightsForCountry.get(country).length;
    }

    getNumberOfFlightsForMunicipal(municipal) {
        return this.flightsForMunicipal.get(municipal).length;
    }

    getFlightById(id) {
        return this.flightById[id];
    }
}
