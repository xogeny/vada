import redux = require('redux');

import { DefOp, OpReducer, Operation } from './ops';
import { SimpleStore } from './store';
import { Reactor } from './reactors';

// This has a type parameter, but this is "artificial".  It is meant
// to be used to establish the type of the data associated with this
// route and to be used to signal that type information when an instance
// of this type is passed into and out of other functions.
export class RouteId<P extends {}> {
    constructor(public id: string) { }
    apply(p: P): RouteState {
        return {
            name: this.id,
            params: p,
        };
    }
}


// State information about route
export interface RouteState {
    name: string;
    params: {};
}

// Actions
export const setRoute = DefOp("Route/SET_ROUTE", (r: RouteState, p: RouteState) => {
    return {
	name: p.name,
	params: p.params
    }
})

export const initialRouteState = {
    name: "",
    params: {}
}

export const routeReducer = OpReducer(initialRouteState, [setRoute]);

function equalParams(a: {}, b: {}): Boolean {
    // Create arrays of property names
    var aProps = Object.keys(a);
    var bProps = Object.keys(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}

// This function generates a reactor that is fired when we enter a specified
// state.
// N.B. - We are considered to have entered a route if the route is the
// same but the **parameters** have changed.
export function onEnter<P>(route: RouteId<P>,
                           trans: (s: RouteState, // State we are entering
                                   p: P,
                                   dispath: redux.Dispatch) => void)
: Reactor<RouteState> {
    return (next: RouteState, dispatch: redux.Dispatch, prev: RouteState) => {
        // If we aren't entering the specified route, there is nothing
        // to do...
        if (next.name!=route.id) return;

        // If we are entering the specified route but the parameters are
        // the same, then there is nothing to do...
        if (prev.name==next.name && equalParams(prev.params, next.params)) return;

        trans(next, (next.params) as P, dispatch);
    }
}

// This function generates a reactor that is fired **AFTER** we have
// entered a new state that was entered from the specified state.
// N.B. - We are considered to have exited a route if the route is the
// same but the **parameters** have changed.
export function onExit<P>(route: RouteId<P>,
                           trans: (s: RouteState, // State we are leaving
                                   p: P,
                                   dispath: redux.Dispatch) => void)
: Reactor<RouteState> {
    return (next: RouteState, dispatch: redux.Dispatch, prev: RouteState) => {
        // If we aren't leaving the specified route, there is nothing
        // to do...
        if (prev.name!=route.id) return;

        // If we are leaving the specified route but the parameters are
        // the same, then there is nothing to do...
        if (prev.name==next.name && equalParams(prev.params, next.params)) return;

        trans(prev, (next.params) as P, dispatch);
    }
}
