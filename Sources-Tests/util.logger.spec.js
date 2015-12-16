import {
    Logger,
    BasicLogger,
    LOG_DEBUG,
    LOG_INFO,
    LOG_WARN,
    LOG_ERROR,
    LOG_NONE
} from '../Sources/application/util.logger';

class LoggerClientObject {
    constructor() {}
}

var loggerClientString = 'LoggerClientString';
var loggerClientObject = new LoggerClientObject();

describe('Logger Utilities', () => {
    'use strict';

    var logger;
    var basicLogger;

    beforeEach(() => {
        logger = new Logger(LOG_ERROR);
        basicLogger = new BasicLogger(LOG_ERROR, console);

        spyOn(console, 'error');
        spyOn(console, 'warn');
        spyOn(console, 'info');
        spyOn(console, 'debug');
    });

    // LEVELS

    it('should have symbol for log level "debug"', () => {
        expect(String(LOG_DEBUG)).toMatch(/LOG_DEBUG/);
    });
    it('should have symbol for log level "info"', () => {
        expect(String(LOG_INFO)).toMatch(/LOG_INFO/);
    });
    it('should have symbol for log level "warn"', () => {
        expect(String(LOG_WARN)).toMatch(/LOG_WARN/);
    });
    it('should have symbol for log level "error"', () => {
        expect(String(LOG_ERROR)).toMatch(/LOG_ERROR/);
    });

    // ABSTRACT LOGGER

    it('should provide an abstract logger which has a log level from constructor', () => {
        expect(logger.level).toBe(LOG_ERROR);
    });

    it('should provide an abstract logger which defines a "debug" method', () => {
        expect(logger.debug).toEqual(jasmine.any(Function));
        expect(logger.debug()).toBeUndefined();
    });
    it('should provide an abstract logger which defines a "info" method', () => {
        expect(logger.info).toEqual(jasmine.any(Function));
        expect(logger.info()).toBeUndefined();
    });
    it('should provide an abstract logger which defines a "warn" method', () => {
        expect(logger.warn).toEqual(jasmine.any(Function));
        expect(logger.warn()).toBeUndefined();
    });
    it('should provide an abstract logger which defines a "error" method', () => {
        expect(logger.error).toEqual(jasmine.any(Function));
        expect(logger.error()).toBeUndefined();
    });

    // BASIC LOGGER

    it('should provide an enabled basic logger', () => {
        expect(basicLogger.enabled).toBeTruthy();
    });

    function testLoggingForLevel(level, method, object, message, outcome) {
        // test if the given method was called or not with the given object
        // and message at the given log level

        // reset spy
        console[method].calls.reset();

        basicLogger.level = level;
        basicLogger[method].apply(basicLogger, [object, message]);

        if (outcome) {
            expect(console[method]).toHaveBeenCalled();
        }
        else {
            expect(console[method]).not.toHaveBeenCalled();
        }
    }
    function testLogging(method, object, message, debug, info, warn, error, none) {
        // test if the given method was called or not with the given object
        // and message at different levels
        testLoggingForLevel(LOG_DEBUG, method, object, message, debug);
        testLoggingForLevel(LOG_INFO, method, object, message, info);
        testLoggingForLevel(LOG_WARN, method, object, message, warn);
        testLoggingForLevel(LOG_ERROR, method, object, message, error);
        testLoggingForLevel(LOG_NONE, method, object, message, none);
    }

    it('should provide a basic logger with error logging', () => {
        testLogging('error', loggerClientObject, 'error message',
            true, true, true, true, false
        );
    });

    it('should provide a basic logger with warn logging', () => {
        testLogging('warn', loggerClientObject, 'warn message',
            true, true, true, false, false
        );
    });

    it('should provide a basic logger with info logging', () => {
        testLogging('info', loggerClientObject, 'info message',
            true, true, false, false, false
        );
    });

    it('should provide a basic logger with debug logging', () => {
        testLogging('debug', loggerClientObject, 'debug message',
            true, false, false, false, false
        );
    });

    it('should disable a basic logger without console object', () => {
        let logger = new BasicLogger(LOG_ERROR, undefined);
        expect(logger.enabled).toBeFalsy();
        logger.log('info', loggerClientString, 'message');
        logger.error(loggerClientString, 'message');
        expect(console.error).not.toHaveBeenCalledWith();
    });

    it('should disable a basic logger without log method on console object', () => {
        let logger = new BasicLogger(LOG_ERROR, {});
        expect(logger.enabled).toBeFalsy();
        logger.error(loggerClientString, 'message');
        expect(console.error).not.toHaveBeenCalledWith();
    });

    it('should log text for strings as first argument', () => {
        basicLogger.error(loggerClientString, 'message');
        expect(console.error).toHaveBeenCalledWith('LoggerClientString:', 'message');
    });

    it('should log the class name for objects as first argument', () => {
        basicLogger.error(loggerClientObject, 'message');
        expect(console.error).toHaveBeenCalledWith('LoggerClientObject:', 'message');
    });

});
