export class OutOfProviderError extends Error {
    constructor() {
        super("The Drop-down filter widget must be placed inside the header of the Data grid 2.0 or Gallery widget.");
    }
}

export class ConfigurationError extends Error {}

export class AttributeTypeError extends Error {
    constructor() {
        super("The attribute type being used for Drop-down filter is not 'Boolean or Enumeration'.");
    }
}

export type FilterError = OutOfProviderError | ConfigurationError | AttributeTypeError;
