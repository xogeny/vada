import redux = require('redux');

// The functionality here was inspired by this blog post:
// http://jamesknelson.com/join-the-dark-side-of-the-flux-responding-to-actions-with-actors/
//
// In that article, this functionality is referred to as Actors but
// since I think they are fundamentally really used to react to
// specific states, I've redubbed them Reactors.
//
// The idea is that they look at the state and decide
// if additional transformations are required.  The goal here is to
// avoid double dispatch and re-rendering.  They are away of aggregating
// multiple transformations together.
//
// I made a few fundamental changes
//
// First, I don't chain off of subscribe anymore because I found the
// semantics involved made it difficult to reason about things because
// a) it is difficult to reason about the order of reactors firing
// because we don't know how the store processes listeners and b) it
// is difficult to explain what takes precedence when multiple
// reactors fire.  As such, I've taken the idea and applied it in a
// way that I think is easier to reason about.
//
// Second, the Actor approach triggered subsequent Dispatches.  I'm
// not convinced this is always what you want.  I think two different
// approaches are useful.
//
// Inline: inline the reactions into the reducers.
//
// Advantages:
//   * Doesn't trigger store listeners multiple times
//   * Avoid inconsistent state that the reactor would prevent.
//   * Easy to reuse operations
//
// Dispatch: allow reactor to dispatch additional actions in response
//
// Advantages:
//   * More explicit, easier to track what actions are being applied.
//   * Better for async operations (since transformation doesn't need
//     to happen immediately).
//   * Easier to reuse actions in general


// Reactor is just a type to describe a function that will potentially
// dispatch actions on a Reducer<T> based on the current value of
// the state of that reducer.
export type InlineReactor<T> = (next: T, prev: T) => T;

function wrapInline<T>(reducer: redux.Reducer<T>, reactor: InlineReactor<T>)
: redux.Reducer<T> {
    return (s: T, action: redux.Action): T => {
        // First, record the initial state
        let prev = s;

        // Then, trigger the nested reducer
        let next = reducer(s, action);

        // Now, pass the reactor the current and previous state and
        // return what it returns
        let final = reactor(next, prev);

        return final;
    }
}

// This is an alternative to the "subscription" approach.  In this
// case, reactors are embedded in the reducer itself.  After each
// time the reducer is applied, the reactors are given a chance to
// react (automatically) to the resulting state.  Since the reactors
// always act on the *underlying reducer*, there is no way for
// reactors to react to each other.
export function wrapReducer<T>(reducer: redux.Reducer<T>,
                               reactors: Array<InlineReactor<T>>)
: redux.Reducer<T> {
    if (reactors.length==0) {
        return reducer;
    }
    let next = wrapInline(reducer, reactors[0]);
    let wrapped = wrapReducer(next, reactors.slice(1, reactors.length));
    return wrapped;
}
