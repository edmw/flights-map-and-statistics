/**
 * @file view.list.statistics.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import ListView from './view.list';
import AirportsListView from './view.list.airports';
import FlightsListView from './view.list.flights';

import ViewUtils from './view.utils';

var $ = require('jquery');

var numeral = require('numbro');
var i18n = require('i18next-client');

/**
 * @class StatisticsListView
 */
export default class StatisticsListView extends ListView {
    constructor(superview, continents, countries) {
        super(superview);

        this.continents = continents;
        this.countries = countries;
    }

    spanDistance(distance) {
        return ViewUtils.span('distance',
            `${numeral(distance).format('0,0')} km`
        );
    }

    statisticsCard(elements) {
        let div = $('<div>', {
            'class': 'statistics-card'
        });
        if (elements) {
            div.append(elements);
        }
        return div;
    }

    statisticsCardTable(keys, valuesFunctions, title, help) {
        let card = this.statisticsCard();
        card.append(this.listItemDiv(title, {
            'help': help,
            'class': 'statistics-header',
        }));
        let a = [];
        for (let i = 0, l = keys.length; i < 10 && i < l; i += 1) {
            a.push(keys[i]);
        }
        card.append(
            ViewUtils.table('statistics-table', a, valuesFunctions)
        );
        return card;
    }

    statisticsFlightCard(flight, value, title, opts) {
        let card = this.statisticsCard();
        card.append(this.listKeyValueDiv(title, value, {
            'class': 'statistics-header',
        }));
        card.append(FlightsListView.createCard(flight, opts));
        return card;
    }

    statisticsAirportCard(airport, value, title, opts) {
        let card = this.statisticsCard();
        card.append(this.listKeyValueDiv(title, value, {
            'class': 'statistics-header',
        }));
        card.append(AirportsListView.createCard(airport, opts));
        return card;
    }

    /**
     * Builds a list in HTML format for the statistics data of given model.
     * @public
     * @method StatisticsListView#buildList
     */
    buildList(model, container, opts) {
        let ol = $('<ol>', {'id': 'statistics-list'});
        ol.append(this.listItem('ui.x_flight_distance', {
            'x': numeral(model.totalDistanceForFlights).format('0,0'),
            'class': 'statistics head',
        }));

        // trips

        let not = model.numberOfTrips;
        ol.append(this.listItem('ui.x_trip', {
            'count': not,
            'class': 'statistics section',
        }));
        let olTrips = $('<ol>');
        olTrips.append(this.listKeyValue(
            'ui.flights_distance_per_trip',
            this.spanDistance(model.totalDistanceForFlights / not),
            {'class': 'statistics'}
        ));
        ol.append($('<li>').append(olTrips));

        // flights

        let nof = model.numberOfFlights;
        ol.append(this.listItem('ui.x_flight', {
            'count': nof,
            'class': 'statistics section',
        }));
        let olFlights = $('<ol>');
        olFlights.append(
            this.listItem('ui.x_domestic_flights', {
                'count': model.numberOfDomesticFlights,
                'help': 'ui.x_domestic_flights_help',
                'class': 'statistics',
            })
        );
        olFlights.append(
            this.listItem('ui.x_continental_flights', {
                'count': model.numberOfContinentalFlights,
                'help': 'ui.x_continental_flights_help',
                'class': 'statistics',
            })
        );
        olFlights.append(
            this.listItem('ui.x_intercontinental_flights', {
                'count': model.numberOfIntercontinentalFlights,
                'help': 'ui.x_intercontinental_flights_help',
                'class': 'statistics',
            })
        );
        olFlights.append(
            this.listItem('ui.x_different_routes', {
                'count': model.flightsForRoute.size(),
                'help': 'ui.x_different_routes_help',
                'class': 'statistics',
            })
        );
        if (model.flightWithLongestDistance) {
            let flight = model.flightWithLongestDistance;
            olFlights.append($('<li>').append(
                this.statisticsFlightCard(flight,
                    this.spanDistance(flight.distance),
                    'ui.longest_distance_flight',
                    opts
                )
            ));
        }
        if (model.flightWithShortestDistance) {
            let flight = model.flightWithShortestDistance;
            olFlights.append($('<li>').append(
                this.statisticsFlightCard(flight,
                    this.spanDistance(flight.distance),
                    'ui.shortest_distance_flight',
                    opts
                )
            ));
        }
        olFlights.append(this.listKeyValue(
            'ui.flights_distance_per_flight',
            this.spanDistance(model.totalDistanceForFlights / nof),
            {'class': 'statistics'}
        ));
        if (model.continentsByNumberOfFlights) {
            olFlights.append($('<li>').append(
                this.statisticsCardTable(model.continentsByNumberOfFlights, [
                    (continent) => {
                        return i18n.t(continent.toString());
                    },
                    (continent) => {
                        return numeral(
                            model.getNumberOfFlightsForContinent(continent)
                        ).format('0');
                    }],
                    'ui.top_10_continents',
                    'ui.top_10_continents_help'
                )
            ));
        }
        if (model.countriesByNumberOfFlights) {
            olFlights.append($('<li>').append(
                this.statisticsCardTable(model.countriesByNumberOfFlights, [
                    (country) => {
                        return i18n.t(country.toString());
                    },
                    (country) => {
                        return numeral(
                            model.getNumberOfFlightsForCountry(country)
                        ).format('0');
                    }],
                    'ui.top_10_countries',
                    'ui.top_10_countries_help'
                )
            ));
        }
        if (model.municipalsByNumberOfFlights) {
            olFlights.append($('<li>').append(
                this.statisticsCardTable(model.municipalsByNumberOfFlights, [
                    (municipal) => {
                        return i18n.t(municipal.toString());
                    },
                    (municipal) => {
                        return numeral(
                            model.getNumberOfFlightsForMunicipal(municipal)
                        ).format('0');
                    }],
                    'ui.top_10_municipals',
                    'ui.top_10_municipals_help'
                )
            ));
        }
        ol.append($('<li>').append(olFlights));

        // airports

        let noa = model.numberOfAirports;
        ol.append(this.listItem('ui.x_airport', {
            'count': noa,
            'class': 'statistics section',
        }));
        let olAirports = $('<ol>');
        olAirports.append(
            this.listItem2('ui.x_different_continents', {
                'count': model.airportForContinent.size(),
                'class': 'statistics',
            },
            'ui.x_different_continents_total', {
                'count': this.continents.numberOfContinents,
                'class': 'statistics',
            })
        );
        olAirports.append(
            this.listItem2('ui.x_different_countries', {
                'count': model.airportForCountry.size(),
                'class': 'statistics',
            },
            'ui.x_different_countries_total', {
                'count': this.countries.numberOfCountries,
                'class': 'statistics',
            })
        );
        if (model.airportWithHighestElevation) {
            let airport = model.airportWithHighestElevation;
            olAirports.append($('<li>').append(
                this.statisticsAirportCard(airport,
                    ViewUtils.formatDistanceInFeet(airport.elevation),
                    'ui.highest_located_airport',
                    opts
                )
            ));
        }
        if (model.airportWithLowestElevation) {
            let airport = model.airportWithLowestElevation;
            olAirports.append($('<li>').append(
                this.statisticsAirportCard(airport,
                    ViewUtils.formatDistanceInFeet(airport.elevation),
                    'ui.lowest_located_airport',
                    opts
                )
            ));
        }
        if (model.airportsByFrequency) {
            olAirports.append($('<li>').append(
                this.statisticsCardTable(model.airportsByFrequency, [
                    function(airport) {
                        return airport.name;
                    },
                    function(airport) {
                        return numeral(
                            model.getFrequencyForAirport(airport)
                        ).format('0');
                    }],
                    'ui.top_10_airports',
                    'ui.top_10_airports_help'
                )
            ));
        }
        ol.append($('<li>').append(olAirports));

        container.append(ol);

        // widget internal events
        $('.statistics.section').on('click', function(e) {
            e.preventDefault();
            $(this).toggleClass('expanded');
            if ($(this).hasClass('expanded')) {
                $(this).parent().next().slideDown();
            }
            else {
                $(this).parent().next().slideUp();
            }
        }).addClass('accordion expanded');
    }
}
