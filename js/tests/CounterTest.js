var increment = function (v) { return mapPath("counter", function (x) { return x + 1; }); };
var decrement = function (v) { return mapPath("counter", function (x) { return x - 1; }); };
describe("Test a counter store", function () {
    it("should process state changes for a counter", function () {
        var store = updeepStore({ counter: 0 });
        store.dispatch(increment);
    });
});
