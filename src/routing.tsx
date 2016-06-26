import redux = require('redux');

import { DefOp, createOpReducer, Operation } from './ops';
import { SimpleStore } from './store';
import { InlineReactor } from './reactors';

export type ParamMap = { [key: string]: any };
// This has a type parameter, but this is "artificial".  It is meant
// to be used to establish the type of the data associated with this
// route and to be used to signal that type information when an instance
// of this type is passed into and out of other functions.
export class RouteId<P extends ParamMap> {
    constructor(public id: string, public parent?: RouteId<any>) {
    }
    public apply(p: P): RouteState {
        return {
            name: this.id,
            params: p,
        };
    }
    public nested<X extends ParamMap>(sub: string): RouteId<P & X> {
        return new RouteId<P & X>(this.id+"."+sub, this);
    }
}

// State information about route
export interface RouteState {
    name: string;
    params: ParamMap;
}

// Actions
export const setRoute = DefOp("Route/SET_ROUTE", (r: RouteState, p: RouteState) => {
    return {
	    name: p.name,
	    params: p.params
    }
})

// This function is used to generate a callback for the ts-redux-browser
// function 'initializeRouting'.  It responds to route changles in
// the browsers location bar by dispatching a 'setRoute' action.
export function routingCallback<T>(store: redux.Store<T>,
                                   bypass?: () => void) {
    return ((name: string, params: {}) => {
        if (name===null && bypass!==undefined) {
            bypass();
        } else {
            let obj = {name: name, params: params}
            store.dispatch(setRoute.request(obj));
        }
    });
};

export function routeReducer(initialRouteState: RouteState) {
    return createOpReducer([setRoute], initialRouteState);
}

function equalParams(a: {}, b: {}): Boolean {
    if (a===b) return true;
    if (a===null && b!==null) return false;
    if (a!==null && b===null) return false;
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
export function onEnter<S,P>(route: RouteId<P>,
                             pull: (s: S) => RouteState,
                             trans: (s: S, p: P) => S)
: InlineReactor<S> {
    return (prev: S, next: S): S => {
        if (prev===null || prev===undefined) return next;
        if (next===null || next===undefined) return next;
        let prevRoute = pull(prev);
        let nextRoute = pull(next);
        if (nextRoute===null || nextRoute===undefined) return next;
        // If we aren't entering the specified route, there is nothing
        // to do...
        if (nextRoute.name!=route.id) return next;

        // If we are entering the specified route but the previous
        // route was the same and the parameters are the same, then
        // there is nothing to do...
        if (prevRoute!==null &&
            prevRoute!==undefined &&
            prevRoute.name==nextRoute.name &&
            equalParams(prevRoute.params, nextRoute.params)) return next;

        return trans(next, (nextRoute.params) as P);
    }
}

// This function generates a reactor that is fired **AFTER** we have
// entered a new state that was entered from the specified state.
// N.B. - We are considered to have exited a route if the route is the
// same but the **parameters** have changed.
export function onExit<S,P>(route: RouteId<P>,
                            pull: (s: S) => RouteState,
                            trans: (s: S, p: P) => S)
: InlineReactor<S> {
    return (prev: S, next: S): S => {
        if (prev===null || prev===undefined) return next;
        if (next===null || next===undefined) return next;
        let prevRoute = pull(prev);
        let nextRoute = pull(next);
        if (prevRoute===null || prevRoute===undefined) return next;
        // If we aren't exiting the specified route, there is nothing
        // to do...
        if (prevRoute.name!=route.id) return next;

        // If we are exiting the specified route but the next
        // route is the same and the parameters are the same, then
        // there is nothing to do...
        if (nextRoute!==null &&
            nextRoute!==undefined &&
            prevRoute.name==nextRoute.name &&
            equalParams(prevRoute.params, nextRoute.params)) return next;

        return trans(next, (nextRoute.params) as P);
    }
}
