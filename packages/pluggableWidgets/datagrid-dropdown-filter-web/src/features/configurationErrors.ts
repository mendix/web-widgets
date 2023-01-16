import { ConfigurationError } from "./errors";

export const attributeNotFound = (): ConfigurationError =>
    new ConfigurationError("Can't find attribute: the attribute for filter is not configured or can't be found.");

export const invalidOptionValue = (caption: string): ConfigurationError =>
    new ConfigurationError(
        `Invalid option (${caption || "Unknown"}): option has invalid value and can't be used with attribute(s)`
    );

export const requiredAttributesNotFound = (): ConfigurationError =>
    new ConfigurationError(
        [
            "Missing required attribute(s):",
            "the Drop-down filter widget can't be used with the filters options you have selected.",
            "It requires a 'Boolean or Enumeration' attribute to be selected."
        ].join(" ")
    );
