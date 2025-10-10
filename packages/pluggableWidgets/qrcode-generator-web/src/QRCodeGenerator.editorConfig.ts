import { QRCodeGeneratorPreviewProps } from "../typings/QRCodeGeneratorProps";

export type Problem = {
    property?: string; // key of the property, at which the problem exists
    severity?: "error" | "warning" | "deprecation"; // default = "error"
    message: string; // description of the problem
    studioMessage?: string; // studio-specific message, defaults to message
    url?: string; // link with more information about the problem
    studioUrl?: string; // studio-specific link
};

export function check(_values: QRCodeGeneratorPreviewProps): Problem[] {
    const errors: Problem[] = [];

    if (!_values.qrSize || _values.qrSize < 50) {
        errors.push({
            property: `qrSize`,
            severity: "error",
            message: `The value of 'QR Code Size' may not be smaller than 50px.`
        });
    }

    return errors;
}
