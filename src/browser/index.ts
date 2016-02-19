import crossroads = require('crossroads');
import hasher = require('hasher');

import { RouteId } from '../routing';

export type RouteList = { [key: string]: string }

var routeMap: { [key: string]: CrossroadsJs.Route } = {};
export var reverseMap: { [pattern: string]: string } = {};

function paramObj(route: CrossroadsJs.RouteData): { [key: string]: any } {
    var ret: { [key: string]: any } = {};
    for (var i = 0; i < route.route._paramsIds.length; i++) {
        ret[route.route._paramsIds[i]] = route.params[i];
    }
    return ret;
}

export type RoutingCallback = (name: string, params: {}) => void

export class RouteRequest<T> {
    constructor(public route: RouteId<T>) {}
    goto(params: T) {
        gotoRoute(this.route, params);
    }
    href(params: T) {
        return href(this.route, params);
    }
}

export function bindRoutes(routes: RouteList) {
    for (var name in routes) {
	bindRoute(name, routes[name]);
    }
}

export function bindRoute<T>(route: RouteId<T>, pattern: string): RouteRequest<T> {
    let routeData = crossroads.addRoute(pattern);
    let name = route.id;
    routeMap[name] = routeData;
    reverseMap[pattern] = name;
    return new RouteRequest<T>(route);
}

// Within a browser, the way we dispatch a route is by simply
// setting the location.
export function gotoRoute<T>(route: RouteId<T>, params?: T): void {
    // Compute the location for this route
    var url = href(route, params);
    // Set location (and let browser trigger the dispatch)
    hasher.setHash(url);
}

export function href<T>(rid: RouteId<T>, params?: T): string {
    let id = rid.id;
    var route = routeMap[id];
    if (!route) {
        console.log("Invalid route ", id, " requested");
        console.log("Known routes are ", routeMap);
        return "#/invalid-route?id=" + id;
    }
    return "#" + route.interpolate(params)
}

// Ideally, I need a function like this to call that is context specific.
export function initializeRouting(callback: RoutingCallback) {
    crossroads.routed.add((request: string, data: CrossroadsJs.RouteData) => {
        var name = reverseMap[data.route._pattern];
        callback(name, paramObj(data))
    })

    crossroads.bypassed.add(function(request: string){
	console.log("Bypassed: ", request);
	callback(null, {});
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
