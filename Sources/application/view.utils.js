/**
 * @file view.utils.js
 * @author Michael Baumgärtner
 * @license MIT
 */

var $ = require('jquery');

var numeral = require('numbro');
var moment = require('moment');
var i18n = require('i18next-client');

/**
 * @class ViewUtils
 */
export default class ViewUtils {

    // HELPER

    static translateString(string, opts = null) {
        if (typeof(string) === 'string' && string.lastIndexOf('ui.', 0) === 0) {
            return i18n.t(string, opts);
        }
        return string;
    }

    // BUILDER

    static span(cssclass, text, opts) {
        var s = $('<span>', {
            'class': cssclass,
            'html': ViewUtils.translateString(text, opts),
        });
        return s;
    }

    static div(cssclass, text, opts) {
        var d = $('<div>', {
            'class': ['one', cssclass].join(' '),
            'html': ViewUtils.translateString(text, opts),
        });
        return d;
    }

    static div2(cssclass, text1, text2, opts) {
        var d = $('<div>', {
            'class': ['two', cssclass].join(' '),
        }).append($('<p>', {
            'class': 'left',
            'html': ViewUtils.translateString(text1, opts),
        })).append($('<p>', {
            'class': 'right',
            'html': ViewUtils.translateString(text2, opts),
        }));
        return d;
    }

    static table(cssclass, keys, valueFunctions) {
        var t = $('<table>', {'class': cssclass});
        var row = 0;
        keys.forEach((key) => {
            var tr = $('<tr>');
            tr.append($('<td>').append(numeral(row + 1).format('0')));
            valueFunctions.forEach((valueFunction) => {
                var td = $('<td>');
                td.append(valueFunction(key));
                tr.append(td);
            });
            t.append(tr);
            row = row + 1;
        });
        return t;
    }

    static h1(cssclass, title, opts) {
        var h = $('<h1>', {
            'class': cssclass,
            'html': ViewUtils.translateString(title, opts),
        });
        return h;
    }

    // FORMATTER

    /**
     * Formats the given distance in feet to a string
     * containing the value in metres with a unit.
     * @static
     * @public
     * @method ViewUtils#formatDistanceInFeet
     */
    static formatDistanceInFeet(feet) {
        // convert feet into metres and format as string
        return numeral(feet / 3.2808).format('0') + ' m';
    }

    /**
     * Formats the given number of decimal degrees to a string
     * combined of degrees, minutes, seconds and the proper sign.
     * @static
     * @public
     * @method ViewUtils#formatDegrees
     */
    static formatDegrees(decimal, signs = '+-') {
        const sign = signs.charAt((decimal >= 0) ? 0 : 1);
        decimal = Math.abs(Math.round(decimal * 1000000));
        const degrees = Math.floor(decimal / 1000000);
        decimal = decimal % 1000000 / 1000000;
        const minutes = Math.floor(decimal * 60);
        const seconds = (decimal - minutes / 60) * 3600;
        return `${sign} ${degrees}° ${minutes}′ ${seconds.toFixed(1)}″`;
    }

    /**
     * Formats the given number of decimal degrees for longitude
     * to a string with the proper prefix.
     * @static
     * @public
     * @method ViewUtils#formatLatitudeDegrees
     */
    static formatLongitudeDegrees(decimal) {
        return ViewUtils.formatDegrees(decimal, 'EW');
    }

    /**
     * Formats the given number of decimal degrees for latitude
     * to a string with the proper prefix.
     * @static
     * @public
     * @method ViewUtils#formatLatitudeDegrees
     */
    static formatLatitudeDegrees(decimal) {
        return ViewUtils.formatDegrees(decimal, 'NS');
    }

}
