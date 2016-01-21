import mocha = require("mocha");
import redux = require('redux');

import { expect } from 'chai';

import vada = require('../src');

describe("Test Async actions and reducers", () => {
    it("should implement workflow", () => {
        let { reducer, actions } = vada.asyncReducer<number>("x");
        let store = redux.createStore(reducer);
        expect(store.getState().status).to.equal(vada.Status.Created);
        expect(store.getState().value).to.equal(null);
        expect(store.getState().error).to.equal(null);

        store.dispatch(actions.start.request(null));
        expect(store.getState().status).to.equal(vada.Status.Requested);
        expect(store.getState().value).to.equal(null);
        expect(store.getState().error).to.equal(null);

        store.dispatch(actions.resolve.request({val: 5}));
        expect(store.getState().status).to.equal(vada.Status.Resolved);
        expect(store.getState().value).to.equal(5);
        expect(store.getState().error).to.equal(null);

        store.dispatch(actions.fail.request({msg: "Didn't Work"}));
        expect(store.getState().status).to.equal(vada.Status.Failed);
        expect(store.getState().value).to.equal(null);
        expect(store.getState().error).to.equal("Didn't Work");
    });
});
