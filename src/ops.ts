import redux = require('redux');
import uuid = require('node-uuid');

export interface OpAction<P> extends redux.Action {
    payload: P;
}

export type OpActionCreator<P> = (p: P) => OpAction<P>;
export type Evaluator<T, P> = (s: T, payload: P) => T;

// This collects information about a specific type of tranformation
// operation.  This includes a unique identifier (type), a function
// to formulate a request for this operation and, finally, the code
// to perform the operation.
export interface Operation<T, P> {
    type: string;
    request: OpActionCreator<P>;
    evaluate: (s: T, p: P) => T;
}

export function DefOp<T, P>(type: string, evaluate: Evaluator<T, P>)
: Operation<T, P> {
    'use strict';
    let id: string = type+"-"+uuid.v4();
    return {
        "type": id,
        "request": (p: P): OpAction<P> => {
            return {
                "type": id,
                "payload": p,
            };
        },
        "evaluate": evaluate,
    };
}

export type Operations<T> = Array<Operation<T, any>>;

export function OpReducer<T>(state0: T, evals: Operations<T>): redux.Reducer<T> {
    'use strict';
    return (state: T = state0, action: OpAction<any>) => {
        evals.forEach((info: Operation<T, any>) => {
            if (info.type===action.type) {
                state = info.evaluate(state, action.payload);
            }
        });
        return state;
    };
}

export function OpStore<T>(state0: T, evals: Operations<T>): redux.Store<T> {
    'use strict';
    return redux.createStore(OpReducer(state0, evals));
}
