/**
 * @file view.list.flights.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import ListView from './view.list';

var $ = require('jquery');

var numeral = require('numbro');

/**
 * @class FlightsListView
 */
export default class FlightsListView extends ListView {
    constructor(superview) {
        super(superview);
    }

    static divFlightDate(flight) {
        return `<div class="flight-date">${flight.dateToString()}</div>`;
    }

    static divFlightRoute(flight, parameters) {
        let orig = flight.origination;
        let dest = flight.destination;
        let sep = (parameters && parameters.br) ? '<br/>' : ' ';
        return [
            '<div class="flight-route">',
                '<span class="origination">',
                    orig.municipal.toString(),
                '</span>',
                sep,
                '<span class="destination">',
                    dest.municipal.toString(),
                '</span>',
            '</div>'
        ].join('');
    }

    static createCard(flight, opts) {
        let showAirports = (opts && opts.showAirports === true);
        let showDistance = (opts && opts.showDistance === true);
        let clickHandler = (opts) ? opts.flightClickHandler : undefined;

        function textForAirport(airport, time) {
            let l = [];
            if (time) {
                l.push(time, ' ');
            }
            l.push('(', airport.iata, ')', ' ', airport.name);
            return l.join('');
        }

        let orig = flight.origination;
        let dest = flight.destination;

        let airports = (showAirports) ? [
                '<div class="flight-airport takeoff">',
                    textForAirport(
                        orig,
                        flight.departureTimeToString()
                    ),
                '</div>',
                '<div class="flight-airport touchdown">',
                    textForAirport(
                        dest,
                        flight.arrivalTimeToString()
                    ),
                '</div>',
            ].join('') : '';

        let distance = (showDistance) ? [
                '<div class="distance">',
                    numeral(flight.distance).format('0,0') + ' km',
                '</div>',
            ].join('') : '';

        let card = $([
            '<div class="flight-card" data-flight-id="' + flight._id + '">',
                FlightsListView.divFlightDate(flight),
                FlightsListView.divFlightRoute(flight),
                airports,
                distance,
            '</div>'
        ].join(''));

        if (clickHandler) {
            card.on('click', function(e) {
                let card = $(this);
                card.stop()
                    .css('backgroundColor', '#fff')
                    .animate({backgroundColor: '#eee'}, 500);
                clickHandler(card.data('flight-id'));
                e.preventDefault();
            }).css('cursor', 'pointer');
        }

        return card;
    }

    /**
     * Builds a list in HTML format for the flights of the given trips.
     * @public
     * @method FlightsListView#buildList
     */
    buildList(trips, container, opts) {
        let olTrips = $('<ol>');
        trips.forEach((trip) => {
            let liTrip = $('<li>');
            let olFlights = $('<ol>');
            let flights = trip.flights;
            flights.forEach((flight) => {
                olFlights.append($('<li>').append(
                    FlightsListView.createCard(flight, opts)
                ));
            });
            liTrip.append(
                [
                    '<div class="trip-card">',
                    trip.label,
                    '</div>'
                ].join('')
            );
            liTrip.append(olFlights);
            olTrips.append(liTrip);
        });
        container.append(olTrips);

        // widget internal events
        $('.trip-card').on('click', function(e) {
            e.preventDefault();
            $(this).toggleClass('expanded');
            if ($(this).hasClass('expanded')) {
                $(this).next().slideDown();
            }
            else {
                $(this).next().slideUp();
            }
        }).addClass('accordion expanded');
    }

}
