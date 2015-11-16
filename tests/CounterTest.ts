import mocha = require("mocha");

import { expect } from 'chai';

import * as actions from '../src/actions';
import * as state from '../src/state';

interface CounterState {
	counter: number;
}

var increment = actions.mapPath(["counter"], (x: number) => x+1)
var decrement = actions.mapPath(["counter"], (x: number) => x-1)

describe("Test a counter store", () => {
	it("should process state changes for a counter", () => {
		var store = state.updeepStore({counter: 0});

		store.dispatch(increment);
	})
});

