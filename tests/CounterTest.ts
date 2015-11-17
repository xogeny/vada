import mocha = require("mocha");

import { expect } from 'chai';

import * as tsr from '../src';

// This our state for this example
interface CounterState {
	counter: number;
}

// These are some actions that we can create using the generate
// action types provided in the actions module:
var increment = tsr.mapPath(["counter"], (x: number) => x+1)
var decrement = tsr.mapPath(["counter"], (x: number) => x-1)
var reset = tsr.setPath(["counter"], 0);

describe("Test a counter store", () => {
	it("should process state changes for a counter", () => {
		// Create the store
		var store = tsr.updeepStore({counter: 0});

		// Dispatch an increment
		store.dispatch(increment);
		// Check the value increased to 1
		expect(store.getState().counter).to.equal(1);

		// Dispatch an increment
		store.dispatch(increment);
		// Check the value increased to 2
		expect(store.getState().counter).to.equal(2);

		// Dispatch an decrement
		store.dispatch(decrement);
		// Check the value decreased to 1
		expect(store.getState().counter).to.equal(1);

		// Dispatch a reset action
		store.dispatch(reset);
		// Check the value reset to 0
		expect(store.getState().counter).to.equal(0);

		// Dispatch an decrement
		store.dispatch(decrement);
		// Check the value decreased to -1
		expect(store.getState().counter).to.equal(-1);
	})
});
