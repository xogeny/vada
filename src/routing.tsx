import React = require('react');
import redux = require('redux');

import crossroads = require('crossroads');
import hasher = require('hasher');

import { DefOp, OpReducer, Operation } from '../src';

export type RouteList = { [key: string]: string }
var routeMap: { [key: string]: CrossroadsJs.Route } = {};
var reverseMap: { [patter: string]: string } = {};
export function initializeRouting(callback: (name: string, params: {}, route: CrossroadsJs.RouteData) => void) {
    crossroads.routed.add((request: string, data: CrossroadsJs.RouteData) => {
        var name = reverseMap[data.route._pattern];
        callback(name, paramObj(data), data)
    })

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
    for (var k in routes) {
        var route = addRoute(routes[k]);
        routeMap[k] = route;
        reverseMap[routes[k]] = k;
    }
}

export function addRoute(pattern: string) {
    var ret = crossroads.addRoute(pattern);
    return ret;
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

export const routeReducer = OpReducer({ name: "", params: {}}, [setRoute])

// Stuff related to routing components and context
export function MakeProvider(store: redux.Store<any>) {
    return React.createClass({
        childContextTypes: {
            store: React.PropTypes.any
        },
        getChildContext: function() {
            return { store: store };
        },
        render: function() {
            return <div>{this.props.children}</div>;
        }
    });
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
    store: React.PropTypes.any,
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
			console.log("    Current route name: ", name);
			console.log("    Visible: ", visible)
			this.setState({visible: visible})
	}
	componentDidMount() {
		var store = this.context["store"] as redux.Store<RouteState>;
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
