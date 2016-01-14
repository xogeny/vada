import _ = require('lodash');
import redux = require('redux');

import { memo2 } from './memo';

// The type parameter here is used strictly as a pass through to
// maintain type information associated with the given piece
// of computed data.
export interface ComputedProperty<T> {
    id: number;
}

// This is a special implementation of a redux Store that adds
// additional information above and beyond the store.  It includes the
// normal getState method, but it also includes a getStatic and
// getComputed method.  The getStatic method allows static (not
// changing over time) informatio to be associated with the store.  It
// also provides a getComputed method that computed dependent
// properties based on static and state information.
export class BlockStore<S, T, D> implements redux.Store<T> {
    // This is the underlying store we will create with our custom
    // reducer function.
    protected store: redux.Store<T>;
    
    // This is our special reducer that wraps the one provided at
    // initialization
    protected reducer: redux.Reducer<T>;

    // Computed values
    protected computed: D;

    protected wrap(r: redux.Reducer<T>) {
        return (s: T, a: redux.Action) => {
            let ret = r(s, a);
            if (this.dep) {
                this.computed = this.dep(ret, this.staticData);
            } else {
                this.computed = null;
            }
            return ret;
        }
    }
    
    // We build an instance of BlockStore using the static data to be
    // associated with the store and a reducer function (which we will
    // wrap to provide synchronous updates of computed properties).
    constructor(unwrapped: redux.Reducer<T>, protected state0: T,
                protected staticData: S, protected dep?: (t: T, s: S) => D) {
        this.reducer = this.wrap(unwrapped);
        this.store = redux.createStore(this.reducer, state0);
    }

    // This function provides the wrapped reducer.
    getReducer(): redux.Reducer<T> { return this.reducer; }
    
    replaceReducer(r: redux.Reducer<T>) {
        this.reducer = this.wrap(r);
        this.store.replaceReducer(this.reducer);
    }

    dispatch(a: redux.Action) {
        return this.store.dispatch(a);
    }
    
    getState(): T { return this.store.getState(); }
    subscribe(listener: () => void): () => void {
        return this.store.subscribe(listener);
    }
    addComputed<T>(): ComputedProperty<T> {
        return {id: 0};
    }
    getStatic(): S { return this.staticData; }
    getComputed(): D { return this.computed; }
    compute<R>(f: (state: T, statics?: S) => R): () => R {
        let fm = memo2(f);
        return () => {
            return fm(this.getState(), this.getStatic());
        }
    }
}

export interface BlockData<S, T, C> {
    static: S;
    state: T;
    computed: C;
}

export function blockReducer<T,S,C>(reducer: redux.Reducer<T>,
                                    s: S, c: (t: T, s: S) => C)
: redux.Reducer<BlockData<S,T,C>> {
    return (b: BlockData<S,T,C>, action: redux.Action) => {
        let state = reducer(b.state, action);
        return {
            static: b.static,
            state: state,
            computed: c(state, b.static),
        };
    }
}

export function appendComputed<T extends {}, C extends {}>(r: redux.Reducer<T>,
                                                           f: (s: T) => C)
: redux.Reducer<T&C> {
    return (state: T&C, action: redux.Action) => {
        let newstate = r(state, action);
        let ret = _.assign({}, newstate, f(newstate));
        return ret as T&C;
    }
}
