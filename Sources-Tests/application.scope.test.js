import ApplicationScope from '../Sources/application/application.scope';

import { LOG_ERROR } from '../Sources/application/util.logger';

var URI = require('URIjs');

export default new ApplicationScope(
    new URI('http://localhost/'),
    {
        logLevel: LOG_ERROR,
        countriesServiceResource: '/base/Sources/application/countries',
        regionsServiceResource: '/base/Sources/application/regions',
        airportsServiceResource: '/base/Sources/application/airports',
        tripsServiceResource: '/base/Sources-Tests/trips.test',
    }
);
