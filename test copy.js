const mobx = require("mobx");

class F {
    value = new Set([1, 2, 3]);
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

mobx.autorun(() => console.log("autorun", [f.value]));

console.log("1");
f.value = f.value;
console.log("2");
f.value.delete(1);
console.log("3");
f.value = f.value.filter((x) => true);
// console.log("4");
// f.value = [x, y];
console.log("end");
// console.log(Array.isArray(f.value), mobx.isObservable(f.value[0]));
