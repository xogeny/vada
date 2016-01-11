import mocha = require("mocha");
import redux = require('redux');

import { expect } from 'chai';

import * as tsr from '../src';

interface RootState {
    route: tsr.RouteState;
    enteredMain: number;
    exitedMain: number;
}

let initialState: RootState = {
    route: null,
    enteredMain: 0,
    exitedMain: 0,
}

describe("Test reactors", () => {
    let main = new tsr.RouteId<{num: number}>("main");
    let loading = new tsr.RouteId<{num: number}>("loading");
    let rootReducer: redux.Reducer<RootState> =
        (s: RootState = initialState, action: redux.Action) => {
            return {
                route: tsr.routeReducer(s.route, action),
                enteredMain: s.enteredMain,
                exitedMain: s.exitedMain,
            }
        }
    it("should be able to apply routes", () => {
        expect(main.apply(null)).to.deep.equal({
            name: "main",
            params: null,
        });

        expect(loading.apply({num: 5})).to.deep.equal({
            name: "loading",
            params: {num: 5},
        });
    });
    it("should process actions", () => {
        let store = redux.createStore(rootReducer);

        expect(store.getState().route).to.equal(null);
        store.dispatch(tsr.setRoute.request(main.apply({num: 2})));
        expect(store.getState().route).to.not.equal(null);
        expect(store.getState().route.name).to.equal(main.id);
        expect(store.getState().enteredMain).to.equal(0);
        expect(store.getState().exitedMain).to.equal(0);
    });
    it("should process reactions", () => {
        let EnterMain = tsr.onEnter<RootState, {}>(main, (s) => s.route, (s, p) => {
            //console.log("Entering main");
            return {
                route: s.route,
                enteredMain: s.enteredMain+1,
                exitedMain: s.exitedMain,
            };
        });

        let ExitMain = tsr.onExit<RootState, {}>(main, (s) => s.route, (s, p) => {
            //console.log("Exiting main");
            return {
                route: s.route,
                enteredMain: s.enteredMain,
                exitedMain: s.exitedMain+1,
            };
        });
        let store = redux.createStore(tsr.wrapReducer(rootReducer,
                                                      [EnterMain, ExitMain]));

        expect(store.getState().route).to.equal(null);

        // Initial nothing has happened
        expect(store.getState().enteredMain).to.equal(0);
        expect(store.getState().exitedMain).to.equal(0);

        store.dispatch(tsr.setRoute.request(main.apply({num: 2})));

        expect(store.getState().route).to.not.equal(null);
        expect(store.getState().route.name).to.equal(main.id);

        // Entered main once
        expect(store.getState().enteredMain).to.equal(1);
        expect(store.getState().exitedMain).to.equal(0);

        // No change, same parameters
        store.dispatch(tsr.setRoute.request(main.apply({num: 2})));        
        
        expect(store.getState().enteredMain).to.equal(1);
        expect(store.getState().exitedMain).to.equal(0);

        // Exit and Enter (change in parameters)
        store.dispatch(tsr.setRoute.request(main.apply({num: 3})));

        expect(store.getState().enteredMain).to.equal(2);
        expect(store.getState().exitedMain).to.equal(1);

        // Exit only
        store.dispatch(tsr.setRoute.request(loading.apply({num: 3})));

        expect(store.getState().route).to.not.equal(null);
        expect(store.getState().route.name).to.equal(loading.id);

        expect(store.getState().enteredMain).to.equal(2);
        expect(store.getState().exitedMain).to.equal(2);
    });
});
