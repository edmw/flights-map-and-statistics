import { nearlyEqual, setMinimumEpsilon } from '../Sources/application/util.math';

describe('MathUtils', () => {
    'use strict';

    function nearlyEqualTest(a, b) {
        return nearlyEqual(a, b, 0.00001);
    }

    it('should test numbers for exact equality', () => {
        expect(nearlyEqual(+1, +1, null)).toBeTruthy();
        expect(nearlyEqual(+1, -1, null)).toBeFalsy();
    });

    it('should test big numbers with nearlyEqual', () => {
        expect(nearlyEqualTest(1000000, 1000001)).toBeTruthy();
        expect(nearlyEqualTest(1000001, 1000000)).toBeTruthy();
        expect(nearlyEqualTest(10000, 10001)).toBeFalsy();
        expect(nearlyEqualTest(10001, 10000)).toBeFalsy();
    });

    it('should test big negative numbers with nearlyEqual', () => {
        expect(nearlyEqualTest(-1000000, -1000001)).toBeTruthy();
        expect(nearlyEqualTest(-1000001, -1000000)).toBeTruthy();
        expect(nearlyEqualTest(-10000, -10001)).toBeFalsy();
        expect(nearlyEqualTest(-10001, -10000)).toBeFalsy();
    });

    it('should test numbers around +1 with nearlyEqual', () => {
        expect(nearlyEqualTest(1.0000001, 1.0000002)).toBeTruthy();
        expect(nearlyEqualTest(1.0000002, 1.0000001)).toBeTruthy();
        expect(nearlyEqualTest(1.0002, 1.0001)).toBeFalsy();
        expect(nearlyEqualTest(1.0001, 1.0002)).toBeFalsy();
    });

    it('should test numbers around -1 with nearlyEqual', () => {
        expect(nearlyEqualTest(-1.000001, -1.000002)).toBeTruthy();
        expect(nearlyEqualTest(-1.000002, -1.000001)).toBeTruthy();
        expect(nearlyEqualTest(-1.0001, -1.0002)).toBeFalsy();
        expect(nearlyEqualTest(-1.0002, -1.0001)).toBeFalsy();
    });

    it('should test numbers between +1 and 0 with nearlyEqual', () => {
        expect(nearlyEqualTest(0.000000001000001, 0.000000001000002)).toBeTruthy();
        expect(nearlyEqualTest(0.000000001000002, 0.000000001000001)).toBeTruthy();
        expect(nearlyEqualTest(0.000000000001002, 0.000000000001001)).toBeFalsy();
        expect(nearlyEqualTest(0.000000000001001, 0.000000000001002)).toBeFalsy();
    });

    it('should test numbers between -1 and 0 with nearlyEqual', () => {
        expect(nearlyEqualTest(-0.000000001000001, -0.000000001000002)).toBeTruthy();
        expect(nearlyEqualTest(-0.000000001000002, -0.000000001000001)).toBeTruthy();
        expect(nearlyEqualTest(-0.000000000001002, -0.000000000001001)).toBeFalsy();
        expect(nearlyEqualTest(-0.000000000001001, -0.000000000001002)).toBeFalsy();
    });

    it('should test comparisons involving zero with nearlyEqual', () => {
        expect(nearlyEqualTest(0.0, 0.0)).toBeTruthy();
        expect(nearlyEqualTest(0.0, -0.0)).toBeTruthy();
        expect(nearlyEqualTest(-0.0, -0.0)).toBeTruthy();
        expect(nearlyEqualTest(0.00000001, 0.0)).toBeFalsy();
        expect(nearlyEqualTest(0.0, 0.00000001)).toBeFalsy();
        expect(nearlyEqualTest(-0.00000001, 0.0)).toBeFalsy();
        expect(nearlyEqualTest(0.0, -0.00000001)).toBeFalsy();
    });

    it('should test comparisons involving extreme values with nearlyEqual', () => {
        expect(nearlyEqualTest(+Number.MAX_VALUE, +Number.MAX_VALUE)).toBeTruthy();
        expect(nearlyEqualTest(+Number.MAX_VALUE, -Number.MAX_VALUE)).toBeFalsy();
        expect(nearlyEqualTest(-Number.MAX_VALUE, +Number.MAX_VALUE)).toBeFalsy();
        expect(nearlyEqualTest(+Number.MAX_VALUE, +Number.MAX_VALUE / 2)).toBeFalsy();
        expect(nearlyEqualTest(+Number.MAX_VALUE, -Number.MAX_VALUE / 2)).toBeFalsy();
        expect(nearlyEqualTest(-Number.MAX_VALUE, +Number.MAX_VALUE / 2)).toBeFalsy();
    });

    it('should test comparisons involving infinities with nearlyEqual', () => {
        expect(nearlyEqualTest(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).toBeTruthy();
        expect(nearlyEqualTest(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY)).toBeTruthy();
        expect(nearlyEqualTest(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)).toBeFalsy();
        expect(nearlyEqualTest(Number.POSITIVE_INFINITY, Number.MAX_VALUE)).toBeFalsy();
        expect(nearlyEqualTest(Number.NEGATIVE_INFINITY, -Number.MAX_VALUE)).toBeFalsy();
    });

    it('should test comparisons involving NaN values with nearlyEqual', () => {
        expect(nearlyEqualTest(Number.NaN, Number.NaN)).toBeFalsy();
        expect(nearlyEqualTest(Number.NaN, 0.0)).toBeFalsy();
        expect(nearlyEqualTest(-0.0, Number.NaN)).toBeFalsy();
        expect(nearlyEqualTest(Number.NaN, -0.0)).toBeFalsy();
        expect(nearlyEqualTest(0.0, Number.NaN)).toBeFalsy();
        expect(nearlyEqualTest(Number.NaN, Number.POSITIVE_INFINITY)).toBeFalsy();
        expect(nearlyEqualTest(Number.POSITIVE_INFINITY, Number.NaN)).toBeFalsy();
        expect(nearlyEqualTest(Number.NaN, Number.NEGATIVE_INFINITY)).toBeFalsy();
        expect(nearlyEqualTest(Number.NEGATIVE_INFINITY, Number.NaN)).toBeFalsy();
        expect(nearlyEqualTest(Number.NaN, Number.MAX_VALUE)).toBeFalsy();
        expect(nearlyEqualTest(Number.MAX_VALUE, Number.NaN)).toBeFalsy();
        expect(nearlyEqualTest(Number.NaN, -Number.MAX_VALUE)).toBeFalsy();
        expect(nearlyEqualTest(-Number.MAX_VALUE, Number.NaN)).toBeFalsy();
        expect(nearlyEqualTest(Number.NaN, Number.MIN_VALUE)).toBeFalsy();
        expect(nearlyEqualTest(Number.MIN_VALUE, Number.NaN)).toBeFalsy();
        expect(nearlyEqualTest(Number.NaN, -Number.MIN_VALUE)).toBeFalsy();
        expect(nearlyEqualTest(-Number.MIN_VALUE, Number.NaN)).toBeFalsy();
    });

    it('should test comparisons of numbers on opposite sides of 0 with nearlyEqual', () => {
        expect(nearlyEqualTest(1.000000001, -1.0)).toBeFalsy();
        expect(nearlyEqualTest(-1.0, 1.000000001)).toBeFalsy();
        expect(nearlyEqualTest(-1.000000001, 1.0)).toBeFalsy();
        expect(nearlyEqualTest(1.0, -1.000000001)).toBeFalsy();
    });

    it('should test comparisons of numbers very close to zero with nearlyEqual', () => {
        expect(nearlyEqualTest(+Number.MIN_VALUE, +Number.MIN_VALUE)).toBeTruthy();
        expect(nearlyEqualTest(+Number.MIN_VALUE, -Number.MIN_VALUE)).toBeTruthy();
        expect(nearlyEqualTest(-Number.MIN_VALUE, +Number.MIN_VALUE)).toBeTruthy();
        expect(nearlyEqualTest(+Number.MIN_VALUE, 0)).toBeTruthy();
        expect(nearlyEqualTest(0, +Number.MIN_VALUE)).toBeTruthy();
        expect(nearlyEqualTest(-Number.MIN_VALUE, 0)).toBeTruthy();
        expect(nearlyEqualTest(0, -Number.MIN_VALUE)).toBeTruthy();
        expect(nearlyEqualTest(0.000000001, -Number.MIN_VALUE)).toBeFalsy();
        expect(nearlyEqualTest(0.000000001, +Number.MIN_VALUE)).toBeFalsy();
        expect(nearlyEqualTest(+Number.MIN_VALUE, 0.000000001)).toBeFalsy();
        expect(nearlyEqualTest(-Number.MIN_VALUE, 0.000000001)).toBeFalsy();
    });

    it('should test numbers with nearlyEqual and undefined minimum epsilon', () => {
        setMinimumEpsilon(null);
        expect(nearlyEqualTest(1000000, 1000001)).toBeTruthy();
        expect(nearlyEqualTest(1000001, 1000000)).toBeTruthy();
        expect(nearlyEqualTest(10000, 10001)).toBeFalsy();
        expect(nearlyEqualTest(10001, 10000)).toBeFalsy();
    });

});
