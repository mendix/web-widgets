export type ValidationResult = {
    valid: boolean;
    // `message` is a plain, non-localized message shown in Studio if validation fails.
    message?: string;
};

/** Validate barcode value for a given format. */
export function validateBarcodeValue(format: string, value: string): ValidationResult {
    // If no value is present at design time, assume dynamic binding will provide it at runtime.
    if (!value) {
        return { valid: true };
    }

    switch (format) {
        case "EAN13":
            // EAN-13: numeric only; allow 12 (data) or 13 (data+checksum) digits
            if (!/^[0-9]+$/.test(value) || !(value.length === 12 || value.length === 13)) {
                return {
                    valid: false,
                    message: "EAN-13 requires 12 or 13 numeric digits (12 data digits + optional checksum)."
                };
            }
            return { valid: true };
        case "EAN8":
            // EAN-8: numeric only; allow 7 (data) or 8 (with checksum)
            if (!/^[0-9]+$/.test(value) || !(value.length === 7 || value.length === 8)) {
                return {
                    valid: false,
                    message: "EAN-8 requires 7 or 8 numeric digits (7 data digits + optional checksum)."
                };
            }
            return { valid: true };
        case "UPC":
            // UPC: numeric only; allow 11 (data) or 12 (data+checksum) digits
            if (!/^[0-9]+$/.test(value) || !(value.length === 11 || value.length === 12)) {
                return {
                    valid: false,
                    message: "UPC requires 11 or 12 numeric digits (11 data digits + optional checksum)."
                };
            }
            return { valid: true };
        case "ITF14":
            // ITF-14: numeric only; must be exactly 14 digits
            if (!/^[0-9]+$/.test(value) || value.length !== 14) {
                return { valid: false, message: "ITF-14 requires exactly 14 numeric digits." };
            }
            return { valid: true };
        case "CODE39":
            // CODE39: uppercase letters, digits, space and - . $ / + % allowed
            if (value.length > 43) {
                return {
                    valid: false,
                    message: "CODE39 supports up to 43 characters for readability."
                };
            }
            if (!/^[0-9A-Z .$/+%-]+$/.test(value)) {
                return {
                    valid: false,
                    message: "CODE39 supports only uppercase A-Z, digits, space and - . $ / + % characters."
                };
            }
            return { valid: true };
        case "MSI":
            // MSI: numeric only
            if (value.length > 30) {
                return {
                    valid: false,
                    message: "MSI supports up to 30 digits for readability."
                };
            }
            if (!/^[0-9]+$/.test(value)) {
                return { valid: false, message: "MSI requires numeric digits only." };
            }
            return { valid: true };
        case "pharmacode":
            // Pharmacode: numeric only
            if (value.length > 7) {
                return {
                    valid: false,
                    message: "Pharmacode supports up to 7 digits for readability."
                };
            }
            if (!/^[0-9]+$/.test(value)) {
                return { valid: false, message: "Pharmacode requires numeric digits only." };
            }
            return { valid: true };
        case "codabar":
            // Codabar: digits and A-D (start/stop) plus - $ : / . + allowed
            if (value.length > 20) {
                return {
                    valid: false,
                    message: "Codabar supports up to 20 characters for readability."
                };
            }
            if (!/^[0-9A-Da-d$:/.+-]+$/.test(value)) {
                return { valid: false, message: "Codabar allows digits, A-D start/stop characters and - $ : / . +." };
            }
            return { valid: true };
        case "CODE93":
            // CODE93: supports a wide ASCII set — basic check: no control characters
            if (value.length > 47) {
                return {
                    valid: false,
                    message: "CODE93 supports up to 47 characters for readability."
                };
            }
            if (/\p{Cc}/u.test(value)) {
                return { valid: false, message: "CODE93 should not contain control characters." };
            }
            return { valid: true };
        case "QRCode":
            // QRCode: accepts most characters, but warn for extremely long static values
            if (value.length > 1200) {
                return {
                    valid: false,
                    message:
                        "The QR code value is very long; consider using a shorter value or a dynamic attribute to avoid rendering issues."
                };
            }
            return { valid: true };
        case "CODE128":
        default:
            // CODE128: flexible charset but disallow control characters as a basic sanity check
            if (value.length > 80) {
                return {
                    valid: false,
                    message: "CODE128 supports up to 80 characters for readability."
                };
            }
            if (/\p{Cc}/u.test(value)) {
                return { valid: false, message: "CODE128 should not contain control characters." };
            }
            return { valid: true };
    }
}

/** Validate addon (EAN-5 / EAN-2) values. */
export function validateAddonValue(addonFormat: string | null | undefined, value: string): ValidationResult {
    if (!addonFormat || addonFormat === "None") {
        return { valid: true };
    }

    if (addonFormat === "EAN5") {
        // EAN-5: exactly 5 numeric digits
        if (!/^[0-9]{5}$/.test(value)) {
            return { valid: false, message: "EAN-5 addon requires exactly 5 numeric digits." };
        }
        return { valid: true };
    }

    if (addonFormat === "EAN2") {
        // EAN-2: exactly 2 numeric digits
        if (!/^[0-9]{2}$/.test(value)) {
            return { valid: false, message: "EAN-2 addon requires exactly 2 numeric digits." };
        }
        return { valid: true };
    }

    return { valid: true };
}
