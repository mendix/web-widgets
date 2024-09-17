const s = x => {
    if (x instanceof Date) {
        return x.toISOString();
    }

    return `${x}`;
};

exports.literal = x => ({
    toString: () => `literal(${s(x)})`
});

exports.attribute = x => ({
    toString: () => `attribute(${s(x)})`
});

exports.equals = (x, y) => ({
    toString: () => `equals(${s(x)},${s(y)})`
});

exports.notEqual = (x, y) => ({
    toString: () => `notEqual(${s(x)},${s(y)})`
});

exports.dayEquals = (x, y) => ({
    toString: () => `dayEquals(${s(x)},${s(y)})`
});

exports.dayNotEqual = (x, y) => ({
    toString: () => `dayNotEqual(${s(x)},${s(y)})`
});

exports.dayGreaterThan = (x, y) => ({
    toString: () => `dayGreaterThan(${s(x)},${s(y)})`
});

exports.dayGreaterThanOrEqual = (x, y) => ({
    toString: () => `dayGreaterThanOrEqual(${s(x)},${s(y)})`
});

exports.dayLessThan = (x, y) => ({
    toString: () => `dayLessThan(${s(x)},${s(y)})`
});

exports.dayLessThanOrEqual = (x, y) => ({
    toString: () => `dayLessThanOrEqual(${s(x)},${s(y)})`
});
