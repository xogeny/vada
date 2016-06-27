import redux = require('redux')

export type WrapperFunction<S> = (store: redux.Store<S>) => redux.Store<S>;

// This function wraps an existing store in a new store.  The
// "outer" store just proxies requests to the inner store.  But
// specific operations can then be selectively overridden
// post-wrapping (e.g., to log actions, states, etc)
export function wrapStore<S>(store: redux.Store<S>): redux.Store<S> {
    let ret: redux.Store<S> = {
        replaceReducer: (n: redux.Reducer<S>) => store.replaceReducer(n),
        dispatch: <A extends redux.Action>(action: A) => {
            return store.dispatch(action)
        },
        getState: () => store.getState(),
        subscribe: (listener: () => void) => store.subscribe(listener)
    }
    return ret;
}

// This is just a subset of the normal Store interface that doesn't
// deal with dispatching, etc.
export interface SimpleStore<T> {
    getState(): T;
    subscribe(listener: () => void): () => void;
}

// This class can be used to "reach inside" an existing Store<T> and
// grab data out.  But it gives the interface of a SimpleStore which
// is nice because it allows you to use bindClass on a *subset* of the
// total application state.
export class SubStore<P, C> implements SimpleStore<C> {
    constructor(protected store: SimpleStore<P>, protected smap: (s: P) => C) {
    }
    public getState(): C {
        let parentState: P = this.store.getState();
        let childState: C = this.smap(parentState);
        return childState;
    }
    // TODO: Trigger subscribe listeners only if this particular part
    // of the state has changed (requires keeping previous state)
    public subscribe(listener: () => void): () => void {
        return this.store.subscribe(listener);
    }
}
