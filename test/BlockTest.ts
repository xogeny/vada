import mocha = require("mocha");
import redux = require('redux');

import { expect } from 'chai';

import * as vada from '../src';

interface TestStatic {
    prefix: string;
}

interface TestState {
    x: number;
    y: number;
}

const incX = vada.DefOp("incX", (s: TestState, p: void) => {
    return {
        x: s.x+1,
        y: s.y,
    };
})

const incY = vada.DefOp("incY", (s: TestState, p: void) => {
    return {
        x: s.x,
        y: s.y+1,
    };
})

const initialState = {x: 1, y: 1};
const reducer = vada.OpReducer([incX, incY], initialState);

describe("Test Block Store", () => {
    let s0 = {
        x: 0,
        y: 0,
    };
    it("should provide static data", () => {
        let b = new vada.BlockStore(reducer, s0, { prefix: "Test 1" });
        expect(b.getStatic().prefix).to.be.equal("Test 1");
        expect(b.getState()).to.deep.equal({
            x: 0,
            y: 0,
        });
    });
    it("should function as a normal store", () => {
        let count = 0;

        let b = new vada.BlockStore(reducer, s0, { prefix: "Test 2" });
        
        expect(b.getStatic().prefix).to.be.equal("Test 2");
        
        expect(b.getState()).to.deep.equal({
            x: 0,
            y: 0,
        });

        let unsub = b.subscribe(() => { count = count + 1; });

        b.dispatch(incX.request(null));
        expect(b.getState()).to.deep.equal({
            x: 1,
            y: 0,
        });
        expect(count).to.be.equal(1);

        b.dispatch(incY.request(null));
        expect(b.getState()).to.deep.equal({
            x: 1,
            y: 1,
        });
        expect(count).to.be.equal(2);

        unsub();

        b.dispatch(incX.request(null));
        expect(b.getState()).to.deep.equal({
            x: 2,
            y: 1,
        });
        expect(count).to.be.equal(2);

        b.dispatch(incY.request(null));
        expect(b.getState()).to.deep.equal({
            x: 2,
            y: 2,
        });
        expect(count).to.be.equal(2);
    });
    it("should recompute derived properties", () => {
        let statics = { prefix: "Test 3" };
        let b = new vada.BlockStore(reducer, s0, statics, (s, c) => {
            return {
                sum: s.x+s.y,
            };
        });
        
        let sum = b.compute((state: TestState) => state.x+state.y);
        expect(b.getComputed().sum).to.be.equal(0);
        expect(sum()).to.be.equal(0);

        b.dispatch(incY.request(null));
        expect(b.getComputed().sum).to.be.equal(1);
        expect(sum()).to.be.equal(1);
        
        b.dispatch(incY.request(null));
        expect(b.getComputed().sum).to.be.equal(2);
        expect(sum()).to.be.equal(2);
        
        b.dispatch(incX.request(null));
        expect(b.getComputed().sum).to.be.equal(3);
        expect(sum()).to.be.equal(3);

        let desc = b.compute((state: TestState, statics: TestStatic) => {
            return statics.prefix+": "+sum();
        });
        expect(desc()).to.be.equal("Test 3: 3");
    });
    it("should recompute derived properties", () => {
        let statics = { prefix: "Test 3" };
        let r1 = vada.appendComputed(reducer, (state: TestState) => {
            return {
                sum: state.x+state.y,
            };
        });
        let b = redux.createStore(r1);
        b.dispatch(incX.request(null));
        expect(b.getState().sum).to.be.equal(3);
    });
});
