enum Code {
    EMISSINGSTORE = 2,
    ENOCONTEXT = 1,
    ESTORETYPE = 3,
    EKEYMISSING = 7
}

export { Code as APIErrorCode };

export interface APIError {
    code: Code;
    message: string;
}

export const ENOCONTEXT: APIError = Object.freeze({
    code: Code.ENOCONTEXT,
    message:
        "The filter widget must be placed inside the column or header of the Data grid 2.0 or inside header of the Gallery widget."
});

export const EMISSINGSTORE: APIError = Object.freeze({
    code: Code.EMISSINGSTORE,
    message: "Unable to get filter store. Check parent widget configuration."
});

export const ESTORETYPE: APIError = Object.freeze({
    code: Code.ESTORETYPE,
    message:
        "The type of the filter and parent widget configuration is incompatible. The filter must " +
        "be used with correct attribute/group type."
});

export const EKEYMISSING: APIError = Object.freeze({
    code: Code.EKEYMISSING,
    message: "The key for filter is missing."
});
