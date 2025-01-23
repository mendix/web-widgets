enum Code {
    EMISSINGSTORE = 2,
    ENOCONTEXT = 1,
    ESTORETYPE = 3,
    EKEYMISSING = 7,
    OPTIONS_NOT_FILTERABLE = 8
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

export const EStoreTypeMisMatch = (filterType: string, receivedStoreType: string): APIError => {
    return Object.freeze({
        code: Code.ESTORETYPE,
        message: `The ${filterType} is not compatible with ${receivedStoreType} data type.`
    });
};

export const EKEYMISSING: APIError = Object.freeze({
    code: Code.EKEYMISSING,
    message: "The key for filter is missing."
});

export const OPTIONS_NOT_FILTERABLE: APIError = Object.freeze({
    code: Code.OPTIONS_NOT_FILTERABLE,
    message:
        "Drop-down options can't be filtered with current column configuration. To enable filtering, change 'Option caption type'  to 'Attribute' in column settings."
});
