import { FluxStandardAction as FSA } from 'redux';

export interface PathPayload {
	path: Array<number|string>;
	v: any;
}

export type PathAction = FSA<PathPayload, void>;

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
