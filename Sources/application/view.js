/**
 * @file view.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import MapView from './view.map';

import StatisticsListView from './view.list.statistics';
import AirportsListView from './view.list.airports';
import FlightsListView from './view.list.flights';

import ViewUtils from './view.utils';

import { Logger } from './util.logger';

var $ = require('jquery');

var numeral = require('numbro');
var i18n = require('i18next-client');

/**
 * @class View
 */
export default class View {
    constructor(continents, countries, mapView) {
        this.logger = new Logger();

        this.continents = continents;
        this.countries = countries;

        this.mapView = mapView;

        this.menu = null;
        this.menupaneContent = null;

        this.toolpaneContent = null;

        this.listpaneContent = null;
        this.listpaneContentSelected = null;

        this.buttonForStatistics = null;
        this.buttonForAirportsList = null;
        this.buttonForFlightsList = null;

        this.listViewStatistics = null;
        this.listViewAirports = null;
        this.listViewFlights = null;

        this.eventHandlers = {};

        this.model = null;

        this.filter = {};
    }
    /**
     * Injects a logger. Usually this method is called by an injector class.
     * Because a logger is optional it is not injected via constructor.
     * @public
     * @method View#setLogger
     * @param {Logger} logger
     */
    setLogger(logger) {
        this.logger = logger;
    }

    // EVENTS

    addEventHandler(event, callback) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push({callback});
    }
    sendEvent(event, args = []) {
        if (event && this.eventHandlers[event]) {
            let eventHandlers = this.eventHandlers[event];
            for (let eventHandler of eventHandlers) {
                eventHandler.callback.apply(args);
            }
        }
    }

    // TITLE

    static title(title) {
        $(document).attr('title', i18n.t('app.title'));
    }

    // LAYOUT

    static layout() {
        let listContent = $('<table>', {
            'html':
                $('<tr>', {
                    'html':
                        $('<td>', {
                            'id': 'toolpane',
                            'html':
                                $('<div>', {
                                    'id': 'toolpane-content'
                                })
                        })
                }).add(
                $('<tr>', {
                    'html':
                        $('<td>', {
                            'id': 'listpane',
                            'html':
                                $('<div>', {
                                    'id': 'listpane-content'
                                })
                        })
                }))
        });

        $('<table>', {
            'id': 'view',
            'class': 'map list',
            'html':
            $('<tr>', {
                'html':
                $('<th>', {
                    'id': 'list-header',
                    'class': 'header',
                    'html':
                        $('<div>', {
                            'class': 'left',
                        }).add(
                        $('<div>', {
                            'class': 'right',
                        }))
                }).add(
                $('<th>', {
                    'id': 'map-header',
                    'class': 'header',
                    'html':
                        $('<div>', {
                            'class': 'left',
                        }).add(
                        $('<div>', {
                            'class': 'center',
                        })).add(
                        $('<div>', {
                            'class': 'right',
                        }))
                }))
            }).add(
            $('<tr>', {
                'html':
                $('<td>', {
                    'id': 'list-content',
                    'html': listContent
                }).add(
                $('<td>', {
                    'id': 'map-content',
                    'html':
                        $('<div>', {
                            'id': 'map',
                        })
                }))
            }))
        }).appendTo('body');

        $('<table>', {
            'id': 'menu',
            'html':
            $('<tr>', {
                'html':
                $('<th>', {
                    'id': 'menu-header',
                    'class': 'header',
                    'html':
                        $('<div>', {
                            'class': 'left',
                        }).add(
                        $('<div>', {
                            'class': 'right',
                        }))
                })
            }).add(
            $('<tr>', {
                'html':
                $('<td>', {
                    'id': 'menupane',
                    'html':
                        $('<div>', {
                            'id': 'menupane-content'
                        }),
                })
            }))
        }).appendTo('body');
    }

    // BUILDER

    static addButton(id, container, onclick) {
        let button = $('<button>', {
            'id': id,
            'title': i18n.t('ui.' + id),
        });
        container.append(button);
        if (typeof(onclick) === 'function') {
            button.fastClick(onclick);
        }
        return button;
    }

    // MENU

    createMenu(defaults) {
        this.menu = $('#menu');
        this.menupaneContent = $('#menupane-content');

        // settings
        let divSettings = $('<div>', {'id': 'settings'});
        divSettings.append(ViewUtils.h1('', 'ui.settings'));
        divSettings.append($('<div>', {'id': 'settings-ol_layer_switcher'}));
        this.menupaneContent.append(divSettings);

        // licences
        let divLicences = $('<div>', {'id': 'license'});
        divLicences.append(ViewUtils.h1('', 'ui.licenses'));
        divLicences.append(defaults.licenses);
        this.menupaneContent.append(divLicences);
    }

    showMenu() {
        this.menu.animate({marginLeft: '-320px'}, 300);
    }
    hideMenu() {
        this.menu.animate({marginLeft: '0px'}, 300);
    }

    // TOOLPANE

    static buildFilterSelect(options, onChange) {
        let select = $(document.createElement('select'));
        options.forEach((option) => {
            let text = ViewUtils.translateString(option);
            select.append(`<option value="${option}">${text}</option>`);
        });
        select.change(onChange);
        return select;
    }

    // LISTPANE

    // HELP

    showListHelp(key) {
        $('#list-content').addModalBlock({
            message: i18n.t(key),
            onclick: this.hideListHelp.bind(this),
        });
    }

    hideListHelp() {
        $('#list-content').removeModalBlock();
    }

    selectListButton(button) {
        this.buttonForStatistics.removeClass('selected');
        this.buttonForAirportsList.removeClass('selected');
        this.buttonForFlightsList.removeClass('selected');
        button.addClass('selected');
        this.listpaneContentSelected = button;
    }

    clearListPane() {
        this.listpaneContent.empty();
    }

    listStatistics() {
        this.hideListHelp();
        this.clearListPane();
        if (this.model) {
            this.listViewStatistics.buildList(this.model, this.listpaneContent, {
                'flightClickHandler': this.showFlightById.bind(this, true),
                'airportClickHandler': this.showAirportById.bind(this, true, 4),
            });
        }
        this.selectListButton(this.buttonForStatistics);
    }

    listAirports() {
        this.hideListHelp();
        this.clearListPane();
        if (this.model) {
            this.listViewAirports.buildList(this.model.airports, this.listpaneContent, {
                'showCodes': true,
                'airportClickHandler': this.showAirportById.bind(this, true, 4),
            });
        }
        this.selectListButton(this.buttonForAirportsList);
    }

    listFlights() {
        this.hideListHelp();
        this.clearListPane();
        if (this.model) {
            this.listViewFlights.buildList(this.model.trips, this.listpaneContent, {
                'showAirports': true,
                'showDistance': true,
                'flightClickHandler': this.showFlightById.bind(this, true),
            });
        }
        this.selectListButton(this.buttonForFlightsList);
    }

    //

    create(defaults) {
        this.createMenu(defaults);
        this.toolpaneContent = $('#toolpane-content');
        this.listpaneContent = $('#listpane-content');

        this.mapView.build('map',
            {
                airportPopupTitle: i18n.t('map.popup-airport-title'),
                airportPopupBuilder: (airport) => {
                    return AirportsListView.createCard(airport, {
                        'showPosition': true
                    })[0].outerHTML;
                },
            },
            {
                defaults: defaults.map,
                openLayers: {
                    layerSwitcherElement: $('#settings-ol_layer_switcher')[0],
                },
            }
        );

        this.listViewStatistics = new StatisticsListView(this, this.continents, this.countries);
        this.listViewAirports = new AirportsListView(this);
        this.listViewFlights = new FlightsListView(this);

        this.buttonForStatistics = View.addButton('list-statistics',
            $('#list-header .left'),
            this.listStatistics.bind(this)
        );
        this.buttonForFlightsList = View.addButton('list-flights',
            $('#list-header .left'),
            this.listFlights.bind(this)
        );
        this.buttonForAirportsList = View.addButton('list-airports',
            $('#list-header .left'),
            this.listAirports.bind(this)
        );

        View.addButton('toggle-map',
            $('#list-header .right'),
            () => {$('#view').toggleClass('map');}
        );

        View.addButton('toggle-list',
            $('#map-header .left'),
            () => {$('#view').toggleClass('list');}
        );

        View.addButton('map-home',
            $('#map-header .center'),
            this.sendEvent.bind(this, 'home_pressed')
        );
        View.addButton('map-zoom-in',
            $('#map-header .center'),
            this.mapView.zoomIn.bind(this.mapView)
        );
        View.addButton('map-zoom-out',
            $('#map-header .center'),
            this.mapView.zoomOut.bind(this.mapView)
        );
        View.addButton('map-zoom-min',
            $('#map-header .center'),
            this.mapView.zoomMin.bind(this.mapView)
        );

        View.addButton('show-menu',
            $('#map-header .right'),
            this.showMenu.bind(this)
        );
        View.addButton('hide-menu',
            $('#menu-header .left'),
            this.hideMenu.bind(this)
        );

        this.listStatistics();

        this.sendEvent('init_done');
    }

    // PUBLIC CLASS API

    init(defaults) {
        this.logger.info('View', 'Initialize');

        View.title();
        View.layout();

        setTimeout(this.create.bind(this, defaults), 500);
    }

    subscribe(event, callback) {
        this.addEventHandler(event, callback);
        return this;
    }

    block() {
        $.showModal();
    }
    unblock() {
        $.hideModal({delay: 500, fadeout: 2000});
    }

    showAirport(highlight, zoom, airport) {
        this.mapView.clearHighlighting();
        if (highlight) {
            this.mapView.highlightAirport(airport);
        }
        this.mapView.focusAirport(airport, zoom);
    }
    showAirportById(highlight, zoom, airportId) {
        let airport = this.model.getAirportById(airportId);
        this.showAirport(highlight, zoom, airport);
    }

    showFlight(highlight, flight) {
        this.mapView.clearHighlighting();
        if (highlight) {
            this.mapView.highlightFlight(flight);
        }
        this.mapView.focusFlight(flight);
    }
    showFlightById(highlight, flightId) {
        let flight = this.model.getFlightById(flightId);
        this.showFlight(highlight, flight);
    }

    hideTools() {
        this.toolpaneContent.hide();
    }
    showTools() {
        this.toolpaneContent.show();
    }

    update(theModel) {
        this.model = theModel;

        if (this.listpaneContentSelected === this.buttonForStatistics) {
            this.listStatistics();
        }
        else if (this.listpaneContentSelected === this.buttonForAirportsList) {
            this.listAirports();
        }
        else if (this.listpaneContentSelected === this.buttonForFlightsList) {
            this.listFlights();
        }

        this.mapView.showTrips(this.model.trips);
    }

    addFilter(name, options, config) {
        if (!this.filter[name]) {
            if (config && config.off) {
                options.unshift(config.off);
            }
            let select = View.buildFilterSelect(options, this.sendEvent.bind(this, 'filter_changed'));
            this.toolpaneContent.append(select);
            this.filter[name] = {
                select: select,
                off: config ? config.off : null,
            };
        }
    }
    getFilterValue(name) {
        if (this.filter[name]) {
            let select = this.filter[name].select;
            let text = select.find(':selected').val();
            if (text !== this.filter[name].off) {
                return text;
            }
        }
        return null;
    }
}
