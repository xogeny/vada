import redux = require('redux');

// The functionality here was inspired by this blog post:
// http://jamesknelson.com/join-the-dark-side-of-the-flux-responding-to-actions-with-actors/

// In that article, this functionality is referred to as Actors but
// since I think they are fundamentally really used to react to
// specific states, I've redubbed them Reactors.  I made one
// fundamental change...I don't chain off of subscribe anymore because
// I found the semantics involved made it difficult to reason about
// things because a) it is difficult to reason about the order of
// reactors firing because we don't know how the store processes
// listeners and b) it is difficult to explain what takes precedence
// when multiple reactors fire.  As such, I've taken the idea and
// applied it in a way that I think is easier to reason about.

// The idea is that they look at the state and decide
// if additional transformations are required.  The goal here is to
// avoid double dispatch and re-rendering.  They are away of aggregating
// multiple transformations together.

// Reactor is just a type to describe a function that will potentially
// dispatch actions on a Reducer<T> based on the current value of
// the state of that reducer.
export type Reactor<T> = (next: T, dispatch: redux.Dispatch, prev: T) => void;

// This is an alternative to the "subscription" approach.  In this
// case, reactors are embedded in the reducer itself.  After each
// time the reducer is applied, the reactors are given a chance to
// react (automatically) to the resulting state.  Since the reactors
// always act on the *underlying reducer*, there is no way for
// reactors to react to each other.
export function wrapReducer<T>(reducer: redux.Reducer<T>,
                               reactors: Array<Reactor<T>>)
: redux.Reducer<T> {
    return (s: T, action: redux.Action): T => {
        // First, trigger the reducer
        let prev = s;
        let next = reducer(s, action);
        let dispatch: redux.Dispatch = (action: redux.Action) => {
            next = reducer(next, action);
        }

        // Now loop over all the reactions and apply them...
        reactors.forEach((reactor: Reactor<T>) => {
            try {
                reactor(next, dispatch, prev);
            } catch (e) {
                console.error("While processing reactor ", reactor);
                console.error("  ", e);
            }
        });

        return next;
    }
}
