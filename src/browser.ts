/// <reference path="../typings/crossroads/crossroads.d.ts"/>

import crossroads = require('crossroads');

import { RouteId } from './routing';

export type RouteList = { [key: string]: string }

export var routeMap: { [key: string]: CrossroadsJs.Route } = {};
export var reverseMap: { [patter: string]: string } = {};

export function paramObj(route: CrossroadsJs.RouteData): { [key: string]: any } {
    var ret: { [key: string]: any } = {};
    for (var i = 0; i < route.route._paramsIds.length; i++) {
        ret[route.route._paramsIds[i]] = route.params[i];
    }
    return ret;
}

export type RoutingCallback = (name: string, params: {},
			       route: CrossroadsJs.RouteData) => void

export function addRoutes(routes: RouteList) {
    for (var name in routes) {
	addRoute(name, routes[name]);
    }
}

export function addRoute<T>(name: string, pattern: string): RouteId<T> {
    var ret = crossroads.addRoute(pattern);
    routeMap[name] = ret;
    reverseMap[pattern] = name;
    return new RouteId(name);
}

export function setHash<T>(route: RouteId<T>, params?: T): string {
    var url = href(route.id, params);
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

var hasher: HasherJs.HasherStatic = null;

if (typeof window !== 'undefined') {
    hasher = require('hasher');
}

// Ideally, I need a function like this to call that is context specific.
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
