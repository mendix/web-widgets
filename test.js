const mobx = require("mobx");

const x = {};
const y = {};

class F {
    value = [x, y];
    constructor() {
        mobx.makeObservable(this, {
            value: mobx.observable.struct
        });
    }

    setValue(value) {
        this.value = value;
    }
}

const f = new F();

mobx.autorun(() => console.log("autorun", f.value));

console.log("1");
f.value = [x, y];
console.log("2");
f.value = [x];
console.log("3");
f.value = [x];
console.log("4");
f.value = [x, y];
console.log(Array.isArray(f.value), mobx.isObservable(f.value[0]));
