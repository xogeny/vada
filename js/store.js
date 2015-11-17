var SubStore = (function () {
    function SubStore(store, smap) {
        this.store = store;
        this.smap = smap;
    }
    SubStore.prototype.getState = function () {
        var parentState = this.store.getState();
        var childState = this.smap(parentState);
        return childState;
    };
    SubStore.prototype.subscribe = function (listener) {
        return this.store.subscribe(listener);
    };
    return SubStore;
})();
exports.SubStore = SubStore;
