import React = require('react');
import redux = require('redux');

import { SimpleStore } from './store';
import { RouteState } from './routing';

// This is a really useful function.  It is analogous to the connect functionality
// in react-redux.  But I write it natively in Typescript because I think it is
// both clearer and more concise with respect to types.
//
// The basic idea here is that you can pass this a store, an existing
// component type, and a mapping function.  This will return a new
// component where all the properties are bound based on the
// properties returned by the pmap function.  The key thing is that
// these properties can be a function of the state of the store AND
// they will get updated whenever the store value changes.
export function bindClass<P, S>(store: SimpleStore<S>,
                                elem: React.ComponentClass<P>,
                                pmap: (s: S) => P, debug?: string)
: React.ClassicComponentClass<{}> {
    'use strict';
    // A variable that will hold the value of our unsubscribe function once
    // the component is mounted.
    let unsub: () => void = null;
    let mounted: boolean = false;

    // This creates a new ClassicComponentClass that renders the Component passed
    // in but also takes care of binding properties.
    return React.createClass<{}, S>({
        render(): React.ReactElement<{}> {
            // Compute the properties of for this element.
            let props = pmap(this.state);
            // Then create a ReactElement for it with the properties bound.
            return React.createElement(elem, props);
        },
        componentWillUnmount(): void {
            // If the component gets unmounted, unsubscribe from the
            // store.
            mounted = false;
            if (debug) {
                console.log("Unmounting bind class ", debug);
            }
            if (unsub!=null) {
                if (debug) {
                    console.log("  Unsubscribing bind class ", debug);
                }
                unsub();
            }
        },
        componentDidMount(): void {
            if (debug) {
                console.log("Mounting bind class ", debug);
            }
            mounted = true;
            // Subscribe to the store and record the unsubscribe function
            unsub = store.subscribe(() => {
                // Set the state.  Note that something must be binding
                // 'this' to the right thing when the spec is turned into
                // an actual component.
                if (debug) {
                    console.log("  Store update caught for ", debug);
                }
                if (mounted) {
                    this.setState(store.getState());
                }
            });
            this.setState(store.getState());
        },
        getInitialState(): S {
            // Grab the initial state from the store
            return store.getState();
        },
    });
}

export interface ProviderProps extends React.Props<void> {
    store: redux.Store<any>;
    routeStore: SimpleStore<RouteState>;
}

export class Provider extends React.Component<ProviderProps,void> {
    static childContextTypes = {
	store: React.PropTypes.object,
	routeStore: React.PropTypes.object
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
	routeStore: React.PropTypes.object,
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

    render(): JSX.Element {
	if (this.state.visible) {
	    return <div>this.props.children</div>;
	} else {
	    return null;
	}
    }
}
