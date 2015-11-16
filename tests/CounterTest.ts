import mocha = require("mocha");

import { expect } from 'chai';

import * as actions from '../src/actions';
import * as state from '../src/state';

// This our state for this example
interface CounterState {
	counter: number;
}

// These are some actions that we can create using the generate
// action types provided in the actions module:
var increment = actions.mapPath(["counter"], (x: number) => x+1)
var decrement = actions.mapPath(["counter"], (x: number) => x-1)
var reset = actions.setPath(["counter"], 0);

describe("Test a counter store", () => {
	it("should process state changes for a counter", () => {
		// Create the store
		var store = state.updeepStore({counter: 0});

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
