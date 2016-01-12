import redux = require('redux');

export function combineReducers<T>(...reds: redux.Reducer<T>[]): redux.Reducer<T> {
    return (s: T, a: redux.Action) => {
        let cur = s;
        reds.forEach((r: redux.Reducer<T>) => {
            cur = r(cur, a);
        });
        return cur;
    }
}
