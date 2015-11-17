var updeep = require('updeep');
var redux_1 = require('redux');
var access_1 = require('./access');
exports.UPDEEP_SET_PATH = 'UPDEEP_SET_PATH';
exports.setPath = function (path, v) {
    return {
        type: exports.UPDEEP_SET_PATH,
        payload: {
            path: path,
            v: v
        }
    };
};
exports.UPDEEP_MAP_PATH = 'UPDEEP_MAP_PATH';
exports.mapPath = function (path, f) {
    return {
        type: exports.UPDEEP_MAP_PATH,
        payload: {
            path: path,
            f: f
        }
    };
};
function updeepReducer(state0) {
    return function (state, action) {
        if (state === void 0) { state = state0; }
        switch (action.type) {
            case exports.UPDEEP_SET_PATH:
                var pa = action;
                return updeep.updateIn(pa.payload.path, pa.payload.v, state);
            case exports.UPDEEP_MAP_PATH:
                var ma = action;
                var cur = access_1.get(ma.payload.path, state);
                return updeep.updateIn(ma.payload.path, ma.payload.f(cur), state);
            default:
                return state;
        }
    };
}
exports.updeepReducer = updeepReducer;
function updeepStore(state0) {
    return redux_1.createStore(updeepReducer(state0));
}
exports.updeepStore = updeepStore;
