/**
 * @file view.map.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import { OLMap } from './view.map.openlayers';

/**
 * This class is a wrapper for the actual map implementation,
 * which is currently an OpenLayers map.
 *
 * @class MapView
 */
export default class MapView {
    constructor() {
        this.olMap = null;
    }

    /**
     * Builds an OpenLayers map in the given container element with the
     * given options.
     *
     * @public
     * @method MapView#build
     * @param {Object} container - Container element from HTML DOM.
     * @param {Object} options - Options for this map view.
     * @param {Object} mapOptions - Options for the OpenLayers map.
     */
    build(container, options, mapOptions) {
        this.olMap = new OLMap(container, mapOptions);
        this.olMap.airportPopupTitle = options.airportPopupTitle;
        this.olMap.airportPopupBuilder = options.airportPopupBuilder;

        this.selectBaseLayer('Thunderforest Landscape');
        this.zoomMin();
    }

    _addAirport(airport) {
        if (airport) {
            this.olMap.addAirport(airport);
        }
    }
    _removeAirports() {
        this.olMap.removeAirports();
    }

    _addFlight(flight) {
        if (flight) {
            if (flight.origination && flight.destination) {
                this.olMap.addFlight(flight);
            }
        }
    }
    _removeFlights() {
        this.olMap.removeFlights();
    }

    selectBaseLayer(name) {
        var layers = this.olMap.getLayersByName(name);
        if (layers && layers.length > 0) {
            this.olMap.setBaseLayer(layers[0]);
        }
    }

    updateSize() {
        this.olMap.updateSize();
    }

    zoomIn() {
        this.olMap.zoomIn();
    }
    zoomOut() {
        this.olMap.zoomOut();
    }
    zoomMin() {
        this.olMap.zoomToMaxExtent();
    }

    highlightAirport(airport) {
        if (airport) {
            if (airport.longitude && airport.latitude) {
                this.olMap.highlightAirport(airport);
            }
        }
    }

    focusAirport(airport, zoom) {
        if (airport) {
            if (airport.longitude && airport.latitude) {
                this.olMap.focusAirport(airport, zoom);
            }
        }
    }

    highlightFlight(flight) {
        if (flight) {
            if (flight.origination && flight.destination) {
                this.olMap.highlightFlight(flight);
            }
        }
    }

    focusFlight(flight) {
        if (flight) {
            if (flight.origination && flight.destination) {
                this.olMap.focusFlight(flight);
            }
        }
    }

    clearHighlighting() {
        this.olMap.clearHighlighting();
    }

    showTrips(trips) {
        this._removeAirports();
        this._removeFlights();
        trips.forEach((trip) => {
            let flights = trip.flights;
            flights.forEach((flight) => {
                this._addFlight(flight);
                this._addAirport(flight.origination);
                this._addAirport(flight.destination);
            });
        });
    }

}
