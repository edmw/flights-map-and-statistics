import geo from '../Sources/application/geo';

const KA_LATITUDE = 49.014;
const KA_LONGITUDE = 8.4043;

describe('Geo', () => {
    'use strict';

    var point0;
    var pointKA;
    var pointSydney;
    var pointInvalid;

    var circle1;
    var circle2;
    var circle3;
    var circleCTD1;
    var circleCTD2;

    beforeEach(() => {
        point0 = geo.createPoint(0, 0);
        pointInvalid = geo.createPoint('invalid', 'invalid');
        pointKA = geo.createPoint(KA_LONGITUDE, KA_LATITUDE);
        pointSydney = geo.createPoint(151.2, -33.85);

        // simple great circle
        circle1 = geo.createGreatCircle(
            pointKA.x, pointKA.y, // Karlsruhe, Germany
            pointSydney.x, pointSydney.y // Sydney, Australia
        );
        // great circle on meridian
        circle2 = geo.createGreatCircle(
            30.1, -1.943889, // ≈ Kigali, Rwanda
            30.1, 59.9 // ≈ St. Petersburg, Russia
        );
        // great circle for antipodes
        circle3 = geo.createGreatCircle(
            -7.5, 43.4, // ≈ A Coruña, Spain
            172.5, -43.4 // ≈ Christchurch, New Zealand
        );
        circleCTD1 = geo.createGreatCircle(
            // example from http://www.movable-type.co.uk/scripts/latlong.html (cross track distance)
            -1.7297, 53.3206, 0.1334, 53.1887
        );
        circleCTD2 = geo.createGreatCircle(
            // example from http://stackoverflow.com/questions/1051723/ (cross track distance)
            -94.127592, 41.81762, -94.087257, 41.848202
        );
    });

    // Point

    it('should create a point with valid coordinates', () => {
        expect(point0.isValidPoint()).toBeTruthy();
        expect(pointInvalid.isValidPoint()).toBeFalsy();
        expect(pointKA.x).toEqual(KA_LONGITUDE);
        expect(pointKA.y).toEqual(KA_LATITUDE);
        expect(pointKA.isValidPoint()).toBeTruthy();
        expect(pointSydney.isValidPoint()).toBeTruthy();
        let p1 = geo.createPoint('8.4043', '49.014');
        expect(p1.x).toEqual(KA_LONGITUDE);
        expect(p1.y).toEqual(KA_LATITUDE);
        expect(p1.isValidPoint()).toBeTruthy();
    });

    it('should detect a point with invalid coordinates', () => {
        let p1 = geo.createPoint('KA_LONGITUDE', KA_LATITUDE);
        expect(p1.isValidPoint()).toBeFalsy();
        let p2 = geo.createPoint(KA_LONGITUDE, 'KA_LATITUDE');
        expect(p2.isValidPoint()).toBeFalsy();
        let p3 = geo.createPoint(-190, KA_LATITUDE);
        expect(p3.isValidPoint()).toBeFalsy();
        let p4 = geo.createPoint(+190, KA_LATITUDE);
        expect(p4.isValidPoint()).toBeFalsy();
        let p5 = geo.createPoint(KA_LONGITUDE, -95);
        expect(p5.isValidPoint()).toBeFalsy();
        let p6 = geo.createPoint(KA_LONGITUDE, +95);
        expect(p6.isValidPoint()).toBeFalsy();
        let p7 = geo.createPoint(null, KA_LATITUDE);
        expect(p7.isValidPoint()).toBeFalsy();
        let p8 = geo.createPoint(KA_LONGITUDE, null);
        expect(p8.isValidPoint()).toBeFalsy();
        let p9 = geo.createPoint(NaN, KA_LATITUDE);
        expect(p9.isValidPoint()).toBeFalsy();
        let p10 = geo.createPoint(KA_LONGITUDE, NaN);
        expect(p10.isValidPoint()).toBeFalsy();
    });

    it('should calculate a bearing', () => {
        let p1 = geo.createPoint(point0.x, point0.y);
        expect(point0.bearingTo(p1)).toEqual(0);

        let pS = geo.createPoint(point0.x, point0.y + 0.01);
        expect(point0.bearingTo(pS)).toBeCloseTo(0, 5);
        let pE = geo.createPoint(point0.x + 0.01, point0.y);
        expect(point0.bearingTo(pE)).toBeCloseTo(90, 5);
        let pN = geo.createPoint(point0.x, point0.y - 0.01);
        expect(point0.bearingTo(pN)).toBeCloseTo(180, 5);
        let pW = geo.createPoint(point0.x - 0.01, point0.y);
        expect(point0.bearingTo(pW)).toBeCloseTo(270, 5);
        let pSE = geo.createPoint(point0.x + 0.01, point0.y + 0.01);
        expect(point0.bearingTo(pSE)).toBeCloseTo(45, 5);
        let pNE = geo.createPoint(point0.x + 0.01, point0.y - 0.01);
        expect(point0.bearingTo(pNE)).toBeCloseTo(135, 5);
        let pNW = geo.createPoint(point0.x - 0.01, point0.y - 0.01);
        expect(point0.bearingTo(pNW)).toBeCloseTo(225, 5);
        let pSW = geo.createPoint(point0.x - 0.01, point0.y + 0.01);
        expect(point0.bearingTo(pSW)).toBeCloseTo(315, 5);

        expect(pointKA.bearingTo(pointInvalid)).toBeNull();
        expect(pointInvalid.bearingTo(pointKA)).toBeNull();
    });

    it('should calculate a bearing between two points', () => {
        let p1 = geo.createPoint(45, 35); // ≈ Baghdad
        let p2 = geo.createPoint(135, 35); // ≈ Osaka
        expect(p1.bearingTo(p2)).toBeCloseTo(60.16);
        expect(p2.bearingTo(p1)).toBeCloseTo(360 - 60.16);
    });

    it('should calculate a distance', () => {
        expect(pointKA.distanceTo(pointInvalid)).toBeNull();
        expect(pointInvalid.distanceTo(pointKA)).toBeNull();
    });

    it('should calculate a distance between two points', () => {
        let p1 = geo.createPoint(13.408333, 52.518611);
        expect(pointKA.distanceTo(point0)).toBeCloseTo(5509.31, 1);
        expect(pointKA.distanceTo(pointSydney)).toBeCloseTo(16533.07, 1);
    });

    it('should calculate a point 5000 km south from Karlsruhe', () => {
        // distance 5000 km, bearing 175 degrees
        let p1 = pointKA.pointWithDistanceAndBearing(5000, 175);
        expect(p1.x).toBeCloseTo(11.944, 2);
        expect(p1.y).toBeCloseTo(4.149, 2);
    });

    it('should calculate a point 50 km north-east from Karlsruhe', () => {
        // distance 50 km, bearing 40 degrees
        let p1 = pointKA.pointWithDistanceAndBearing(50, 40);
        expect(p1.x).toBeCloseTo(8.847, 2);
        expect(p1.y).toBeCloseTo(49.357, 2);
    });

    it('should calculate a point 25000 km south-west from Karlsruhe', () => {
        // distance 25000 km, bearing 245 degrees
        let p1 = pointKA.pointWithDistanceAndBearing(25000, 245);
        expect(p1.x).toBeCloseTo(145.606, 2);
        expect(p1.y).toBeCloseTo(-19.872, 2);
    });

    it('should calculate a point 550 km west from Karlsruhe', () => {
        // distance 550 km, bearing 275 degrees
        let p1 = pointKA.pointWithDistanceAndBearing(550, 275);
        expect(p1.x).toBeCloseTo(0.850, 2);
        expect(p1.y).toBeCloseTo(49.199, 2);
    });

    // Great Circle

    it('should create a great circle with valid coordinates', () => {
        expect(circle1.isValidGreatCircle()).toBeTruthy();
        expect(circle1.p0.x).toEqual(KA_LONGITUDE);
        expect(circle1.p0.y).toEqual(KA_LATITUDE);
        expect(circle2.isValidGreatCircle()).toBeTruthy();
        expect(circle3.isValidGreatCircle()).toBeTruthy();
        expect(circleCTD1.isValidGreatCircle()).toBeTruthy();
        expect(circleCTD2.isValidGreatCircle()).toBeTruthy();
    });

    it('should calculate a points distance to a great circle', () => {
        let p1 = geo.createPoint(-0.7972, 53.2611);
        expect(circleCTD1.distanceToPoint(p1)).toBeCloseTo(-0.30755, 4); // ≈ 307 metres
        let p2 = geo.createPoint(-94.046875, 41.791057);
        expect(circleCTD2.distanceToPoint(p2)).toBeCloseTo(6.8415, 3); // ≈ 6.8 kilometres
    });

    function checkGreatCirclePoints(greatcircle, points, expectedNumberOfPoints) {
        expect(points.length).toEqual(expectedNumberOfPoints);
        // iterate through points and check distance to great circle and to start point
        let distanceToStart = -Infinity;
        for (let point of points) {
            expect(point.isValidPoint()).toBeTruthy();
            expect(greatcircle.distanceToPoint(point)).toBeCloseTo(0, 2);
            let d = greatcircle.p0.distanceTo(point);
            expect(d).toBeGreaterThan(distanceToStart);
            distanceToStart = d;
        }
    }

    it('should calculate the points along a great circle', () => {
        // preconditions for great circle example
        expect(circle1.p0.x).toBeLessThan(circle1.p1.x);
        expect(circle1.p1.x - circle1.p0.x).toBeLessThan(180);
        // calculate points
        let points = circle1.toPoints(
            circle1.p0.x, circle1.p1.x
        );
        // number of points should be longitude difference divided by resolution plus one
        // (resolution is fixed to π/180, plus one because of the endpoint)
        let expectedNumberOfPoints
            = Math.round(Math.abs(circle1.p1.λ - circle1.p0.λ) / (Math.PI / 180.0)) + 1;
        checkGreatCirclePoints(circle1, points, expectedNumberOfPoints);
    });

    it('should calculate the points along a meridian', () => {
        // preconditions for great circle example
        expect(circle2.p0.x).toEqual(circle2.p1.x);
        // calculate points
        let points = circle2.toPoints(
            circle2.p0.x, circle2.p1.x
        );
        // number of points should be 2
        checkGreatCirclePoints(circle2, points, 2);
    });

    it('should calculate the points for two antipodes', () => {
        // preconditions for great circle example
        expect(circle3.p0.x).toBeLessThan(circle3.p1.x);
        expect(Math.abs(circle3.p0.x - circle3.p1.x)).toEqual(180);
        expect(Math.abs(circle3.p0.y + circle3.p1.y)).toEqual(0);
        // calculate points
        let points = circle3.toPoints(
            circle3.p0.x, circle3.p1.x
        );
        // number of points should be 181
        // checkGreatCirclePoints(circle3, points, 181);
    });

    // Module functions

    it('should have a module function to create point', () => {
        let point = geo.createPoint(KA_LONGITUDE, KA_LATITUDE);
        expect(pointKA.x).toEqual(KA_LONGITUDE);
        expect(pointKA.y).toEqual(KA_LATITUDE);
        expect(pointKA.isValidPoint()).toBeTruthy();
    });

    it('should have a module function to create a great circle', () => {
        let circle = geo.createGreatCircle(
            KA_LONGITUDE, KA_LATITUDE, pointSydney.x, pointSydney.y
        );
        expect(circle.isValidGreatCircle()).toBeTruthy();
        expect(circle.p1.x).toEqual(pointSydney.x);
        expect(circle.p1.y).toEqual(pointSydney.y);
    });

    it('should have a module function to calculate a distance in km', () => {
        let d1 = geo.distance(pointKA.x, pointKA.y, 0, 0);
        expect(d1).toBeCloseTo(5509.31, 1);
        let d2 = geo.distance(pointKA.x, pointKA.y, pointSydney.x, pointSydney.y);
        expect(d2).toBeCloseTo(16533.07, 1);
    });

    function checkOrthodromeWithGreatCircle(
        greatcircle,
        expectedNumberOfSegments,
        expectedNumberOfPointsForSegment
    ) {
        let segments = geo.orthodrome(
            greatcircle.p0.x, greatcircle.p0.y, greatcircle.p1.x, greatcircle.p1.y
        );
        expect(segments.length).toEqual(expectedNumberOfSegments);
        for (let segment of segments) {
            checkGreatCirclePoints(greatcircle, segment, expectedNumberOfPointsForSegment.shift());
        }
    }

    it('should have a module function to calculate a orthodrome', () => {
        // LHR-JNB: (x0 < x1 && (x1 - x0) < 180)
        let gc1 = geo.createGreatCircle(-0.461944, 51.4705556, 28.2458333, -26.1391667);
        checkOrthodromeWithGreatCircle(gc1, 1, [30]);
        // LHR-MIA: else (Math.abs(x0 - x1) < 180)
        let gc2 = geo.createGreatCircle(-0.4616667, 51.4705556, -80.2905556, 25.7930556);
        checkOrthodromeWithGreatCircle(gc2, 1, [81]);
        // NAN-LAX: else (x0 > x1)
        let gc3 = geo.createGreatCircle(177.4427778, -17.7552778, -118.4077778, 33.9425000);
        checkOrthodromeWithGreatCircle(gc3, 2, [4, 63]);
        // LAX-HKG: else
        let gc4 = geo.createGreatCircle(-118.4077778, 33.9425000, 113.9150000, 22.3088889);
        checkOrthodromeWithGreatCircle(gc4, 2, [63, 68]);
    });

});
