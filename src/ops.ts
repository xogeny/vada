import redux = require('redux');
import uuid = require('node-uuid');

export interface OpMeta {
}

export interface OpAction<P> extends redux.Action {
    payload: P;
    meta: OpMeta;
}

export type OpActionCreator<P> = (p: P) => OpAction<P>;
export type Evaluator<T, P> = (s: T, payload: P) => T;

// This collects information about a specific type of tranformation
// operation.  This includes a unique identifier (type), a function
// to formulate a request for this operation and, finally, the code
// to perform the operation.
export interface Operation<T, P> {
    // A unique identifier for this particular operation
    type: string;
    // An action creator (takes a payload, returns an action)
    request: OpActionCreator<P>;
    // Method that performs that actual state transformation
    evaluate: (s: T, p: P) => T;
    // Method to check whether a given action performs this operation
    instance: (a: OpAction<any>) => Boolean;
    // Method to cast an existing action to an action for this operation
    cast: (a: OpAction<any>) => OpAction<P>;
}

// The DefOp function allow us to define an operation that we expect
// to operate on a state of type T and using a payload (parameter for
// the transformation) of type P.  This generates an Operation<T, P> which
// consists of both an Action Creator (request) and the a tranformation
// code (evaluate).
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
                "meta": {
                }
            };
        },
        "evaluate": evaluate,
        "instance": (a: OpAction<any>) => {
            return a.type===id;
        },
        "cast": (a: OpAction<any>): OpAction<P> => {
            return a as OpAction<P>;
        }
    };
}

// The SubOp function allows a given operation (op) to be applied to some
// member of the state.  The assumption here is that the store manages
// a state of type T but that T has a member of type S for which an
// operation, op, exists that takes a payload of type P.  This function
// then creates an Operation that operates on T given a function, trans,
// that defines how to update the member of type S.  Got that? :-)
export function SubOp<T, S, P>(name: string,
                               op: Operation<S, P>,
                               trans: (S: T, f: (s: S) => S) => T) {
    return DefOp(name, (s: T, p: P) => {
        return trans(s, (s: S) => op.evaluate(s, p));
    });
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
