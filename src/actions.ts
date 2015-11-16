// Grab some types from the redux package so we can properly type actions
// defined here
import { FluxStandardAction as FSA } from 'redux';

// The get method is used to extract data from an object hierarchy.  Path
// is just a type we are importing here.
import { get, Path } from './access';

// The SetPathPayload type is used by the setPath action
export interface SetPathPayload {
	path: Path; // member reference
	v: any;     // value to give that member
}

// The MapPathPayload type is used by the mapPath action
export interface MapPathPayload<T,R> {
	path: Path;     // member reference
	f: (v: T) => R; // function to apply to that member
}

export type PathAction = FSA<SetPathPayload, void>;
export type MapAction<T,R> = FSA<MapPathPayload<T,R>, void>;

// Constant used as the action type for the setPath action
export const UPDEEP_SET_PATH = 'UPDEEP_SET_PATH';

// An action creator that creates an action that sets a given
// element in an object hierarchy to a specified value
export const setPath = (path: Path, v: any): PathAction => {
	return {
		type: UPDEEP_SET_PATH,
		payload: {
			path: path,
			v: v
		}
	}
}

// Constant used as the action type for the mapPath action
export const UPDEEP_MAP_PATH = 'UPDEEP_MAP_PATH';

// An action creator that creates an action that applies the provided
// function to the value of a specified element in an object hierarchy
export const mapPath = <T,R>(path: Path, f: (v: T) => R): MapAction<T,R> => {
	return {
		type: UPDEEP_MAP_PATH,
		payload: {
			path: path,
			f: f
		}
	}
}
