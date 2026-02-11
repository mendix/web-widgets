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

function validateCodeValues(values: BarcodeGeneratorPreviewProps): Problem[] {
    const problems: Problem[] = [];
    const val = values.codeValue ?? "";
    const addon = values.addonValue ?? "";
    const format = getActiveFormat(values);

    // Only validate static (design-time) values — if empty, skip (user may bind dynamically)
    if (!val) {
        // still validate addon if present
    } else {
        const result = validateBarcodeValue(format, val);
        if (!result.valid) {
            const msg = result.message || "Invalid barcode value for selected format.";
            problems.push({ property: "codeValue", severity: "warning", message: msg });
        }
    }

    // Validate addon value if visible
    const addonResult = validateAddonValue(values.addonFormat, addon);
    if (!addonResult.valid) {
        const msg = addonResult.message || "Invalid addon value.";
        problems.push({ property: "addonValue", severity: "warning", message: msg });
    }

    return problems;
}
