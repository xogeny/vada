import { FluxStandardAction as FSA } from 'redux';

export interface SetPathPayload {
	path: Array<number|string>;
	v: any;
}

export interface MapPathPayload<T,R> {
	path: Array<number|string>;
	f: (v: T) => R;
}

export type PathAction = FSA<SetPathPayload, void>;
export type MapAction<T,R> = FSA<MapPathPayload<T,R>, void>;

export const UPDEEP_SET_PATH = 'UPDEEP_SET_PATH';
export const setPath = (path: Array<number|string>, v: any): PathAction => {
	return {
		type: UPDEEP_SET_PATH,
		payload: {
			path: path,
			v: v
		}
	}
}

export const UPDEEP_MAP_PATH = 'UPDEEP_MAP_PATH';
export const mapPath = <T,R>(path: Array<number|string>, f: (v: T) => R): MapAction<T,R> => {
	return {
		type: UPDEEP_MAP_PATH,
		payload: {
			path: path,
			f: f
		}
	}
}
