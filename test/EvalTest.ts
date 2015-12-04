import mocha = require("mocha");
import redux = require('redux');

import { expect } from 'chai';

import * as tsr from '../src';

interface BottlesOfBeerOnTheWall {
	howMany: number;
	passedAround: boolean;
}

const TAKE_ONE = 'TAKE_ONE';

const takeAction: tsr.EvalAction<void> = { type: TAKE_ONE, payload: null }
const takeOneDown = (s: BottlesOfBeerOnTheWall, take: tsr.EvalAction<void>): BottlesOfBeerOnTheWall => {
  console.log("Taking down from ", s);
  return {
    howMany: s.howMany-1,
    passedAround: true,
  }
}

interface MaidsAMilking {
	howMany: number;
	cows: number;
}

interface Combined {
	bottles: BottlesOfBeerOnTheWall;
	maids: MaidsAMilking;
}

function CombinedReducer(bred: redux.Reducer<BottlesOfBeerOnTheWall>,
  mred: redux.Reducer<MaidsAMilking>): redux.Reducer<Combined> {
    return (s: Combined = {} as Combined, action: redux.Action) => {
      return {
        bottles: bred(s.bottles, action),
        maids: mred(s.maids, action),
      }
    }
  }
// An action re-targeted so it can be applied to an an instance
// Combined
//const takeOneDown2 = tsr.applyAt(["bottles"], takeOneDown)

interface Concurrent {
	bottles: Array<BottlesOfBeerOnTheWall>;
}

describe("Test eval actions", () => {
	it("should update different reducers independently when combined", () => {
		var b0 = {
			howMany: 99,
			passedAround: false
		};
		var m0 = {
			howMany: 7,
			cows: 14
		};

    var bred = tsr.EvalReducer(b0, {
      [TAKE_ONE]: takeOneDown
    })
    var mred = tsr.EvalReducer(m0, {})
    var store = redux.createStore(CombinedReducer(bred, mred))

		store.dispatch(takeAction);

		expect(store.getState().bottles.howMany).to.equal(98);
	})
  /*
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
  */
})
