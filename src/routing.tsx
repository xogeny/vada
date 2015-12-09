/// <reference path="../typings/crossroads/crossroads.d.ts"/>

import React = require('react');
import redux = require('redux');

import crossroads = require('crossroads');
import hasher = require('hasher');

import { DefOp, OpReducer, Operation } from './ops';
import { SimpleStore } from './store';

export type RouteList = { [key: string]: string }
var routeMap: { [key: string]: CrossroadsJs.Route } = {};
var reverseMap: { [patter: string]: string } = {};

export type RoutingCallback = (name: string, params: {},
			       route: CrossroadsJs.RouteData) => void

export function initializeRouting(callback: RoutingCallback) {
    crossroads.routed.add((request: string, data: CrossroadsJs.RouteData) => {
        var name = reverseMap[data.route._pattern];
        callback(name, paramObj(data), data)
    })

    crossroads.bypassed.add(function(request: string){
	console.log("Bypassed: ", request);
	callback("--unknown--", {}, null);
    });

    var parseHash = (newHash: string, oldHash: string) => {
        crossroads.parse(newHash);
    }

    hasher.initialized.add(parseHash); //parse initial hash
    hasher.changed.add(parseHash); //parse hash changes
    
    hasher.init(); //start listening for history change
}

export function paramObj(route: CrossroadsJs.RouteData): { [key: string]: any } {
    var ret: { [key: string]: any } = {};
    for (var i = 0; i < route.route._paramsIds.length; i++) {
        ret[route.route._paramsIds[i]] = route.params[i];
    }
    return ret;
}

export function addRoutes(routes: RouteList) {
    for (var name in routes) {
	var pattern = routes[name];
	var route = addRoute(name, pattern);
    }
}

export function addRoute(name: string, pattern: string) {
    var ret = crossroads.addRoute(pattern);
    routeMap[name] = ret;
    reverseMap[pattern] = name;
    return ret;
}

export function setHash(id: string, params?: {}): string {
    var url = href(id, params);
    hasher.setHash(url);
    return url
}

export function href(id: string, params?: {}): string {
    var route = routeMap[id];
    if (!route) {
        return "#/invalid-route?id=" + id;
    }
    return "#" + route.interpolate(params)
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

export interface ProviderProps extends React.Props<void> {
    store: redux.Store<any>;
    routeStore: SimpleStore<RouteState>;
}

export class Provider extends React.Component<ProviderProps,void> {
    static childContextTypes = {
	store: React.PropTypes.any,
	routeStore: React.PropTypes.any
    }
    getChildContext() {
	return {
            store: this.props.store,
            routeStore: this.props.routeStore
	};
    }
    render() {
	return <div>{this.props.children}</div>;
    }
}

export interface RouteProps extends React.Props<void>{
    name: string;
}

export interface RouteVisibilityState {
    visible: boolean;
}

export class Route extends React.Component<RouteProps, RouteVisibilityState> {
    public unsub: () => void;
    static contextTypes = {
	routeStore: React.PropTypes.any,
    }
    constructor(props?: RouteProps) {
	super(props);
	this.state = {visible: false};
    }

    componentWillUnmount() {
	// If the component gets unmounted, unsubscribe from the
	// store.
	console.log("Unmounting ", this.props.name);
	if (this.unsub!=null) {
	    this.unsub();
	    console.log("  Unsubscribed ", this.props.name);
	} else {
	    console.log("  No subscription for ", this.props.name);
	}
    }
    update(s: RouteState) {
	var name = s.name;
	var visible = name == this.props.name;
	console.log("  Updating ", this.props.name);
	console.log("    RouteState: ", this.props)
	console.log("    Current route name: ", name);
	console.log("    Visible: ", visible)
	this.setState({visible: visible})
    }
    componentDidMount() {
	var store = this.context["routeStore"] as redux.Store<RouteState>;
	console.log("Mounting Route for ", this.props.name)

	// Subscribe to the store and record the unsubscribe function
	this.unsub = store.subscribe(() => {
	    this.update(store.getState());
	});
	this.update(store.getState());
    }

    render() {
	if (this.state.visible) {
	    return <div>{this.props.children}</div>;
	} else {
	    return null;
	}
    }
}
