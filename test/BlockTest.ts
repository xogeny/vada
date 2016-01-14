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
const reducer = vada.OpReducer(initialState, [incX, incY]);

describe("Test Block Store", () => {
    let s0 = {
        x: 0,
        y: 0,
    };
    it("should provide static data", () => {
        let b = new vada.BlockStore({ prefix: "Test 1" }, reducer, s0);
        expect(b.getStatic().prefix).to.be.equal("Test 1");
        expect(b.getState()).to.deep.equal({
            x: 0,
            y: 0,
        });
    });
    it("should function as a normal store", () => {
        let count = 0;

        let b = new vada.BlockStore({ prefix: "Test 2" }, reducer, s0);
        
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
        let b = new vada.BlockStore({ prefix: "Test 3" }, reducer, s0);
        
        let sum = b.compute((state: TestState) => state.x+state.y);
        expect(sum()).to.be.equal(0);

        b.dispatch(incY.request(null));
        expect(sum()).to.be.equal(1);
        
        b.dispatch(incY.request(null));
        expect(sum()).to.be.equal(2);
        
        b.dispatch(incX.request(null));
        expect(sum()).to.be.equal(3);

        let desc = b.compute((state: TestState, statics: TestStatic) => statics.prefix+": "+sum());
        expect(desc()).to.be.equal("Test 3: 3");
    });
});
