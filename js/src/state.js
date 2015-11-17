var updeep = require('updeep');
var redux_1 = require('redux');
var actions = require('./actions');
function updeepReducer(state0) {
    return function (state, action) {
        if (state === void 0) { state = state0; }
        switch (action.type) {
            case actions.UPDEEP_SET_PATH:
                var a = action;
                return updeep.updateIn(a.payload.path, a.payload.v, state);
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
