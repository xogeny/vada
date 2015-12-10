import _ = require('lodash');

export type Path = Array<string|number>;

export function get(path: Path, v: any): any {
    'use strict';
    if (path.length===0) {
        return v;
    }
    if (_.isObject(v)) {
        return _.get(v, path);
    }
    throw Error("Unable to get "+path+" in "+v);
}
