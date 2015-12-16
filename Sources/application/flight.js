/**
 * @file flight.js
 * @author Michael Baumgärtner
 * @license MIT
 */

import geo from './geo';

var moment = require('moment');

/**
 * Flight class. Only use {@link Flights#createFlight} to instantiate a
 * new flight and ensure a unique flight id.
 * @class Flight
 * @param {Number} flightId - Identifier for this flight. MUST be unique.
 * @param {Airport} origination - Origination airport for this flight.
 * @param {Airport} destination - Destination airport for this flight.
 */
export default class Flight {
    constructor(flightId, origination, destination) {
        this._id = flightId;
        this.origination = origination;
        this.destination = destination;
        this.distance = geo.distance(
            origination.longitude, origination.latitude,
            destination.longitude, destination.latitude
        );
        // unique identifier for a specific connection between two
        // airports regardless of the direction of the flight
        const origICAO = this.origination.icao;
        const destICAO = this.destination.icao;
        if (origICAO.localeCompare(destICAO) > 0) {
            this.route = destICAO + origICAO;
        }
        else {
            this.route = origICAO + destICAO;
        }
        this.flightNumber = null;
        this.date = null;
        this.dateType = null;
        this.departureTime = null;
        this.arrivalTime = null;
    }
    /**
     * Returns a unique key per flight suitable to be used for collections
     * and more. Different objects representing the same flight return the
     * same key.
     * @public
     * @method Flight#key
     * @returns {String} Unique key per flight.
     */
    key() {
        const orig = this.origination.key();
        const dest = this.destination.key();
        return `${orig}${dest}`;
    }
    /**
     * Converts this object to a string.
     * @public
     * @method Flight#toString
     * @returns {String}
     */
    toString() {
        const id = this._id;
        const orig = this.origination.toString();
        const dest = this.destination.toString();
        return `Flight#${id}[${orig}->${dest}]`;
    }
    /**
     * Compares this flight object to another flight object.
     * Two flight objects are considered equal if the have the same id
     * (This means, if the objects are legally generated using the facory
     * method {@link Flights#createFlight}, objects representing the
     * same actual flight are considered not equal.)
     * @public
     * @method Flight#isEqualTo
     * @param {Flight} flight - Another flight object
     * @returns {Boolean}
     */
    isEqualTo(flight) {
        return this._id === flight._id;
    }

    /**
     * Flight object id.
     * @public
     * @readonly
     * @member {Number} Flight#id
     */
    get id() {
        return this._id;
    }

    /**
     * Returns the year of the date of the flight.
     * @public
     * @property {Number} Year of the date of the flight
     */
    get year() {
        if (this.date) {
            return this.date.year();
        }
        return undefined;
    }

    /**
     * Parses flight date and times from trip data.
     *
     * Date is formatted "YYYYMMDD" or "YYYYMM" or "YYYY".
     *
     * Time is formatted "HH:MM-HH:MM+1" where the first value is the time
     * of departure and the second value is the time of arrival. Time of
     * arrival can be appended with "+1" (this is optional) to indicate a
     * time on the following day.
     *
     * @public
     * @method Flight#parseDateTimes
     * @param {String} dateString - Date of the flight
     * @param {String} timeString - Time of the flight
     */
    parseDateTimes(dateString, timeString) {
        // reset date and times
        this.date = null;
        this.arrivalTime = null;
        this.departureTime = null;

        if (dateString) {
            // parse date
            let date = null;
            let dateType = null;
            if (dateString.length === 4) {
                date = moment(dateString, 'YYYY');
                dateType = 'Y';
            }
            else if (dateString.length === 6) {
                date = moment(dateString, 'YYYYMM');
                dateType = 'YM';
            }
            else if (dateString.length === 8) {
                date = moment(dateString, 'YYYYMMDD');
                dateType = 'YMD';
            }

            if (date && date.isValid()) {
                this.date = date;
                this.dateType = dateType;

                if (timeString) {
                    // parse times
                    const times = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})(\+1)?$/.exec(timeString);
                    if (times) {
                        this.departureTime = moment(this.date);
                        this.departureTime.hour((+times[1]));
                        this.departureTime.minute((+times[2]));
                        this.arrivalTime = moment(this.date);
                        this.arrivalTime.hour((+times[3]));
                        this.arrivalTime.minute((+times[4]));
                        if (times[5] === '+1') {
                            this.arrivalTime = this.arrivalTime.add(1, 'days');
                        }
                    }
                }
            }
        }
    }

    /**
     * Converts this flights date to a formatted string.
     * @public
     * @method Flight#dateToString
     * @returns {String} Date as string
     */
    dateToString() {
        if (this.date) {
            if (this.dateType === 'YMD') {
                return this.date.format('LL');
            }
            else if (this.dateType === 'YM') {
                return this.date.format('MMMM YYYY');
            }
            else if (this.dateType === 'Y') {
                return this.date.format('YYYY');
            }
        }
        return '';
    }

    /**
     * Converts this flights departure time to a formatted string.
     * @public
     * @method Flight#departureTimeToString
     * @returns {String} Departure time as string
     */
    departureTimeToString() {
        if (this.departureTime) {
            let s = this.departureTime.format('HH:mm');
            return s;
        }
        return '';
    }

    /**
     * Converts this flights arrival time to a formatted string.
     * @public
     * @method Flight#arrivalTimeToString
     * @returns {String} Arrival time as string
     */
    arrivalTimeToString() {
        if (this.arrivalTime) {
            let s = this.arrivalTime.format('HH:mm');
            // difference between flight date and day of given time
            // adds +1 if necessary
            const t = this.arrivalTime;
            const d = moment([t.year(), t.month(), t.date()]) - this.date;
            if (d === 24 * 60 * 60 * 1000) {
                s = s + '+1';
            }
            return s;
        }
        return '';
    }
}
