import redux = require('redux');

import { DefOp, OpReducer, Operation } from './ops';
import { SimpleStore } from './store';

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

export const routeReducer = OpReducer(initialRouteState, [setRoute])
