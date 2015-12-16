/**
 * @file view.list.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import ViewUtils from './view.utils';

var $ = require('jquery');

var i18n = require('i18next-client');

/**
 * Base class for all list views.
 * @class ListView
 */
export default class ListView {
    constructor(superview) {
        this.superview = superview;
    }

    // BUILDER

    /**
     * Constructs a HTML div with the given text.
     * @public
     * @method ListView#listItemDiv
     */
    listItemDiv(text, opts = {}) {
        var css = (opts && opts.class ? opts.class : null);
        var help = (opts && opts.help ? opts.help : null);
        var d = ViewUtils.div(css, text, opts);
        if (help) {
            this.addHelp(help, d);
        }
        return d;
    }

    /**
     * Constructs a HTML list item with the given text.
     * @public
     * @method ListView#listItem
     */
    listItem(text, opts) {
        return $('<li>').append(this.listItemDiv(text, opts));
    }

    /**
     * Constructs a HTML list item with both of the given texts.
     * @public
     * @method ListView#listItem2
     */
    listItem2(text1, opts1, text2, opts2) {
        return $('<li>').append(this.listItemDiv(text1, opts1)).append(this.listItemDiv(text2, opts2));
    }

    /**
     * Constructs a HTML div with the given key and value.
     * @public
     * @method ListView#listKeyValueDiv
     */
    listKeyValueDiv(key, value, opts) {
        var css = (opts && opts.class ? opts.class : null);
        var help = (opts && opts.help ? opts.help : null);
        var d = ViewUtils.div2(css, key, value, opts);
        if (help) {
            this.addHelp(help, d);
        }
        return d;
    }

    /**
     * Constructs a HTML list item with the key and value.
     * @public
     * @method ListView#listKeyValue
     */
    listKeyValue(key, value, opts) {
        return $('<li>').append(this.listKeyValueDiv(key, value, opts));
    }

    // HELP

    addHelp(key, container) {
        let a = $('<a>', {'class': 'help'});
        a.fastClick(this.superview.showListHelp.bind(this.superview, key));
        container.append(a);
        return a;
    }

}
