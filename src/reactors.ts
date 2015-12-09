import redux = require('redux')

// The functionality here was inspired by this blog post:
// http://jamesknelson.com/join-the-dark-side-of-the-flux-responding-to-actions-with-actors/

// In that article, this functionality is referred to as Actors
// but since I think they are fundamentally really used to react
// to specific states, I've redubbed them Reactors.

// The idea is that they look at the state and decide
// if additional transformations are required.  The goal here is to
// avoid double dispatch and re-rendering.  They are away of aggregating
// multiple transformations together.

// Reactor is just a type to describe a function that will potentially
// dispatch actions on a Reducer<T> based on the current value of
// the state of that reducer.
export type Reactor<T> = (state: T, dispatch: redux.Dispatch) => void;

// Subscribe is a wrapper that allows you to associate a bunch of actors
// with a Store<T>.  It handles the subscription to the store to allow
// all the reactors to react to store changes.
export function Subscribe<T>(store: redux.Store<T>, reactors: Array<Reactor<T>>) {
    var acting = false;

    // Run all reactors
    var process = () => {
	if (!acting) {
	    acting = true;
	    reactors.forEach((reactor: Reactor<T>) => {
		try {
		    reactor(store.getState(), store.dispatch)
		} catch(e) {
		    console.error("While processing reactor ", reactor);
		    console.error("  ", e)
		}
	    });
	    acting = false;
	}
    }

    // Run 'process' whenever the state is update
    store.subscribe(process);

    // First these reactors for the current state of the store as well.
    process();
}
