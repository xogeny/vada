import _ = require('lodash');
import redux = require('redux');
import { Operation, createOpReducer } from './ops';
import { InlineReactor, wrapReducer } from './reactors';
import { overlay } from './clone';

export class Builder<T extends {}> {
    protected red: redux.Reducer<T>;
    constructor(ops: Operation<T, any>[], protected s0?: T) {
        this.red = createOpReducer(ops, s0);
    }
    protected newBuilder(r: redux.Reducer<T>, s0: T): Builder<T> {
        let ret = new Builder<T>([]);
        ret.red = r; // Ugly, I know...
        ret.s0 = s0;
        return ret;
    }
    reduce(f: (t: T) => T) {
        return this.newBuilder((s: T = this.s0, a: redux.Action) => {
            return f(this.red(s,a));
        }, this.s0);
    }
    overlayOps<A>(f: (s: T, r: redux.Reducer<A>, a: redux.Action) => void,
               ops: Operation<A, any>[], a0?: A)
    : Builder<T> {
        return this.overlay(f, createOpReducer(ops, a0), a0);
    }
    overlay<A>(f: (s: T, r: redux.Reducer<A>, a: redux.Action) => void,
               cred: redux.Reducer<A>, a0?: A)
    : Builder<T> {
        return this.newBuilder((s: T = this.s0, a: redux.Action) => {
            let base = this.red(s, a);
            if (base==undefined || base==null) {
                throw new Error("Tried to overlay nested reducer "+
                                "onto undefined parent");
            }
            return overlay(base, s => f(s, cred, a));
        }, this.s0);
    }
    reactTo(...reactors: InlineReactor<T>[]) {
        return this.newBuilder(wrapReducer(this.red, reactors), this.s0);
    }
    reducer(): redux.Reducer<T> { return this.red; }
};
