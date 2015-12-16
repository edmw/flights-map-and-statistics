import Buckets from '../Sources/application/util.buckets';

var bucketsjs = require('buckets-js');

class KeyType {
    constructor(string) {
        this.string = string;
    }
    key() {
        return this.string;
    }
}

class ValueType {
    constructor(string) {
        this.string = string;
    }
    isEqualTo(value) {
        return this.string === value.string;
    }
}

describe('Buckets Utilities', () => {
    'use strict';

    it('should prevent to construct an instance', () => {
        expect(() => { let b = new Buckets(); }).toThrow();
    });

    it('should create a set which handles strings', () => {
        let set;
        set = Buckets.createSet();
        expect(set).toEqual(jasmine.any(Object));
        expect(set.equals(bucketsjs.Set())).toBeTruthy();
        set = Buckets.createSet('strings');
        expect(set).toEqual(jasmine.any(Object));
        expect(set.equals(bucketsjs.Set())).toBeTruthy();
    });

    it('should create a set which handles objects', () => {
        let set;
        set = Buckets.createSet(KeyType);
        expect(set).toEqual(jasmine.any(Object));
        expect(set.equals(bucketsjs.Set())).toBeTruthy();
        set.add(new KeyType('1'));
        expect(set.size()).toEqual(1);
    });

    it('should create a multi-dictionary which handles strings', () => {
        let dict;
        dict = Buckets.createMultiDictionary();
        expect(dict).toEqual(jasmine.any(Object));
        expect(dict.equals(bucketsjs.MultiDictionary())).toBeTruthy();
        dict = Buckets.createMultiDictionary('strings');
        expect(dict).toEqual(jasmine.any(Object));
        expect(dict.equals(bucketsjs.MultiDictionary())).toBeTruthy();
        dict = Buckets.createMultiDictionary('strings', '');
        expect(dict).toEqual(jasmine.any(Object));
        expect(dict.equals(bucketsjs.MultiDictionary())).toBeTruthy();
    });

    it('should create a multi-dictionary which handles objects', () => {
        let dict;
        dict = Buckets.createMultiDictionary(KeyType, ValueType);
        expect(dict).toEqual(jasmine.any(Object));
        expect(dict.equals(bucketsjs.MultiDictionary())).toBeTruthy();
        dict.set(new KeyType('1'), new ValueType('a'));
        expect(dict.size()).toEqual(1);
        dict.set(new KeyType('1'), new ValueType('b'));
        expect(dict.size()).toEqual(1);
        expect(dict.get(new KeyType('1')).length).toEqual(2);
    });

    it('should return the keys of a multi-dictionary sorted by the number of values per key', () => {
        let dict;
        dict = Buckets.createMultiDictionary(KeyType, ValueType);
        dict.set(new KeyType('1'), new ValueType('a'));
        dict.set(new KeyType('1'), new ValueType('b'));
        dict.set(new KeyType('2'), new ValueType('c'));
        dict.set(new KeyType('2'), new ValueType('d'));
        dict.set(new KeyType('2'), new ValueType('e'));
        dict.set(new KeyType('3'), new ValueType('f'));
        dict.set(new KeyType('4'), new ValueType('g'));
        dict.set(new KeyType('4'), new ValueType('h'));
        dict.set(new KeyType('4'), new ValueType('i'));
        dict.set(new KeyType('4'), new ValueType('j'));
        let keys = Buckets.keysOfMultiDictionarySortedByLengthOfValue(dict);
        expect(keys[0].string).toEqual('4');
        expect(keys[1].string).toEqual('2');
        expect(keys[2].string).toEqual('1');
        expect(keys[3].string).toEqual('3');
    });

});
