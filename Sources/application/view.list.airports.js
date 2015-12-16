/**
 * @file view.list.airports.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import ListView from './view.list';

import ViewUtils from './view.utils';

var $ = require('jquery');

/**
 * @class AirportsListView
 */
export default class AirportsListView extends ListView {
    constructor(superview) {
        super(superview);
    }

    static buildAirportName(airport) {
        var d = $('<div>', {'class': 'airport-name'});
        d.append(airport.name);
        return d;
    }

    static buildAirportLocation(airport) {
        let d = $('<div>', {'class': 'airport-location'});

        let municipal = airport.municipal;
        let region = airport.region;
        let country = airport.country;

        d.append(ViewUtils.span('municipal', municipal.toString()));

        if (region) {
            if (region.name !== municipal.name) {
                // only display region if not equal to municipal
                d.append([', ', ViewUtils.span('region', region.toString())]);
            }
        }
        if (country) {
            d.append([', ', ViewUtils.span('country', country.toString())]);
        }
        return d;
    }

    static createCard(airport, opts) {
        let showCodes = (opts && opts.showCodes === true);
        let showPosition = (opts && opts.showPosition === true);
        let clickHandler = (opts) ? opts.airportClickHandler : undefined;

        function buildCodes(airport) {
            let d = $('<div>', {'class': 'airport-codes'});
            d.append(ViewUtils.span('iata', airport.iata));
            d.append(' ');
            d.append(ViewUtils.span('icao', airport.icao));
            return d;
        }

        function buildPosition(airport) {
            let d = $('<div>', {'class': 'airport-position'});
            d.append([
                ViewUtils.span('latitude', ViewUtils.formatLatitudeDegrees(airport.latitude)),
                ' ',
                ViewUtils.span('longitude', ViewUtils.formatLongitudeDegrees(airport.longitude)),
            ]);
            if (airport.elevation) {
                d.append(['<br/>', '(' + ViewUtils.formatDistanceInFeet(airport.elevation) + ')']);
            }
            return d;
        }

        let card = $('<div>', {'class': 'airport-card'});
        card.data('airport-id', airport._id);
        if (showCodes) {
            card.append(buildCodes(airport));
        }
        card.append(AirportsListView.buildAirportName(airport));
        card.append(AirportsListView.buildAirportLocation(airport));
        if (showPosition) {
            card.append(buildPosition(airport));
        }

        if (clickHandler) {
            card.on('click', function(e) {
                var card = $(this);
                card.stop()
                    .css('backgroundColor', '#fff')
                    .animate({backgroundColor: '#eee'}, 500);
                clickHandler(card.data('airport-id'));
                e.preventDefault();
            }).css('cursor', 'pointer');
        }

        return card;
    }

    /**
     * Builds a list in HTML format for the given airports.
     * @public
     * @method AirportsListView#buildList
     */
    buildList(airports, container, opts) {
        let ol = $('<ol>');
        let li = $('<li>');
        let olAirports = $('<ol>');
        olAirports = olAirports.append($('li'));
        olAirports = olAirports.append($('ol'));
        airports.forEach((airport) => {
            olAirports.append($('<li>').append(
                AirportsListView.createCard(airport, opts)
            ));
        });
        li.append(olAirports);
        ol.append(li);
        container.append(ol);
    }

}
