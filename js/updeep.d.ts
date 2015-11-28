import { Reducer, Store } from 'redux';
import { Path } from './access';
import { FluxStandardAction as FSA } from './actions';
export interface SetPathPayload {
    path: Path;
    v: any;
}
export interface MapPathPayload<T> {
    path: Path;
    f: (v: T) => T;
}
export declare type PathAction = FSA<SetPathPayload, void>;
export declare type MapAction<T> = FSA<MapPathPayload<T>, void>;
export declare const UPDEEP_SET_PATH: string;
export declare const setPath: <T>(path: (string | number)[], v: T) => FSA<SetPathPayload, void>;
export declare const UPDEEP_OVERLAY: string;
export declare const overlay: <T>(partial: T) => FSA<T, void>;
export declare const UPDEEP_MAP_PATH: string;
export declare const mapPath: <T>(path: (string | number)[], f: (v: T) => T) => FSA<MapPathPayload<T>, void>;
export declare function updeepReducer<T extends {}>(state0: T): Reducer<T>;
export declare function updeepStore<T extends {}>(state0: T): Store<T>;
