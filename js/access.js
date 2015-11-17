var _ = require('lodash');
function get(path, v) {
    if (path.length == 0) {
        return v;
    }
    if (_.isObject(v)) {
        return _.get(v, path);
    }
    throw Error("Unable to get " + path + " in " + v);
}
exports.get = get;
