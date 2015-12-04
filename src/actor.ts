import redux = require('redux')

// Actors would be better named "ReActors" because they respond to
// other actions.  The idea is that they look at the state and decide
// if additional transformations are required.  The goal here is to
// avoid double dispatch and re-rendering.  They are away of aggregating
// multiple transformations together.

// Actor is just a type to describe a function that will potentially
// dispatch actions on a Reducer<T> based on the current value of
// the state of that reducer.
export type Actor<T> = (state: T, dispatch: redux.Dispatch) => void;

// Subscribe is a wrapper that allows you to associate a bunch of actors
// with a Store<T>.  It handles the subscription to the store to allow
// all the actors to react to store changes.
export function Subscribe<T>(store: redux.Store<T>, actors: Array<Actor<T>>) {
	var acting = false;
	store.subscribe(() => {
		if (!acting) {
			acting = true;
			actors.forEach((actor: Actor<T>) => { actor(store.getState(), store.dispatch) });
			acting = false;
		}
	})
}
