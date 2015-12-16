/**
 * @file buckets.js
 * @author Michael Baumgärtner
 * @license MIT
 */

export const LOG_DEBUG = Symbol('Logger.LOG_DEBUG');
export const LOG_INFO = Symbol('Logger.LOG_INFO');
export const LOG_WARN = Symbol('Logger.LOG_WARN');
export const LOG_ERROR = Symbol('Logger.LOG_ERROR');
export const LOG_NONE = Symbol('Logger.LOG_NONE');

/**
 * Abstract logger class.
 * @class Logger
 * @param {Symbol} level - Log level: DEBUG, INFO, WARN, ERROR.
 */
export class Logger {
    constructor(level) {
        this.level = level;
    }
    /**
     * Logs a debug message.
     * @public
     * @method Logger#info
     * @param {*} stringOrObject - String or object identifying the caller.
     * @param {...String} strings - Strings for log message.
     */
    debug(stringOrObject, ...strings) {}
    /**
     * Logs an info message.
     * @public
     * @method Logger#info
     * @param {*} stringOrObject - String or object identifying the caller.
     * @param {...String} strings - Strings for log message.
     */
    info(stringOrObject, ...strings) {}
    /**
     * Logs an warning message.
     * @public
     * @method Logger#warn
     * @param {*} stringOrObject - String or object identifying the caller.
     * @param {...String} strings - Strings for log message.
     */
    warn(stringOrObject, ...strings) {}
    /**
     * Logs an error message.
     * @public
     * @method Logger#error
     * @param {*} stringOrObject - String or object identifying the caller.
     * @param {...String} strings - Strings for log message.
     */
    error(stringOrObject, ...strings) {}
}

/**
 * Basic logger utility class. Just uses console.log for now.
 * @class BasicLogger
 */
export class BasicLogger extends Logger {
    constructor(level, outConsole) {
        super(level);

        if (outConsole && 'log' in outConsole) {
            this.outConsole = outConsole;
        }
        else {
            this.outConsole = undefined;
        }
    }

    get enabled() {
        return this.outConsole !== undefined;
    }

    /**
     * Logs a debug message.
     * @method BasicLogger#debug
     * @see Logger#debug
     */
    debug(stringOrObject, ...strings) {
        if (this.level === LOG_DEBUG) {
            this.log('debug', stringOrObject, strings);
        }
    }

    /**
     * Logs an info message.
     * @method BasicLogger#info
     * @see Logger#info
     */
    info(stringOrObject, ...strings) {
        if (this.level === LOG_DEBUG ||
            this.level === LOG_INFO) {
            this.log('info', stringOrObject, strings);
        }
    }

    /**
     * Logs an warning message.
     * @method BasicLogger#warn
     * @see Logger#warn
     */
    warn(stringOrObject, ...strings) {
        if (this.level === LOG_DEBUG ||
            this.level === LOG_INFO ||
            this.level === LOG_WARN) {
            this.log('warn', stringOrObject, strings);
        }
    }

    /**
     * Logs an error message.
     * @method BasicLogger#error
     * @see Logger#error
     */
    error(stringOrObject, ...strings) {
        if (this.level !== LOG_NONE) {
            this.log('error', stringOrObject, strings);
        }
    }

    /**
     * Logs an message.
     * @private
     * @method BasicLogger#log
     * @param {String} type - Type of log message (INFO, WARNING, ERROR)
     * @param {*} stringOrObject - String or object identifying the caller.
     * @param {...String} strings - Strings for log message.
     */
    log(type, stringOrObject, strings) {
        if (this.outConsole) {
            const first = (typeof(stringOrObject) === 'object') ?
                            stringOrObject.constructor.name : stringOrObject;
            this.outConsole[type].apply(this.outConsole, [].concat(`${first}:`, strings));
        }
    }
}
