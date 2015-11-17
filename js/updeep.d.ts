import { Reducer, Store } from 'redux';
import { Path } from './access';
import { FluxStandardAction as FSA } from './actions';
export interface SetPathPayload {
    path: Path;
    v: any;
}
export interface MapPathPayload<T, R> {
    path: Path;
    f: (v: T) => R;
}
export declare type PathAction = FSA<SetPathPayload, void>;
export declare type MapAction<T, R> = FSA<MapPathPayload<T, R>, void>;
export declare const UPDEEP_SET_PATH: string;
export declare const setPath: (path: (string | number)[], v: any) => FSA<SetPathPayload, void>;
export declare const UPDEEP_MAP_PATH: string;
export declare const mapPath: <T, R>(path: (string | number)[], f: (v: T) => R) => FSA<MapPathPayload<T, R>, void>;
export declare function updeepReducer<T extends {}>(state0: T): Reducer<T>;
export declare function updeepStore<T extends {}>(state0: T): Store<T>;
