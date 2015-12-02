import mocha = require("mocha");

import { expect } from 'chai';

import * as tsr from '../src';

interface BottlesOfBeerOnTheWall {
	howMany: number;
	passedAround: boolean;
}

// An action targeting an instance of BottlesOfBeerOnTheWall
const takeOneDown = tsr.mapPath(["howMany"], (x: number) => x-1);

interface MaidsAMilking {
	howMany: number;
	cows: number;
}

interface Combined {
	bottles: BottlesOfBeerOnTheWall;
	maids: MaidsAMilking;
}

// An action re-targeted so it can be applied to an an instance
// Combined
const takeOneDown2 = tsr.applyAt(["bottles"], takeOneDown)

interface Concurrent {
	bottles: Array<BottlesOfBeerOnTheWall>;
}

describe("Test updeep actions", () => {
	it("should update different reducers independently when combined", () => {
		var b0 = {
			howMany: 99,
			passedAround: false
		};
		var m0 = {
			howMany: 7,
			cows: 14
		};
		var store = tsr.updeepStore<Combined>({bottles: b0, maids: m0});

		store.dispatch(takeOneDown2);

		expect(store.getState().bottles.howMany).to.equal(98);
	})
	it("should handle arrays as well", () => {
		var s0: Concurrent = {
			bottles: [{howMany: 50, passedAround: true}, {howMany: 99, passedAround: false}]
		}
		var store = tsr.updeepStore<Concurrent>(s0);

		// This shows how we can generate new actions that apply an existing action
		// but at a different part of the hierarchy.
		var play = (which: number) => tsr.applyAt(["bottles", which], takeOneDown)
		
		expect(store.getState().bottles[0].howMany).to.equal(50);
		expect(store.getState().bottles[1].howMany).to.equal(99);

		store.dispatch(play(1));

		expect(store.getState().bottles[0].howMany).to.equal(50);
		expect(store.getState().bottles[1].howMany).to.equal(98);

		store.dispatch(play(1));

		expect(store.getState().bottles[0].howMany).to.equal(50);
		expect(store.getState().bottles[1].howMany).to.equal(97);

		store.dispatch(play(0));

		expect(store.getState().bottles[0].howMany).to.equal(49);
		expect(store.getState().bottles[1].howMany).to.equal(97);
	});
})
