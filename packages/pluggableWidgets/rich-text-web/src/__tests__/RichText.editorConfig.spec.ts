import { Properties } from "@mendix/pluggable-widgets-tools";
import { RichTextPreviewProps } from "../../typings/RichTextProps";
import { getPreview, getProperties } from "../RichText.editorConfig";

// The SVG jest transformer does not yield data URIs, so provide minimal ones carrying the
// placeholder label that getPreview substitutes.
jest.mock("../assets/rich-text-preview-light.svg", () => ({
    __esModule: true,
    default: "data:image/svg+xml,%3Csvg%3ELIGHT%20%5BNo%20attribute%20selected%5D%3C%2Fsvg%3E"
}));
jest.mock("../assets/rich-text-preview-dark.svg", () => ({
    __esModule: true,
    default: "data:image/svg+xml,%3Csvg%3EDARK%20%5BNo%20attribute%20selected%5D%3C%2Fsvg%3E"
}));

const ALL_KEYS = [
    "stringAttribute",
    "enableStatusBar",
    "preset",
    "toolbarLocation",
    "readOnlyStyle",
    "widthUnit",
    "width",
    "heightUnit",
    "height",
    "minHeightUnit",
    "minHeight",
    "maxHeightUnit",
    "maxHeight",
    "OverflowY",
    "onChange",
    "onFocus",
    "onBlur",
    "onLoad",
    "onChangeType",
    "spellCheck",
    "linkValidation",
    "defaultFontFamily",
    "defaultFontSize",
    "customFonts",
    "imageSource",
    "imageSourceContent",
    "enableDefaultUpload",
    "statusBarContent",
    "styleDataFormat",
    "dialogStyle",
    "toolbarConfig",
    "history",
    "fontStyle",
    "fontScript",
    "list",
    "indent",
    "embed",
    "align",
    "code",
    "fontColor",
    "header",
    "view",
    "remove",
    "tableBetter",
    "helpButton",
    "advancedConfig"
] as const;

const TOOLBAR_GROUP_KEYS = [
    "history",
    "fontStyle",
    "fontScript",
    "fontColor",
    "list",
    "indent",
    "embed",
    "align",
    "code",
    "header",
    "remove",
    "view",
    "tableBetter",
    "helpButton"
];

const HEIGHT_LIMIT_KEYS = ["minHeight", "minHeightUnit", "maxHeight", "maxHeightUnit", "OverflowY"];

function defaultValues(overrides: Partial<RichTextPreviewProps> = {}): RichTextPreviewProps {
    return {
        readOnly: false,
        renderMode: "design",
        translate: (text: string) => text,
        stringAttribute: "Content",
        enableStatusBar: true,
        preset: "custom",
        toolbarLocation: "auto",
        readOnlyStyle: "text",
        widthUnit: "percentage",
        width: 100,
        heightUnit: "percentageOfWidth",
        height: 75,
        minHeightUnit: "pixels",
        minHeight: 75,
        maxHeightUnit: "pixels",
        maxHeight: 300,
        OverflowY: "auto",
        onChange: {},
        onFocus: null,
        onBlur: null,
        onLoad: null,
        onChangeType: "onLeave",
        spellCheck: true,
        linkValidation: true,
        defaultFontFamily: "",
        defaultFontSize: "",
        customFonts: [],
        imageSource: { type: "Image" },
        imageSourceContent: { widgetCount: 0, renderer: () => null },
        enableDefaultUpload: true,
        statusBarContent: "wordCount",
        styleDataFormat: "inline",
        dialogStyle: "inline",
        toolbarConfig: "basic",
        history: true,
        fontStyle: true,
        fontScript: true,
        list: true,
        indent: true,
        embed: true,
        align: true,
        code: true,
        fontColor: true,
        header: true,
        view: true,
        remove: true,
        tableBetter: false,
        helpButton: true,
        advancedConfig: [],
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

function hiddenKeys(overrides: Partial<RichTextPreviewProps> = {}): string[] {
    const properties = getProperties(defaultValues(overrides), allProperties());
    const visible = properties[0].propertyGroups![0].properties!.map(prop => prop.key);
    return ALL_KEYS.filter(key => !visible.includes(key));
}

/** Keys hidden by `overrides` on top of what the default fixture already hides. */
function newlyHidden(overrides: Partial<RichTextPreviewProps>): string[] {
    const baseline = hiddenKeys();
    return hiddenKeys(overrides).filter(key => !baseline.includes(key));
}

// Contract: getProperties hides Studio Pro properties that have no effect for the current
// configuration, and getPreview renders the editor image plus an image-source dropzone only
// when an image source is configured.
describe("RichText editor config", () => {
    describe("getProperties", () => {
        it("hides only height and advancedConfig for the default fixture", () => {
            // custom preset + basic toolbar config + percentageOfWidth height
            expect(hiddenKeys()).toEqual(["height", "advancedConfig"]);
        });

        describe("preset", () => {
            it.each(["basic", "standard", "full"] as const)("hides toolbar configuration for the %s preset", preset => {
                expect(hiddenKeys({ preset })).toEqual(
                    expect.arrayContaining([...TOOLBAR_GROUP_KEYS, "toolbarConfig", "advancedConfig"])
                );
                expect(newlyHidden({ preset }).sort()).toEqual([...TOOLBAR_GROUP_KEYS, "toolbarConfig"].sort());
            });

            it("shows the toolbar groups for a custom preset with the basic toolbar config", () => {
                const hidden = hiddenKeys({ preset: "custom", toolbarConfig: "basic" });
                TOOLBAR_GROUP_KEYS.forEach(key => expect(hidden).not.toContain(key));
                expect(hidden).not.toContain("toolbarConfig");
            });
        });

        describe("toolbarConfig", () => {
            it("hides the toolbar groups but shows advancedConfig for the advanced config", () => {
                const hidden = hiddenKeys({ toolbarConfig: "advanced" });
                expect([...newlyHidden({ toolbarConfig: "advanced" })].sort()).toEqual([...TOOLBAR_GROUP_KEYS].sort());
                expect(hidden).not.toContain("advancedConfig");
            });
        });

        describe("height", () => {
            it("hides height but keeps height limits for percentage of width", () => {
                const hidden = hiddenKeys({ heightUnit: "percentageOfWidth" });
                expect(hidden).toContain("height");
                HEIGHT_LIMIT_KEYS.forEach(key => expect(hidden).not.toContain(key));
            });

            it.each(["pixels", "percentageOfParent", "percentageOfView"] as const)(
                "shows height and hides height limits for %s",
                heightUnit => {
                    const hidden = hiddenKeys({ heightUnit });
                    expect(hidden).not.toContain("height");
                    expect(hidden).toEqual(expect.arrayContaining(HEIGHT_LIMIT_KEYS));
                }
            );

            it("hides minHeight when minHeightUnit is none", () => {
                const hidden = hiddenKeys({ minHeightUnit: "none" });
                expect(hidden).toContain("minHeight");
                expect(hidden).not.toContain("minHeightUnit");
            });

            it("hides maxHeight and OverflowY when maxHeightUnit is none", () => {
                const hidden = hiddenKeys({ maxHeightUnit: "none" });
                expect(hidden).toEqual(expect.arrayContaining(["maxHeight", "OverflowY"]));
                expect(hidden).not.toContain("maxHeightUnit");
            });
        });

        describe("events", () => {
            it("hides onChangeType when no onChange action is set", () => {
                expect(newlyHidden({ onChange: null })).toEqual(["onChangeType"]);
            });

            it("shows onChangeType when an onChange action is set", () => {
                expect(hiddenKeys({ onChange: {} })).not.toContain("onChangeType");
            });
        });

        describe("toolbarLocation", () => {
            it("hides preset when the toolbar is hidden", () => {
                expect(newlyHidden({ toolbarLocation: "hide" })).toEqual(["preset"]);
            });

            it.each(["auto", "top", "bottom"] as const)("shows preset for %s", toolbarLocation => {
                expect(hiddenKeys({ toolbarLocation })).not.toContain("preset");
            });
        });

        describe("imageSource", () => {
            it("hides image source content and default upload without an image source", () => {
                expect(newlyHidden({ imageSource: null })).toEqual(["imageSourceContent", "enableDefaultUpload"]);
            });

            it("shows image source content and default upload with an image source", () => {
                const hidden = hiddenKeys({ imageSource: { type: "Image" } });
                expect(hidden).not.toContain("imageSourceContent");
                expect(hidden).not.toContain("enableDefaultUpload");
            });
        });

        describe("status bar", () => {
            it("hides statusBarContent when the status bar is disabled", () => {
                expect(newlyHidden({ enableStatusBar: false })).toEqual(["statusBarContent"]);
            });

            it("shows statusBarContent when the status bar is enabled", () => {
                expect(hiddenKeys({ enableStatusBar: true })).not.toContain("statusBarContent");
            });
        });
    });

    describe("getPreview", () => {
        it("renders only the editor image without an image source", () => {
            const preview = getPreview(defaultValues({ imageSource: null }), false) as any;

            expect(preview.type).toBe("Container");
            expect(preview.children).toHaveLength(1);
            expect(preview.children[0].children[0]).toEqual(expect.objectContaining({ type: "Image", height: 150 }));
        });

        it("adds an image-source dropzone when an image source is set", () => {
            const values = defaultValues({ imageSource: { type: "Image" } });
            const preview = getPreview(values, false) as any;

            expect(preview.children).toHaveLength(2);
            const dropzoneRow = preview.children[1];
            expect(dropzoneRow).toEqual(expect.objectContaining({ type: "RowLayout", borders: true }));
            expect(dropzoneRow.children[0]).toEqual(
                expect.objectContaining({
                    type: "DropZone",
                    property: values.imageSourceContent,
                    placeholder: "Place image selection widget here"
                })
            );
        });

        it("labels the preview image with the selected attribute", () => {
            const preview = getPreview(defaultValues({ stringAttribute: "Description" }), false) as any;

            expect(preview.children[0].children[0].document).toBe("<svg>LIGHT [Description]</svg>");
        });

        it("keeps the placeholder label when no attribute is selected", () => {
            const preview = getPreview(defaultValues({ stringAttribute: "" }), false) as any;

            expect(preview.children[0].children[0].document).toBe("<svg>LIGHT [No attribute selected]</svg>");
        });

        it("uses the dark variant in dark mode", () => {
            const preview = getPreview(defaultValues({ stringAttribute: "Description" }), true) as any;

            expect(preview.children[0].children[0].document).toBe("<svg>DARK [Description]</svg>");
        });
    });
});
