import redux = require('redux');
import updeep = require('updeep');

import { Action, Reducer, Store, createStore } from 'redux';
import { get } from './access';
import * as actions from './actions';

// This function produces a reducer that manages an object of the specified
// type, T.  To create the reducer, an initial state value must be provided.
// This type of reducer responds to the following actions (see actions.ts):
//    - UPDEEP_SET_PATH: Set a given element to a specified value
//    - UPDEEP_MAP_PATH: Apply the specified function an the value of the given element
export function updeepReducer<T extends {}>(state0: T): Reducer<T> {
	return function(state: T = state0, action: Action) {
		switch (action.type) {
		case actions.UPDEEP_SET_PATH:
			let pa = action as actions.PathAction;
			// Update the value in the hierarchy to a prescribed value
			return updeep.updateIn(pa.payload.path, pa.payload.v, state);
		case actions.UPDEEP_MAP_PATH:
			let ma = action as actions.MapAction<T,any>;
			// Get the current value of the specified element
			let cur = get(ma.payload.path, state)
			// Update it's value to the result of applying the provided function
			return updeep.updateIn(ma.payload.path, ma.payload.f(cur), state);
		default:
			return state;
		}
	}
}

// Create a store for a state of type T given an initial state.
export function updeepStore<T extends {}>(state0: T): Store<T> {
	return createStore(updeepReducer(state0));
}
