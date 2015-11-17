var React = require('react');
function bindClass(store, elem, pmap) {
    var unsub = null;
    return React.createClass({
        render: function () {
            var props = pmap(this.state);
            return React.createElement(elem, props);
        },
        componentWillUnmount: function () {
            if (unsub != null) {
                unsub();
            }
        },
        componentDidMount: function () {
            var _this = this;
            unsub = store.subscribe(function () {
                _this.setState(store.getState());
            });
            this.setState(store.getState());
        },
        getInitialState: function () {
            return store.getState();
        }
    });
}
exports.bindClass = bindClass;
