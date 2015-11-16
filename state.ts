import updeep = require('updeep');

import { Action, Reducer, Store, createStore } from 'redux';

import * as actions from './actions';

export function updeepReducer<T>(state0: T): Reducer<T> {
	return function(state: T = state0, action: Action) {
		switch (action.type) {
		case actions.UPDEEP_SET_PATH:
			var a = action as actions.PathAction;
			return updeep.updateIn(a.payload.path, a.payload.v, state);
		default:
			return state;
		}
	}
}

export function updeepStore<T>(state0: T): Store<T> {
	return createStore(updeepReducer(state0));
}
