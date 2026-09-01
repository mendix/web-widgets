import { Big } from "big.js";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { BarcodeGeneratorContainerProps } from "../../../typings/BarcodeGeneratorProps";
import { barcodeConfig, DataMatrixTypeConfig } from "../Barcode.config";

function props(overrides: Partial<BarcodeGeneratorContainerProps> = {}): BarcodeGeneratorContainerProps {
    return {
        name: "bg1",
        class: "",
        tabIndex: -1,
        codeValue: dynamic.available("ABC123"),
        codeFormat: "DataMatrix",
        customCodeFormat: "CODE128",
        enableEan128: false,
        enableFlat: false,
        lastChar: "",
        enableMod43: false,
        allowDownload: false,
        buttonPosition: "bottom",
        addonFormat: "None",
        addonValue: dynamic.available(""),
        addonSpacing: 20,
        displayValue: false,
        showAsCard: false,
        codeWidth: 2,
        codeHeight: 200,
        codeMargin: 4,
        qrSize: 128,
        qrMargin: 2,
        dmGs1Mode: false,
        dmShape: "square",
        dmSize: 128,
        dmMargin: 2,
        qrTitle: dynamic.available("QR"),
        qrLevel: "L",
        qrOverlay: false,
        qrOverlaySrc: dynamic.available({ uri: "" } as any),
        qrOverlayCenter: true,
        qrOverlayX: 0,
        qrOverlayY: 0,
        qrOverlayHeight: 24,
        qrOverlayWidth: 24,
        qrOverlayOpacity: new Big(1),
        qrOverlayExcavate: true,
        logLevel: "None",
        ...overrides
    } as BarcodeGeneratorContainerProps;
}

describe("barcodeConfig - DataMatrix", () => {
    it("maps DataMatrix format to a datamatrix config", () => {
        const config = barcodeConfig(props()) as DataMatrixTypeConfig;
        expect(config.type).toBe("datamatrix");
        expect(config.codeValue).toBe("ABC123");
        expect(config.size).toBe(128);
        expect(config.shape).toBe("square");
        expect(config.gs1Mode).toBe(false);
    });

    it("carries GS1 mode and rectangular shape", () => {
        const config = barcodeConfig(props({ dmGs1Mode: true, dmShape: "rectangle" })) as DataMatrixTypeConfig;
        expect(config.gs1Mode).toBe(true);
        expect(config.shape).toBe("rectangle");
    });

    it("uses dmMargin for the DataMatrix margin, not the 1D or QR margin", () => {
        const config = barcodeConfig(props({ dmMargin: 6, codeMargin: 4, qrMargin: 8 })) as DataMatrixTypeConfig;
        expect(config.margin).toBe(6);
    });

    it("falls back to a default margin when dmMargin is unset", () => {
        const config = barcodeConfig(props({ dmMargin: null as any })) as DataMatrixTypeConfig;
        expect(config.margin).toBe(2);
    });

    it("keeps the pixel margin for 1D barcodes and the module margin for QR", () => {
        expect(barcodeConfig(props({ codeFormat: "CODE128", codeMargin: 4 })).margin).toBe(4);
        expect(barcodeConfig(props({ codeFormat: "QRCode", qrMargin: 8 })).margin).toBe(8);
    });

    it("does not route non-DataMatrix formats to datamatrix", () => {
        expect(barcodeConfig(props({ codeFormat: "QRCode" })).type).toBe("qrcode");
        expect(barcodeConfig(props({ codeFormat: "CODE128" })).type).toBe("barcode");
    });
});
