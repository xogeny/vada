import mocha = require("mocha");
import redux = require('redux');

import { expect } from 'chai';

import * as tsr from '../src';

describe("Test memoization", () => {
    it("properly cache unary functions", () => {
        let count = 0;
        let base = (s: string): number => {
            count = count+1;
            return s.length;
        }

        let memo = tsr.memo(base);

        expect(base("foo")).to.equal(memo("foo"));
        expect(count).to.equal(2);
        expect(base("foo")).to.equal(memo("foo"));
        expect(count).to.equal(3);
        expect(base("foo")).to.equal(memo("foo"));
        expect(count).to.equal(4);

        expect(base("memo")).to.equal(memo("memo"));
        expect(count).to.equal(6);
        expect(base("memo")).to.equal(memo("memo"));
        expect(count).to.equal(7);

        expect(base("foo")).to.equal(memo("foo"));
        expect(count).to.equal(9);
});
    it("properly cache binary functions", () => {
        let count = 0;
        let base = (s1: string, s2: string): number => {
            count = count+1;
            return s1.length*s2.length;
        }

        let memo = tsr.memo2(base);

        expect(base("foo", "bar")).to.equal(memo("foo", "bar"));
        expect(count).to.equal(2);
        expect(base("foo", "bar")).to.equal(memo("foo", "bar"));
        expect(count).to.equal(3);
        expect(base("foo", "bar")).to.equal(memo("foo", "bar"));
        expect(count).to.equal(4);

        expect(base("foo", "memo")).to.equal(memo("foo", "memo"));
        expect(count).to.equal(6);
        
        expect(base("foo", "memo")).to.equal(memo("foo", "memo"));
        expect(count).to.equal(7);

        expect(base("foobar", "memo")).to.equal(memo("foobar", "memo"));
        expect(count).to.equal(9);
        
        expect(base("foo", "bar")).to.equal(memo("foo", "bar"));
        expect(count).to.equal(11);
    });
});
