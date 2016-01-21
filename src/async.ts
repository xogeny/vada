import redux = require('redux');
import { DefOp, Operation, createOpReducer } from './ops';

export enum Status { Created, Requested, Resolved, Failed };

export interface AsyncState<T> {
    status: Status;
    value: T;
    error: string;
};

export const initialState: AsyncState<any> = {
    status: Status.Created,
    value: null,
    error: null,
}

export interface AsyncActions<T> {
    start: Operation<AsyncState<T>,void>;
    resolve: Operation<AsyncState<T>,{val: T}>;
    fail: Operation<AsyncState<T>,{msg: string}>;
};

export function asyncReducer<T>(prefix: string, s0?: AsyncState<T>)
: { reducer: redux.Reducer<AsyncState<T>>, actions: AsyncActions<T> } {
    if (s0===undefined)
        s0 = {
            status: Status.Created,
            value: null,
            error: null,
        };
    let actions = asyncActions<T>(prefix);
    return {
        reducer: createOpReducer([actions.start, actions.resolve, actions.fail], s0),
        actions: actions,
    };
}

export function asyncActions<T>(prefix: string): AsyncActions<T> {
    return {
        start: DefOp<AsyncState<T>,void>("start-"+prefix, (s, p) => {
            return {
                status: Status.Requested,
                value: s.value,
                error: s.error,
            };
        }),
        resolve: DefOp<AsyncState<T>,{val: T}>("resolve-"+prefix, (s, p) => {
            return {
                status: Status.Resolved,
                value: p.val,
                error: null,
            };
        }),
        fail: DefOp<AsyncState<T>,{msg: string}>("fail-"+prefix, (s, p) => {
            return {
                status: Status.Failed,
                value: null,
                error: p.msg,
            };
        })
    };
}
