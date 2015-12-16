/*!
 * __NAME__ - __DESCRIPTION__
 * @version __VERSION__
 * @link __HOMEPAGE__
 * @license __LICENSE__
 */

import ApplicationScope from './application/application.scope';
import ApplicationRunner from './application/application.runner';
import ApplicationInjector from './application/application.injector';

import { LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR } from './application/util.logger';

const $ = require('jquery');
require('jquery-ui/effect');

require('./application/ui.modal');
require('./application/ui.fastclick');
require('./application/ui.nobounce');

var URI = require('urijs');

$(document).ready(() => {
    'use strict';

    const uri = new URI();

    const options = {
        logLevel: LOG_INFO,
        countriesServiceResource: $('body').data('countries-uri'),
        regionsServiceResource: $('body').data('regions-uri'),
        airportsServiceResource: $('body').data('airports-uri'),
        tripsServiceResource: $('body').data('trips-uri'),
    };

    const applicationScope = new ApplicationScope(uri, options);

    const applicationInjector = new ApplicationInjector();
    const applicationRunner = applicationInjector.injectApplicationRunner(applicationScope);

    applicationRunner.init(() => {
        applicationRunner.start(() => {});
    });
});

