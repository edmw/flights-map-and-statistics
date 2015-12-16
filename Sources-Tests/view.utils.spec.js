import ViewUtils from '../Sources/application/view.utils';

describe('ViewUtils', () => {
    'use strict';

    it('should format a coordinate for northern and eastern hemisphere', () => {
        // New Delhi
        let lon = ViewUtils.formatLongitudeDegrees(77.224722);
        let lat = ViewUtils.formatLatitudeDegrees(28.636667);
        expect(lon).toEqual('E 77° 13′ 29.0″');
        expect(lat).toEqual('N 28° 38′ 12.0″');
    });

    it('should format a coordinate for southern and eastern hemisphere', () => {
        // Sydney
        let lon = ViewUtils.formatLongitudeDegrees(151.2);
        let lat = ViewUtils.formatLatitudeDegrees(-33.85);
        expect(lon).toEqual('E 151° 12′ 0.0″');
        expect(lat).toEqual('S 33° 51′ 0.0″');
    });

    it('should format a coordinate for northern and western hemisphere', () => {
        // Ottawa
        let lon = ViewUtils.formatLongitudeDegrees(-75.698444);
        let lat = ViewUtils.formatLatitudeDegrees(45.411556);
        expect(lon).toEqual('W 75° 41′ 54.4″');
        expect(lat).toEqual('N 45° 24′ 41.6″');
    });

    it('should format a coordinate for southern and western hemisphere', () => {
        // Sydney
        let lon = ViewUtils.formatLongitudeDegrees(151.2);
        let lat = ViewUtils.formatLatitudeDegrees(-33.85);
        expect(lon).toEqual('E 151° 12′ 0.0″');
        expect(lat).toEqual('S 33° 51′ 0.0″');
    });

});
