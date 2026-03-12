import { LogLevelEnum } from "../../typings/BarcodeGeneratorProps";

export function printError(message: string, logLevel: LogLevelEnum) {
    if (logLevel === "Debug") {
        console.error(`[Barcode Generator] ${message}`);
    }
}
