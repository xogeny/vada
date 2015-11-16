import redux = require('redux');

import updeep = require('updeep');

import { Action, Reducer, Store, createStore } from 'redux';

import * as actions from './actions';

export function updeepReducer<T extends {}>(state0: T): Reducer<T> {
	return function(state: T = state0, action: Action) {
		switch (action.type) {
		case actions.UPDEEP_SET_PATH:
			let pa = action as actions.PathAction;
			return updeep.updateIn(pa.payload.path, pa.payload.v, state);
		case actions.UPDEEP_MAP_PATH:
			let ma = action as actions.MapAction<T,any>;
			return updeep.updateIn(ma.payload.path, ma.payload.f(state), state);
		default:
			return state;
		}
	}
}

export function updeepStore<T extends {}>(state0: T): Store<T> {
	return createStore(updeepReducer(state0));
}
