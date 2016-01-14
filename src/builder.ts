import redux = require('redux');
import { Operation, OpReducer } from './ops';
import { InlineReactor, wrapReducer } from './reactors';

export class Builder<T extends {}> {
    protected red: redux.Reducer<T>;
    constructor(ops: Operation<T, any>[], protected s0?: T) {
        this.red = OpReducer(ops, s0);
    }
    protected newBuilder(r: redux.Reducer<T>): Builder<T> {
        let ret = new Builder<T>([]);
        ret.red = r; // Ugly, I know...
        return ret;
    }
    overlay<A>(f: (s: T, r: redux.Reducer<A>, a: redux.Action) => void,
               ops: Operation<A, any>[], a0?: A)
    : Builder<T> {
        let ret = new Builder<T>([]);
        let cred = OpReducer(ops, a0)
        ret.red = (s: T = this.s0, a: redux.Action) => {
            let base = this.red(s, a);
            if (base==undefined || base==null) {
                throw new Error("Tried to overlay nested reducer "+
                                "onto undefined parent");
            }
            f(base, cred, a);
            return base;
        }
        return ret;
    }
    reactTo(...reactors: InlineReactor<T>[]) {
        return this.newBuilder(wrapReducer(this.red, reactors));
    }
    reducer(): redux.Reducer<T> { return this.red; }
};
