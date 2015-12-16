/**
 * @file view.map.openlayers.js
 * @author Michael Baumgärtner
 * @license MIT
 */

/* global OpenLayers, google */

/**
 * Map module extension for Open Layer map.
 * @module OpenLayersMap
 */

import geo from './geo';

export var OLPopup = OpenLayers.Class(OpenLayers.Popup, {

    autoSize: true, panMapIfOutOfView: true, overflow: 'auto',

    /**
     * Initializes the popup with popver HTML.
     */
    initialize: function(id, lonlat, contentHTML, title, closeCallback) {
        let popoverHTML = [
            '<div id="' + id + '_innerDiv" class="popover top">',
                '<div class="arrow"></div>',
                '<h3 class="popover-title">',
                    '<button id="' + id + '_close" class="close">',
                        '&times;',
                    '</button>',
                    '<span>' + title + '</span>',
                    '<div class="clearfix"></div>',
                '</h3>',
                '<div class="popover-content">',
                    contentHTML,
                '</div>',
            '</div>',
        ].join('');

        let args = [
            id, lonlat, null, popoverHTML, false
        ];
        OpenLayers.Popup.prototype.initialize.apply(this, args);

        this.closeCallback = closeCallback;

        this.setBackgroundColor('transparent');
    },

    /**
     * Destroys the popup.
     */
    destroy: function() {
        OpenLayers.Popup.prototype.destroy.apply(this);

        if (this.closeButton) {
            OpenLayers.Event.stopObservingElement(this.closeButton);
            this.closeButton = null;
        }
    },

    /**
     * Draws the popup with popver HTML. Places the popup centered above
     * the given position.
     */
    draw: function(px) {
        let div = OpenLayers.Popup.prototype.draw.apply(this, arguments);

        if (!px) {
            if (this.lonlat && this.map) {
                px = this.map.getLayerPxFromLonLat(this.lonlat);
            }
        }
        this.moveTo(px);

        // add a touch/click handler to the close button

        let popup = this;
        setTimeout(function() {
            // decouple to let the browser update its dom
            popup.closeButton = OpenLayers.Util.getElement(
                    popup.id + '_close'
                );
            let close = popup.closeCallback || function(e) {
                popup.hide();
                OpenLayers.Event.stop(e);
            };
            OpenLayers.Event.observe(popup.closeButton, 'touchend',
                OpenLayers.Function.bindAsEventListener(close, popup));
            OpenLayers.Event.observe(popup.closeButton, 'click',
                OpenLayers.Function.bindAsEventListener(close, popup));
        }, 100);

        return div;
    },

    moveTo: function(px) {
        if (px && this.div && this.size) {
            this.div.style.left = (px.x - this.size.w / 2) + 'px';
            this.div.style.top = (px.y - this.size.h + 2) + 'px';
        }
    },

    CLASS_NAME: 'OLPopup'
});

export var OLMap = OpenLayers.Class(OpenLayers.Map, {

    /**
     * Returns a OL lonlat object for the given coordinates
     * transformed from EPSG:4326 to the map's projection (EPSG:900913).
     */
    olLonLat: function(longitude, latitude) {
        let olLonLat = new OpenLayers.LonLat(longitude, latitude);
        olLonLat.transform(new OpenLayers.Projection('EPSG:4326'), this.getProjectionObject());
        return olLonLat;
    },

    /**
     * Returns a OL geometry point object for the given coordinates
     * transformed from EPSG:4326 to the map's projection (EPSG:900913).
     */
    olPoint: function(longitude, latitude) {
        let olLonLat = this.olLonLat(longitude, latitude);
        let olPoint = new OpenLayers.Geometry.Point(olLonLat.lon, olLonLat.lat);
        return olPoint;
    },

    /**
     * Initializes the map.
     */
    initialize: function(container, options) {
        this.defaults = options.defaults;

        let opts = OpenLayers.Util.extend({
            controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.Attribution(),
            ],
            projection: 'EPSG:900913',
            displayProjection: 'EPSG:4326',
        }, options.openLayers);
        let args = [
            container, opts
        ];
        OpenLayers.Map.prototype.initialize.apply(this, args);

        if (opts && opts.hasOwnProperty('layerSwitcherElement')) {
            this.addControl(
                new OpenLayers.Control.LayerSwitcher({
                    'div': opts.layerSwitcherElement,
                })
            );
        }

        // add layers
        this.addBaseLayers();
        this.addAirportsLayer();
        this.addFlightsLayer();
        this.addHighlightingLayer();

        this.airportsOnMap = {};
        this.flightsOnMap = {};
    },

    /**
     * Adds base layers to map.
     */
    addBaseLayers: function() {
        if (this.defaults.layers.OSM) {
            this.addLayer(
                new OpenLayers.Layer.OSM(
                    'OSM', null, {wrapDateLine: false}
                )
            );
        }
        if (this.defaults.layers.MapQuest) {
            this.addLayer(
                new OpenLayers.Layer.MapQuestMap()
            );
        }
        if (this.defaults.layers.MapQuestSat) {
            this.addLayer(
                new OpenLayers.Layer.MapQuestSatMap()
            );
        }
        if (this.defaults.layers.ThunderforestLandscape) {
            this.addLayer(
                new OpenLayers.Layer.ThunderforestLandscapeMap()
            );
        }
        if (this.defaults.layers.ThunderforestTransport) {
            this.addLayer(
                new OpenLayers.Layer.ThunderforestTransportMap()
            );
        }
        if (this.defaults.layers.Google) {
            this.addLayer(
                new OpenLayers.Layer.GoogleMap()
            );
        }
        if (this.defaults.layers.GoogleTer) {
            this.addLayer(
                new OpenLayers.Layer.GoogleTerMap()
            );
        }
        if (this.defaults.layers.GoogleSat) {
            this.addLayer(
                new OpenLayers.Layer.GoogleSatMap()
            );
        }
    },

    /**
     * Returns the size of airport icon for a given zoom level.
     */
    airportIconSize: function(feature) {
        let map = feature.layer.map;
        let s = map.defaults.sizeOfAirportsIcon;
        let z = map.zoom;
        return Math.pow(1.08, z) * s;
    },
    /**
     * Adds a layer for airports to the map.
     */
    addAirportsLayer: function() {
        let airportsStyle = new OpenLayers.StyleMap(
            new OpenLayers.Style({
                    externalGraphic: 'assets/images/ui_marker_airports.svg',
                    graphicWidth: '${size}',
                    graphicHeight: '${size}',
                },
                {
                    context: {
                        size: this.airportIconSize,
                    }
                }
            )
        );
        this.airportsVectorLayer = new OpenLayers.Layer.Vector('Airports', {
            styleMap: airportsStyle,
            displayInLayerSwitcher: false,
        });
        this.airportsSelectControl = new OpenLayers.Control.SelectFeature(
            this.airportsVectorLayer,
            {
                onSelect: this.onAirportSelect,
                onUnselect: this.onAirportUnselect
            }
        );
        this.addLayer(this.airportsVectorLayer);
        this.addControl(this.airportsSelectControl);
        this.airportsSelectControl.activate();
    },
    /**
     * Displays a popup when an airport gets selected.
     */
    onAirportSelect: function(feature) {
        let map = feature.layer.map;

        let airport = feature.attributes.airport;
        if (airport) {

            let builder = map.airportPopupBuilder;
            if (builder) {
                let html = builder(airport);

                if (feature.popup) {
                    map.removePopup(feature.popup);
                    feature.popup.destroy();
                    feature.popup = null;
                }

                let title = map.airportPopupTitle;
                feature.popup = new OLPopup('airport-popup',
                    OpenLayers.LonLat.fromString(
                        feature.geometry.toShortString()
                    ),
                    html,
                    title,
                    function() {
                        map.removePopup(feature.popup);
                        feature.popup.destroy();
                        feature.popup = null;
                    }
                );

                map.addPopup(feature.popup);
                feature.popup.show();
            }
        }
    },
    /**
     * Hides a popup when an airport gets unselected.
     */
    onAirportUnselect: function(feature) {
        let map = feature.layer.map;

        if (feature.popup) {
            map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
        }
    },

    /**
     * Returns the width of flight line for a given zoom level.
     */
    flightLineWidth: function(feature) {
        let map = feature.layer.map;

        let w = map.defaults.widthOfFlightsLine;
        let z = map.zoom;
        return Math.pow(1.08, z) * w;
    },
    /**
     * Adds a layer for flights to the map.
     */
    addFlightsLayer: function() {
        let flightsStyle = new OpenLayers.StyleMap(
            new OpenLayers.Style({
                    strokeWidth: '${width}',
                    strokeOpacity: 1,
                    strokeColor: this.defaults.colors.flights,
                    strokeDashstyle: '${strokeDashstyle}',
                },
                {
                    context: {
                        width: this.flightLineWidth,
                    }
                }
            )
        );
        this.flightsVectorLayer = new OpenLayers.Layer.Vector('Flights', {
            styleMap: flightsStyle,
            displayInLayerSwitcher: false,
        });
        this.addLayer(this.flightsVectorLayer);
    },

    /**
     * Adds layer for highlighting to map.
     */
    addHighlightingLayer: function() {
        let highlightStyle = new OpenLayers.StyleMap(
            new OpenLayers.Style({
                    strokeWidth: '${width}',
                    strokeOpacity: 1,
                    strokeColor: this.defaults.colors.highlight,
                    strokeDashstyle: '${strokeDashstyle}',
                    externalGraphic: 'assets/images/ui_marker_airports.svg',
                    graphicWidth: '${size}',
                    graphicHeight: '${size}',
                },
                {
                    context: {
                        width: this.flightLineWidth,
                        size: this.airportIconSize,
                    }
                }
            )
        );
        this.highlight = new OpenLayers.Layer.Vector('Highlight', {
            styleMap: highlightStyle,
            displayInLayerSwitcher: false,
        });
        this.addLayer(this.highlight);

        this.events.register('click', this, function(e) {
            this.clearHighlighting();
        });
    },

    /**
     * Adds feature for an airport to the given layer.
     */
    addAirportToLayer: function(airport, layer) {
        let olPoint = this.olPoint(airport.longitude, airport.latitude);
        let olFeatures = [];
        olFeatures.push(
            new OpenLayers.Feature.Vector(olPoint, {airport: airport})
        );
        layer.addFeatures(olFeatures);
        return olFeatures;
    },
    /**
     * Adds feature for a flight to the given layer.
     */
    addFlightToLayer: function(flight, layer) {
        let map = this;
        function linesForFlight(flight) {
            let orig = flight.origination;
            let dest = flight.destination;
            // get points for orthodrome between origin and destination
            let segments = geo.orthodrome(
                orig.longitude, orig.latitude, dest.longitude, dest.latitude
            );
            // convert points into open layers lines
            let olLines = [];
            for (let segment of segments) {
                let olPoints = [];
                for (let point of segment) {
                    let olPoint = map.olPoint(point.x, point.y);
                    olPoints.push(olPoint);
                }
                olLines.push(new OpenLayers.Geometry.LineString(olPoints));
            }
            return olLines;
        }
        let lines = linesForFlight(flight);
        let olFeatures = [];
        for (let i = 0; i < lines.length; i += 1) {
            olFeatures[i] = new OpenLayers.Feature.Vector(
                lines[i],
                {
                    strokeDashstyle:
                        flight.date.isAfter() ? 'dash' : 'solid'
                }
            );
        }
        layer.addFeatures(olFeatures);
        return olFeatures;
    },

    /**
     * Removes all airports from the map.
     */
    removeAirports: function() {
        this.airportsOnMap = {};
        this.airportsSelectControl.unselectAll();
        this.airportsVectorLayer.removeAllFeatures();
    },
    /**
     * Adds the given airport to the map. The same airport will only be
     * added once to the map. Counts the number of calls for each
     * airport.
     */
    addAirport: function(airport) {
        let key = airport.iata + airport.icao;
        if (!this.airportsOnMap[key]) {
            let layer = this.airportsVectorLayer;
            let olFeatures = this.addAirportToLayer(airport, layer);

            this.airportsOnMap[key] = {
                'airport': airport,
                'count': 1,
                'ol_features': olFeatures,
            };
        }
        else {
            this.airportsOnMap[key].count += 1;
        }
    },
    /**
     * Focuses the given airport.
     */
    focusAirport: function(airport, zoom) {
        let olLonLat = this.olLonLat(airport.longitude, airport.latitude);
        this.setCenter(olLonLat, zoom ? zoom : this.zoom);
    },

    /**
     * Highlights the given airport.
     */
    highlightAirport: function(airport) {
        this.clearHighlighting();
        this.addAirportToLayer(airport, this.highlight);
        this.airportsVectorLayer.setOpacity(0.2);
        this.flightsVectorLayer.setOpacity(0.3);
    },

    /**
     * Removes all flights from the map.
     */
    removeFlights: function() {
        this.flightsOnMap = {};
        this.flightsVectorLayer.removeAllFeatures();
    },
    /**
     * Adds the given flight to the map. The same flight route will only
     * be added once to the map. Counts the number of calls for each
     * flight route. Does not add the flights airports to the map.
     */
    addFlight: function(flight) {
        let route = flight.route;
        if (!this.flightsOnMap[route]) {
            let layer = this.flightsVectorLayer;
            let olFeatures = this.addFlightToLayer(flight, layer);

            this.flightsOnMap[route] = {
                'flight': flight,
                'count': 1,
                'ol_features': olFeatures,
            };
        }
        else {
            this.flightsOnMap[route].count += 1;
        }
    },
    /**
     * Focuses the given flight.
     */
    focusFlight: function(flight) {
        let origination = flight.origination;
        let destination = flight.destination;
        let bounds = new OpenLayers.Bounds();
        bounds.extend(this.olPoint(origination.longitude, origination.latitude));
        bounds.extend(this.olPoint(destination.longitude, destination.latitude));
        this.zoomToExtent(bounds);
    },

    /**
     * Highlights the given flight.
     */
    highlightFlight: function(flight) {
        this.clearHighlighting();
        this.addFlightToLayer(flight, this.highlight);
        this.addAirportToLayer(flight.origination, this.highlight);
        this.addAirportToLayer(flight.destination, this.highlight);
        this.airportsVectorLayer.setOpacity(0.2);
        this.flightsVectorLayer.setOpacity(0.3);
    },

    /**
     * Clears all highlighted features.
     */
    clearHighlighting: function() {
        this.highlight.removeAllFeatures();
        this.airportsVectorLayer.setOpacity(1);
        this.flightsVectorLayer.setOpacity(1);
    },

    CLASS_NAME: 'OLMap'
});

(function() {
    /* Thunderforest http://www.thunderforest.com */

    let MapQuestAttribution = [
        'Data, imagery and map information provided by',
        ' ',
        '<a href="http://www.mapquest.com/" target="_blank">MapQuest</a>,',
        ' ',
        '<a href="http://www.openstreetmap.org/copyright" target="_blank">',
            'Open Street Map contributors',
        '</a>,',
        ' ',
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">',
            'CC-BY-SA',
        '</a>'
    ].join('');

    let ThunderforestAttribution = [
        'Maps © <a href="http://www.thunderforest.com/" target="_blank">',
            'Thunderforest',
        '</a>,',
        ' ',
        'Data © <a href="http://www.openstreetmap.org/copyright" target="_blank">',
            'OpenStreetMap contributors',
        '</a>',
    ].join('');

    if (typeof OpenLayers.Layer.ThunderforestLandscapeMap === 'undefined') {
        OpenLayers.Layer.ThunderforestLandscapeMap = OpenLayers.Class(
          OpenLayers.Layer.XYZ, {
            initialize: function(opts) {
                let path = '/landscape/${z}/${x}/${y}.png';
                let urls = [
                    'http://a.tile.thunderforest.com' + path,
                    'http://b.tile.thunderforest.com' + path,
                    'http://c.tile.thunderforest.com' + path,
                ];
                opts = OpenLayers.Util.extend({
                    attribution: ThunderforestAttribution,
                    transitionEffect: 'resize'
                }, opts);
                OpenLayers.Layer.XYZ.prototype.initialize.apply(
                    this, ['Thunderforest Landscape', urls, opts]
                );
            },
            CLASS_NAME: 'OpenLayers.Layer.ThunderforestLandscapeMap'
        });
    }

    if (typeof OpenLayers.Layer.ThunderforestTransportMap === 'undefined') {
        OpenLayers.Layer.ThunderforestTransportMap = OpenLayers.Class(
          OpenLayers.Layer.XYZ, {
            initialize: function(opts) {
                let path = '/transport/${z}/${x}/${y}.png';
                let urls = [
                    'http://a.tile.thunderforest.com' + path,
                    'http://b.tile.thunderforest.com' + path,
                    'http://c.tile.thunderforest.com' + path,
                ];
                opts = OpenLayers.Util.extend({
                    attribution: ThunderforestAttribution,
                    transitionEffect: 'resize'
                }, opts);
                OpenLayers.Layer.XYZ.prototype.initialize.apply(
                    this, ['Thunderforest Transport', urls, opts]
                );
            },
            CLASS_NAME: 'OpenLayers.Layer.ThunderforestTransportMap'
        });
    }

    /* MapQuest http://www.mapquest.com */

    if (typeof OpenLayers.Layer.MapQuestMap === 'undefined') {
        OpenLayers.Layer.MapQuestMap = OpenLayers.Class(
          OpenLayers.Layer.XYZ, {
            initialize: function(opts) {
                let path = '/tiles/1.0.0/map/${z}/${x}/${y}.png';
                let urls = [
                    'http://otile1.mqcdn.com' + path,
                    'http://otile2.mqcdn.com' + path,
                    'http://otile3.mqcdn.com' + path,
                    'http://otile4.mqcdn.com' + path,
                ];
                opts = OpenLayers.Util.extend({
                    attribution: MapQuestAttribution,
                    transitionEffect: 'resize'
                }, opts);
                OpenLayers.Layer.XYZ.prototype.initialize.apply(
                    this, ['MapQuest', urls, opts]
                );
            },
            CLASS_NAME: 'OpenLayers.Layer.MapQuestMap'
        });
    }

    if (typeof OpenLayers.Layer.MapQuestSatMap === 'undefined') {
        OpenLayers.Layer.MapQuestSatMap = OpenLayers.Class(
          OpenLayers.Layer.XYZ, {
            initialize: function(opts) {
                let path = '/tiles/1.0.0/sat/${z}/${x}/${y}.png';
                let urls = [
                    'http://otile1.mqcdn.com' + path,
                    'http://otile2.mqcdn.com' + path,
                    'http://otile3.mqcdn.com' + path,
                    'http://otile4.mqcdn.com' + path,
                ];
                opts = OpenLayers.Util.extend({
                    attribution: MapQuestAttribution,
                    'transitionEffect': 'resize'
                }, opts);
                OpenLayers.Layer.XYZ.prototype.initialize.apply(
                    this, ['MapQuest Satellite', urls, opts]
                );
            },
            CLASS_NAME: 'OpenLayers.Layer.MapQuestSatMap'
        });
    }

    /*

    Google maps base layers:

    Zooming can not be controlled, so configure map with
        zoomMethod: null,
    and configure Google maps layer with
        animationEnabled: false
    to TURN OFF zoom animation.

    Requirements:

    <script src="http://maps.google.com/maps/api/js?v=3&amp;sensor=false">
    </script>

    */

    if (typeof OpenLayers.Layer.GoogleMap === 'undefined') {
        OpenLayers.Layer.GoogleMap = OpenLayers.Class(
            OpenLayers.Layer.Google, {
                initialize: function(opts) {
                    opts = OpenLayers.Util.extend({
                        'sphericalMercator': true,
                        'animationEnabled': false
                    }, opts);
                    OpenLayers.Layer.Google.prototype.initialize.apply(
                        this, ['Google', opts]
                    );
                },
                CLASS_NAME: 'OpenLayers.Layer.GoogleMap'
            }
        );
    }

    if (typeof OpenLayers.Layer.GoogleTerMap === 'undefined') {
        OpenLayers.Layer.GoogleTerMap = OpenLayers.Class(
            OpenLayers.Layer.Google, {
                initialize: function(opts) {
                    opts = OpenLayers.Util.extend({
                        'type': google.maps.MapTypeId.TERRAIN,
                        'sphericalMercator': true,
                        'animationEnabled': false
                    }, opts);
                    OpenLayers.Layer.Google.prototype.initialize.apply(
                        this, ['Google Terrain', opts]
                    );
                },
                CLASS_NAME: 'OpenLayers.Layer.GoogleTerMap'
            }
        );
    }

    if (typeof OpenLayers.Layer.GoogleSatMap === 'undefined') {
        OpenLayers.Layer.GoogleSatMap = OpenLayers.Class(
            OpenLayers.Layer.Google, {
                initialize: function(opts) {
                    opts = OpenLayers.Util.extend({
                        'type': google.maps.MapTypeId.SATELLITE,
                        'sphericalMercator': true,
                        'animationEnabled': false
                    }, opts);
                    OpenLayers.Layer.Google.prototype.initialize.apply(
                        this, ['Google Satellite', opts]
                    );
                },
                CLASS_NAME: 'OpenLayers.Layer.GoogleSatMap'
            }
        );
    }

}());
