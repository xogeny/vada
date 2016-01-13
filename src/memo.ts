export type Unary<T,R> = (arg: T) => R;
export type Binary<T1,T2,R> = (arg1: T1, arg2: T2) => R;
export type Trinary<T1,T2,T3,R> = (arg1: T1, arg2: T2, arg3: T3) => R;

export function memo<T, R>(f: Unary<T,R>): Unary<T,R> {
    var called: boolean = false;
    var parg: T = undefined;
    var pres: R = undefined;
    return (arg: T): R => {
        if (!called || parg!==arg) {
            pres = f(arg);
            parg = arg;
            called = true;
        }
        return pres;
    }
}

export function memo2<T1, T2, R>(f: Binary<T1, T2, R>): Binary<T1, T2, R> {
    var called: boolean = false;
    var parg1: T1 = undefined;
    var parg2: T2 = undefined;
    var pres: R = undefined;
    return (arg1: T1, arg2: T2): R => {
        if (!called || parg1!==arg1 || parg2!==arg2) {
            pres = f(arg1, arg2);
            parg1 = arg1;
            parg2 = arg2;
            called = true;
        }
        return pres;
    }
}

function different<T>(a: T, b: T): boolean {
    let ret = false;
    for(let k in a) {
        if (a[k]!==b[k]) {
            ret = true;
            break;
        }
    }
    return ret;
}

export function multiMemo<T extends {}, R>(f: Unary<T, R>): Unary<T, R> {
    var called: boolean = false;
    var parg: T = undefined;
    var pres: R = undefined;
    return (arg: T): R => {
        if (!called || !parg || different(arg, parg)) {
            pres = f(arg);
            parg = arg;
            called = true;
        }
        return pres;
    }
}
