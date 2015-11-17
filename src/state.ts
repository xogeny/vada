import redux = require('redux');

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
export class SubStore<P,C> implements SimpleStore<C> {
	constructor(protected store: SimpleStore<P>, protected smap: (s: P) => C) {

	}
	getState(): C {
		var parentState: P = this.store.getState();
		var childState: C = this.smap(parentState);
		return childState;
	}
	subscribe(listener: () => void): () => void {
		return this.store.subscribe(listener);
	}
}
