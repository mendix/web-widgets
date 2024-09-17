const s = x => JSON.stringify(x);

exports.literal = x => ({
    toString: () => `literal(${s(x)})`
});

exports.attribute = x => ({
    toString: () => `attribute(${s(x)})`
});

exports.equals = (x, y) => ({
    toString: () => `equals(${x},${y})`
});

exports.notEqual = (x, y) => ({
    toString: () => `notEqual(${x},${y})`
});

exports.dayEquals = (x, y) => ({
    toString: () => `dayEquals(${x},${y})`
});

exports.dayNotEqual = (x, y) => ({
    toString: () => `dayNotEqual(${x},${y})`
});

exports.dayGreaterThan = (x, y) => ({
    toString: () => `dayGreaterThan(${x},${y})`
});

exports.dayGreaterThanOrEqual = (x, y) => ({
    toString: () => `dayGreaterThanOrEqual(${x},${y})`
});

exports.dayLessThan = (x, y) => ({
    toString: () => `dayLessThan(${x},${y})`
});

exports.dayLessThanOrEqual = (x, y) => ({
    toString: () => `dayLessThanOrEqual(${x},${y})`
});

exports.or = (...args) => ({
    toString: () => `or(${args.map(arg => `${arg}`).join(",")})`
});

exports.and = (...args) => ({
    toString: () => `and(${args.map(arg => `${arg}`).join(",")})`
});
