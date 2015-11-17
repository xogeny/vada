import { FluxStandardAction as FSA } from 'redux';
export interface PathPayload {
    path: Array<number | string>;
    v: any;
}
export declare type PathAction = FSA<PathPayload, void>;
export declare const UPDEEP_SET_PATH: string;
export declare const setPath: (path: (number | string)[], v: any) => FSA<PathPayload, void>;
