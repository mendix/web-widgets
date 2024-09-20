exports.literal = x => ({
    type: "literal",
    value: x,
    valueType: (value => {
        if (value === undefined) {
            return "undefined";
        }
        switch (value.constructor.name) {
            case "String":
                return "String";
            case "Number":
            case "Big":
                return "Numeric";
            case "Boolean":
                return "boolean";
            case "Date":
                return "DateTime";
            case "Object":
                return "Reference";
            case "Array":
                return "ReferenceSet";
            default:
                return "undefined";
        }
    })(x)
});

exports.attribute = x => ({
    type: "attribute",
    attributeId: x
});

exports.equals = (x, y) => ({
    type: "function",
    name: "=",
    arg1: x,
    arg2: y
});

exports.notEqual = (x, y) => ({
    type: "function",
    name: "!=",
    arg1: x,
    arg2: y
});

exports.dayEquals = (x, y) => ({
    type: "function",
    name: "day:=",
    arg1: x,
    arg2: y
});

exports.dayNotEqual = (x, y) => ({
    type: "function",
    name: "day:!=",
    arg1: x,
    arg2: y
});

exports.dayGreaterThan = (x, y) => ({
    type: "function",
    name: "day:>",
    arg1: x,
    arg2: y
});

exports.dayGreaterThanOrEqual = (x, y) => ({
    type: "function",
    name: "day:>=",
    arg1: x,
    arg2: y
});

exports.dayLessThan = (x, y) => ({
    type: "function",
    name: "day:<",
    arg1: x,
    arg2: y
});

exports.dayLessThanOrEqual = (x, y) => ({
    type: "function",
    name: "day:<=",
    arg1: x,
    arg2: y
});

exports.or = (...args) => ({
    type: "function",
    name: "or",
    args
});

exports.and = (...args) => ({
    type: "function",
    name: "and",
    args
});
