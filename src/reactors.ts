import redux = require('redux');

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

// subscribe is a wrapper that allows you to associate a bunch of actors
// with a Store<T>.  It handles the subscription to the store to allow
// all the reactors to react to store changes.
export function subscribe<T>(store: redux.Store<T>,
                             reactors: Array<Reactor<T>>)
: void {
    'use strict';
    let acting: boolean = false;

    // Run all reactors
    let process: () => void = () => {
        if (!acting) {
            acting = true;
            reactors.forEach((reactor: Reactor<T>) => {
                let state = store.getState();
                try {
                    reactor(store.getState(), store.dispatch);
                } catch (e) {
                    console.error("While processing reactor ", reactor);
                    console.error("  ", e);
                }
            });
            acting = false;
        }
    };

    // Run 'process' whenever the state is update
    store.subscribe(process);

    // First these reactors for the current state of the store as well.
    process();
}

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
        var ret = reducer(s, action);
        var dispatch: redux.Dispatch = (action: redux.Action) => {
            ret = reducer(ret, action);
        }

        // Now loop over all the reactions and apply them...
        reactors.forEach((reactor: Reactor<T>) => {
            try {
                reactor(ret, dispatch);
            } catch (e) {
                console.error("While processing reactor ", reactor);
                console.error("  ", e);
            }
        });

        return ret;
    }
}
