import mocha = require("mocha");
import redux = require('redux');

import { expect } from 'chai';

import * as vada from '../src';

describe("Test memoization", () => {
    it("properly cache unary functions", () => {
        let count = 0;
        let base = (s: string): number => {
            count = count+1;
            return s.length;
        }

        let memo = vada.memo(base);

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

        let memo = vada.memo2(base);

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
    it("should handle multiple arguments marshalled into an object", () => {
        let count = 0;
        let sum = (a: number[], b: number[]): number => {
            let ret = 0;
            a.forEach(v => { ret = ret + v; });
            b.forEach(v => { ret = ret + v; });
            count++;
            return ret;
        }
        let a1 = [1,2,3];
        let a2 = [1,2,3];
        let b1 = [4,5];
        let m = vada.multiMemo((s: {a: number[], b: number[]}) => sum(s.a,s.b));
        expect(count).to.be.equal(0);
        expect(m({a: [0], b: [0]})).to.be.equal(0);
        expect(count).to.be.equal(1);
        expect(m({a: a1, b: b1})).to.be.equal(15);
        expect(count).to.be.equal(2);
        expect(m({a: a1, b: b1})).to.be.equal(15);
        expect(count).to.be.equal(2);
        expect(m({a: a2, b: b1})).to.be.equal(15);
        expect(count).to.be.equal(3);
        expect(m({a: a1, b: b1})).to.be.equal(15);
        expect(count).to.be.equal(4);
    });
});
