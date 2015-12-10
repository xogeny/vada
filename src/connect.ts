import React = require("react");
import { SimpleStore } from "./store";

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
