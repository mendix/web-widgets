export class OutOfContextError extends Error {
    constructor() {
        super("Component is used out of context provider");
    }
}

export class ValueIsMissingError extends Error {
    constructor(m = "Value is missing in context") {
        super(m);
    }
}
