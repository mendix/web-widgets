import { Properties } from "@mendix/pluggable-widgets-tools";
import { BarcodeGeneratorPreviewProps } from "../../typings/BarcodeGeneratorProps";
import { check, getProperties } from "../BarcodeGenerator.editorConfig";

const ALL_KEYS = [
    "codeValue",
    "codeFormat",
    "emptyMessage",
    "allowDownload",
    "downloadButtonCaption",
    "downloadButtonAriaLabel",
    "downloadFileName",
    "buttonPosition",
    "customCodeFormat",
    "enableEan128",
    "enableFlat",
    "lastChar",
    "enableMod43",
    "addonFormat",
    "addonValue",
    "addonSpacing",
    "qrLevel",
    "qrSize",
    "dmGs1Mode",
    "dmShape",
    "dmSize",
    "logLevel",
    "displayValue",
    "showAsCard",
    "codeWidth",
    "codeHeight",
    "codeMargin",
    "qrMargin",
    "dmMargin",
    "qrTitle",
    "showTitle",
    "qrOverlay",
    "qrOverlaySrc",
    "qrOverlayCenter",
    "qrOverlayX",
    "qrOverlayY",
    "qrOverlayHeight",
    "qrOverlayWidth",
    "qrOverlayOpacity",
    "qrOverlayExcavate"
] as const;

function defaultValues(overrides: Partial<BarcodeGeneratorPreviewProps> = {}): BarcodeGeneratorPreviewProps {
    return {
        className: "",
        class: "",
        style: "",
        readOnly: false,
        renderMode: "design",
        translate: (text: string) => text,
        codeValue: "",
        codeFormat: "CODE128",
        emptyMessage: "",
        allowDownload: false,
        downloadButtonCaption: "",
        downloadButtonAriaLabel: "",
        downloadFileName: "",
        buttonPosition: "bottom",
        customCodeFormat: "CODE128",
        enableEan128: false,
        enableFlat: false,
        lastChar: "",
        enableMod43: false,
        addonFormat: "None",
        addonValue: "",
        addonSpacing: 20,
        qrLevel: "L",
        qrSize: 128,
        dmGs1Mode: false,
        dmShape: "square",
        dmSize: 128,
        logLevel: "None",
        displayValue: false,
        showAsCard: false,
        codeWidth: 2,
        codeHeight: 200,
        codeMargin: 2,
        qrMargin: 2,
        dmMargin: 2,
        qrTitle: "QR Code",
        showTitle: false,
        qrOverlay: false,
        qrOverlaySrc: null,
        qrOverlayCenter: true,
        qrOverlayX: 0,
        qrOverlayY: 0,
        qrOverlayHeight: 24,
        qrOverlayWidth: 24,
        qrOverlayOpacity: 1,
        qrOverlayExcavate: true,
        ...overrides
    };
}

/** Mirrors the XML property tree as a flat group so `hidePropertiesIn` can splice from it. */
function allProperties(): Properties {
    return [
        {
            caption: "All",
            propertyGroups: [
                {
                    caption: "Flat",
                    properties: ALL_KEYS.map(key => ({ key, caption: key, description: "", type: "string" }))
                }
            ]
        }
    ];
}

function visibleKeys(overrides: Partial<BarcodeGeneratorPreviewProps> = {}): string[] {
    const values = defaultValues(overrides);
    const properties = getProperties(values, allProperties());
    return properties[0].propertyGroups![0].properties!.map(prop => prop.key);
}

describe("BarcodeGenerator editor config", () => {
    describe("Data Matrix settings", () => {
        const dataMatrixKeys = ["dmGs1Mode", "dmShape", "dmSize", "dmMargin"];

        it("shows Data Matrix settings for the Data Matrix format", () => {
            expect(visibleKeys({ codeFormat: "DataMatrix" })).toEqual(expect.arrayContaining(dataMatrixKeys));
        });

        it.each(["CODE128", "QRCode", "Custom"] as const)("hides Data Matrix settings for %s", codeFormat => {
            const visible = visibleKeys({ codeFormat });
            dataMatrixKeys.forEach(key => expect(visible).not.toContain(key));
        });
    });

    describe("barcode-only settings", () => {
        it("hides bar sizing, human-readable value and the pixel margin for Data Matrix", () => {
            const visible = visibleKeys({ codeFormat: "DataMatrix" });
            expect(visible).not.toContain("codeWidth");
            expect(visible).not.toContain("codeHeight");
            expect(visible).not.toContain("displayValue");
            // Data Matrix has its own margin in module units
            expect(visible).not.toContain("codeMargin");
            expect(visible).not.toContain("qrMargin");
            expect(visible).toContain("dmMargin");
        });

        it("hides advanced barcode settings for Data Matrix", () => {
            const visible = visibleKeys({ codeFormat: "DataMatrix" });
            [
                "enableEan128",
                "enableFlat",
                "lastChar",
                "enableMod43",
                "addonFormat",
                "addonValue",
                "addonSpacing"
            ].forEach(key => expect(visible).not.toContain(key));
        });

        it("hides QR settings for Data Matrix", () => {
            const visible = visibleKeys({ codeFormat: "DataMatrix" });
            ["qrOverlay", "qrSize", "qrMargin", "qrLevel", "qrTitle", "showTitle"].forEach(key =>
                expect(visible).not.toContain(key)
            );
        });

        it("keeps EAN-128 for CODE128 and custom CODE128 only", () => {
            expect(visibleKeys({ codeFormat: "CODE128" })).toContain("enableEan128");
            expect(visibleKeys({ codeFormat: "Custom", customCodeFormat: "CODE128" })).toContain("enableEan128");
            expect(visibleKeys({ codeFormat: "Custom", customCodeFormat: "EAN13" })).not.toContain("enableEan128");
        });

        it("keeps Mod43 for custom CODE39 only", () => {
            expect(visibleKeys({ codeFormat: "Custom", customCodeFormat: "CODE39" })).toContain("enableMod43");
            expect(visibleKeys({ codeFormat: "CODE128" })).not.toContain("enableMod43");
        });

        it("keeps EAN addons for EAN-13, EAN-8 and UPC only", () => {
            expect(visibleKeys({ codeFormat: "Custom", customCodeFormat: "EAN13" })).toContain("addonFormat");
            expect(visibleKeys({ codeFormat: "Custom", customCodeFormat: "CODE93" })).not.toContain("addonFormat");
        });
    });

    describe("check", () => {
        it("validates Data Matrix size instead of bar sizing", () => {
            const problems = check(
                defaultValues({ codeFormat: "DataMatrix", dmSize: 10, codeHeight: 0, codeWidth: 0 })
            );
            expect(problems).toHaveLength(1);
            expect(problems[0].property).toBe("dmSize");
        });

        it("warns when the Data Matrix quiet zone is dropped", () => {
            const problems = check(defaultValues({ codeFormat: "DataMatrix", dmMargin: 0 }));
            expect(problems).toEqual([expect.objectContaining({ property: "dmMargin", severity: "warning" })]);
        });

        it("reports QR size problems on the qrSize property", () => {
            const problems = check(defaultValues({ codeFormat: "QRCode", qrSize: 10 }));
            expect(problems.map(problem => problem.property)).toContain("qrSize");
        });

        it("flags malformed GS1 values at design time", () => {
            const problems = check(
                defaultValues({ codeFormat: "DataMatrix", dmGs1Mode: true, codeValue: '"not-gs1"' })
            );
            expect(problems.some(problem => problem.property === "codeValue")).toBe(true);
        });

        it("accepts well-formed GS1 values", () => {
            const problems = check(
                defaultValues({
                    codeFormat: "DataMatrix",
                    dmGs1Mode: true,
                    codeValue: '"(01)09501101020917(17)261231(10)ABC123"'
                })
            );
            expect(problems).toHaveLength(0);
        });
    });
});
