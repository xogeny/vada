import updeep = require('updeep');
import { Action, Reducer, Store, createStore } from 'redux';

// The get method is used to extract data from an object hierarchy.  Path
// is just a type we are importing here.
import { get, Path } from './access';

import { FluxStandardAction as FSA } from './actions';

export interface PathPayload {
	path: Path; // member reference
}

// The SetPathPayload type is used by the setPath action
export interface SetPathPayload extends PathPayload {
	v: any;     // value to give that member
}

// The MapPathPayload type is used by the mapPath action
export interface MapPathPayload<T> extends PathPayload {
	f: (v: T) => T; // function to apply to that member
}

export type PathAction<T extends PathPayload> = FSA<T, void>;
export type SetAction = PathAction<SetPathPayload>;
export type MapAction<T> = PathAction<MapPathPayload<T>>;

// Constant used as the action type for the setPath action
export const UPDEEP_SET_PATH = 'UPDEEP_SET_PATH';

// An action creator that creates an action that sets a given
// element in an object hierarchy to a specified value
export const setPath = <T>(path: Path, v: T): SetAction => {
	return {
		type: UPDEEP_SET_PATH,
		payload: {
			path: path,
			v: v
		}
	}
}

// An action creator that creates an action that overlays
// data a portion of the state on top of the previous state.
// For this action to be used, the overlay fragment has to
// have the same type as the state.  This typically means
// that many elements of the state need to be optional.
// This is nearly analogous to the setPath action except
// that a) it allows more fields to be set and b) it provides
// greater type safety.
export const UPDEEP_OVERLAY = 'UPDEEP_OVERLAY';
export const overlay = <T>(partial: T): FSA<T,void> => {
	return {
		type: UPDEEP_OVERLAY,
		payload: partial
	}
}

// Constant used as the action type for the mapPath action
export const UPDEEP_MAP_PATH = 'UPDEEP_MAP_PATH';

// An action creator that creates an action that applies the provided
// function to the value of a specified element in an object hierarchy
export const mapPath = <T>(path: Path, f: (v: T) => T): MapAction<T> => {
	return {
		type: UPDEEP_MAP_PATH,
		payload: {
			path: path,
			f: f
		}
	}
}

// This function takes an existing PathAction (one where the target is specified
// with a Array<string|number>) and prepends some additional path elements to
// the path.  This creates a new action and has no impact on the value of the
// action passed as an argument.
export function applyAt<T extends PathPayload>(path: Path, action: PathAction<T>)
: PathAction<T> {
	let newpath: Path = [].concat(path).concat(action.payload.path)
	return updeep({payload: { path: newpath}}, action);
}

// This function produces a reducer that manages an object of the specified
// type, T.  To create the reducer, an initial state value must be provided.
// This type of reducer responds to the following actions:
//    - UPDEEP_SET_PATH: Set a given element to a specified value
//    - UPDEEP_MAP_PATH: Apply the specified function an the value of the given element
export function updeepReducer<T extends {}>(state0: T): Reducer<T> {
	return function red(state: T = state0, action: Action) {
		switch (action.type) {
		case UPDEEP_SET_PATH:
			let sa = action as SetAction;
			// Update the value in the hierarchy to a prescribed value
			return updeep.updateIn(sa.payload.path, sa.payload.v, state);
		case UPDEEP_MAP_PATH:
			let ma = action as MapAction<any>;
			// Get the current value of the specified element
			let mcur = get(ma.payload.path, state)
			// Update it's value to the result of applying the provided function
			return updeep.updateIn(ma.payload.path, ma.payload.f(mcur), state);
		case UPDEEP_OVERLAY:
			let oa = action as FSA<{},any>;
			return updeep(oa.payload, state);
		default:
			return state;
		}
	}
}

// Create a store for a state of type T given an initial state.
export function updeepStore<T extends {}>(state0: T): Store<T> {
	return createStore(updeepReducer(state0));
}
