import { hidePropertiesIn, hidePropertyIn, Properties } from "@mendix/pluggable-widgets-tools";
import { BarcodeGeneratorPreviewProps } from "../typings/BarcodeGeneratorProps";
import { validateAddonValue, validateBarcodeValue } from "./config/validation";

export type Problem = {
    property?: string; // key of the property, at which the problem exists
    severity?: "error" | "warning" | "deprecation"; // default = "error"
    message: string; // description of the problem
    studioMessage?: string; // studio-specific message, defaults to message
    url?: string; // link with more information about the problem
    studioUrl?: string; // studio-specific link
};

export function getProperties(values: BarcodeGeneratorPreviewProps, defaultProperties: Properties): Properties {
    if (values.codeFormat === "QRCode") {
        hidePropertiesIn(defaultProperties, values, ["codeWidth", "codeHeight", "displayValue", "codeMargin"]);
    } else {
        hidePropertiesIn(defaultProperties, values, ["qrImage", "qrSize", "qrMargin", "qrLevel", "qrTitle"]);
    }

    if (values.codeFormat !== "QRCode" || !values.qrImage) {
        hidePropertiesIn(defaultProperties, values, [
            "qrImageSrc",
            "qrImageCenter",
            "qrImageWidth",
            "qrImageHeight",
            "qrImageX",
            "qrImageY",
            "qrImageOpacity",
            "qrImageExcavate"
        ]);
    }

    if (values.codeFormat === "QRCode" || (values.codeFormat !== "CODE128" && values.customCodeFormat !== "CODE128")) {
        hidePropertyIn(defaultProperties, values, "enableEan128");
    }

    if (
        values.codeFormat === "QRCode" ||
        values.codeFormat === "CODE128" ||
        (values.codeFormat === "Custom" &&
            values.customCodeFormat !== "EAN13" &&
            values.customCodeFormat !== "EAN8" &&
            values.customCodeFormat !== "UPC")
    ) {
        hidePropertyIn(defaultProperties, values, "enableFlat");
    }

    if (
        values.codeFormat === "QRCode" ||
        values.codeFormat === "CODE128" ||
        (values.codeFormat === "Custom" && values.customCodeFormat !== "EAN13")
    ) {
        hidePropertyIn(defaultProperties, values, "lastChar");
    }

    if (
        values.codeFormat === "QRCode" ||
        values.codeFormat === "CODE128" ||
        (values.codeFormat === "Custom" && values.customCodeFormat !== "EAN13" && values.customCodeFormat !== "EAN8")
    ) {
        hidePropertiesIn(defaultProperties, values, ["addonFormat", "addonValue", "addonSpacing"]);
    }
    if (
        values.codeFormat === "QRCode" ||
        values.codeFormat === "CODE128" ||
        (values.codeFormat === "Custom" && values.addonFormat !== "EAN5" && values.addonFormat !== "EAN2")
    ) {
        hidePropertiesIn(defaultProperties, values, ["addonValue", "addonSpacing"]);
    }

    if (
        values.codeFormat === "QRCode" ||
        values.codeFormat === "CODE128" ||
        (values.codeFormat === "Custom" && values.customCodeFormat !== "CODE39")
    ) {
        hidePropertyIn(defaultProperties, values, "enableMod43");
    }

    if (values.qrImageCenter) {
        hidePropertiesIn(defaultProperties, values, ["qrImageX", "qrImageY"]);
    }

    if (values.codeFormat !== "Custom") {
        hidePropertiesIn(defaultProperties, values, ["customCodeFormat"]);
    }

    return defaultProperties;
}

export function check(_values: BarcodeGeneratorPreviewProps): Problem[] {
    const errors: Problem[] = [];

    if (!_values.codeWidth || _values.codeWidth < 1) {
        errors.push({
            property: `codeWidth`,
            severity: "error",
            message: `The value of 'Bar width' must be at least 1.`
        });
    }

    if (!_values.codeHeight || _values.codeHeight < 20) {
        errors.push({
            property: `codeHeight`,
            severity: "error",
            message: `The value of 'Code height' must be at least 20.`
        });
    }

    if (!_values.qrSize || _values.qrSize < 50) {
        errors.push({
            property: `codeHeight`,
            severity: "error",
            message: `The value of 'QR size' must be at least 50.`
        });
    }

    // Design-time validation for static barcode value(s)
    const valueProblems = validateCodeValues(_values);
    return errors.concat(valueProblems);
}

function getActiveFormat(values: BarcodeGeneratorPreviewProps): string {
    if (values.codeFormat === "Custom") {
        return values.customCodeFormat || "CODE128";
    }

    return values.codeFormat;
}

function stripQuotes(value: string): string {
    // Remove leading/trailing quotes and whitespace from expression values
    let trimmed = value.trim();
    // Match and remove surrounding quotes (single or double)
    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
        trimmed = trimmed.slice(1, -1);
    }
    return trimmed;
}

function isDynamicExpression(value: string): boolean {
    // Check if the value is a dynamic expression (attribute binding, variable, etc.)
    // Dynamic expressions start with $ or contain / paths or are empty
    return !value || value.startsWith("$") || value.includes("/");
}

function getFormatHint(format: string): string {
    const hints: Record<string, string> = {
        EAN13: "EAN-13 requires 12 or 13 numeric digits",
        EAN8: "EAN-8 requires 7 or 8 numeric digits",
        UPC: "UPC requires 11 or 12 numeric digits",
        ITF14: "ITF-14 requires exactly 14 numeric digits",
        CODE39: "CODE39: uppercase A-Z, digits, space and - . $ / + % (max 43 chars)",
        CODE128: "CODE128: alphanumeric, no control characters (max 80 chars)",
        CODE93: "CODE93: alphanumeric, no control characters (max 47 chars)",
        MSI: "MSI: numeric only (max 30 digits)",
        pharmacode: "Pharmacode: numeric only (max 7 digits)",
        codabar: "Codabar: digits, A-D start/stop, and - $ : / . + (max 20 chars)",
        QRCode: "QR Code: any text (max 1200 chars recommended)"
    };
    return hints[format] || "";
}

function validateCodeValues(values: BarcodeGeneratorPreviewProps): Problem[] {
    const problems: Problem[] = [];
    const rawVal = values.codeValue ?? "";
    const rawAddon = values.addonValue ?? "";
    const format = getActiveFormat(values);

    // Add informational hint for dynamic expressions
    if (isDynamicExpression(rawVal) && rawVal) {
        const hint = getFormatHint(format);
        if (hint) {
            problems.push({
                property: "codeValue",
                severity: "warning",
                message: `Dynamic value provided. Ensure runtime value matches format: ${hint}`
            });
        }
    }

    // Only validate static literal values, skip dynamic expressions (attribute bindings, variables, etc.)
    if (!isDynamicExpression(rawVal)) {
        const val = stripQuotes(rawVal);
        if (val) {
            const result = validateBarcodeValue(format, val);
            if (!result.valid) {
                const msg = result.message || "Invalid barcode value for selected format.";
                problems.push({ property: "codeValue", severity: "error", message: msg });
            }
        }
    }

    // Validate addon value if visible and format is selected
    if (values.addonFormat !== "None") {
        // Add informational hint for dynamic addon expressions
        if (isDynamicExpression(rawAddon) && rawAddon) {
            const addonHint =
                values.addonFormat === "EAN5"
                    ? "EAN-5 addon requires exactly 5 numeric digits"
                    : "EAN-2 addon requires exactly 2 numeric digits";
            problems.push({
                property: "addonValue",
                severity: "warning",
                message: `Dynamic addon value provided. Ensure runtime value matches format: ${addonHint}`
            });
        }

        // Validate static addon values
        if (!isDynamicExpression(rawAddon)) {
            const addon = stripQuotes(rawAddon);
            if (addon) {
                const addonResult = validateAddonValue(values.addonFormat, addon);
                if (!addonResult.valid) {
                    const msg = addonResult.message || "Invalid addon value.";
                    problems.push({ property: "addonValue", severity: "error", message: msg });
                }
            }
        }
    }

    return problems;
}
