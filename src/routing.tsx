/// <reference path="../typings/crossroads/crossroads.d.ts"/>
import redux = require('redux');

import crossroads = require('crossroads');
var hasher: HasherJs.HasherStatic = null;

if (typeof window !== 'undefined') {
    hasher = require('hasher');
}

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

    if (hasher!=null) {
	hasher.initialized.add(parseHash); //parse initial hash
	hasher.changed.add(parseHash); //parse hash changes
    
	hasher.init(); //start listening for history change
    }
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
    if (hasher!=null) {
	hasher.setHash(url);
    }
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
