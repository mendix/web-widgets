import { createElement } from "react";
import "@testing-library/jest-dom";
import { RichText } from "../RichText";
import { CKEditorConfig } from "ckeditor4-react";
import { getPreset, defineEnterMode, getToolbarGroupByName, defineAdvancedGroups } from "../../utils/ckeditorConfigs";
import { mount, ReactWrapper } from "enzyme";
import renderer from "react-test-renderer";
import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import { EditableValueBuilder } from "@mendix/widget-plugin-test-utils";
import { TOOLBAR_GROUP, ToolbarGroup } from "../../utils/ckeditorPresets";
import { AdvancedConfigType, RichTextContainerProps } from "../../../typings/RichTextProps";

const defaultRichTextProps: RichTextContainerProps = {
    stringAttribute: new EditableValueBuilder<string>().withValue("Rich text default value").build(),
    sanitizeContent: false,
    advancedContentFilter: "auto",
    name: "RichText_Div",
    spellChecker: false,
    readOnlyStyle: "text",
    editorType: "classic",
    enterMode: "paragraph",
    shiftEnterMode: "paragraph",
    tabIndex: 1,
    advancedMode: false,
    preset: "basic",
    widthUnit: "percentage",
    width: 100,
    heightUnit: "percentageOfWidth",
    height: 75,
    toolbarConfig: "basic",
    documentGroup: true,
    clipboardGroup: true,
    editingGroup: true,
    formsGroup: true,
    separatorGroup: true,
    basicStylesGroup: true,
    insertGroup: false,
    paragraphGroup: true,
    linksGroup: true,
    separator2Group: true,
    stylesGroup: true,
    colorsGroup: true,
    toolsGroup: true,
    othersGroup: true,
    advancedConfig: [],
    codeHighlight: false,
    allowedContent: "",
    disallowedContent: "",
    id: "1.Dev.Test_ListenTo.richText1_x_1"
};

describe("RichText", () => {
    window.mx = {
        remoteUrl: "https://example.com"
    };

    function renderRichText(props = defaultRichTextProps): ReactWrapper {
        return mount(<RichText {...props} />);
    }

    it("render DOM structure", () => {
        const richText = renderer.create(<RichText {...defaultRichTextProps} />).toJSON();
        expect(richText).toMatchSnapshot();
    });

    it("renders dom elements with correct props", () => {
        const richText = renderRichText();
        expect(richText).toBeDefined();
        expect(richText.find(`#${defaultRichTextProps.name}`)).toBeDefined();

        const richTextElement = richText.find(".widget-rich-text");
        expect(richTextElement?.getElements().length).toBeGreaterThan(0);

        const styleProps = richTextElement.getElements()[0].props.style;
        const dimensions = getDimensions(defaultRichTextProps);
        expect(styleProps.width).toEqual(dimensions.width);
        expect(styleProps.height).toEqual(dimensions.height);

        expect(richText.find(`.editor-${defaultRichTextProps.readOnlyStyle}`)).toEqual({});
    });

    it("renders MainEditor component with correct props", () => {
        const richText = renderRichText();
        const mainEditor = richText.find("MainEditor");
        expect(mainEditor).toBeDefined();
        const props = mainEditor.props() as CKEditorConfig;
        const dimensions = getDimensions(defaultRichTextProps);
        const toolbar = getPreset("basic");
        expect(props.config.config).toMatchObject({
            autoGrow_minHeight: 300,
            toolbarCanCollapse: true,
            autoGrow_onStartup: true,
            width: dimensions.width,
            height: dimensions.height,
            enterMode: 1,
            shiftEnterMode: 1,
            disableNativeSpellChecker: !defaultRichTextProps.spellChecker,
            ...toolbar
        });
    });

    it("renders editor in read only mode with specified style", () => {
        const containerProps: RichTextContainerProps = {
            ...defaultRichTextProps,
            stringAttribute: new EditableValueBuilder<string>()
                .withValue("Rich text default value")
                .isReadOnly()
                .build()
        };
        const richText = renderRichText(containerProps);
        expect(richText.find(`.editor-${containerProps.readOnlyStyle}`).getElements().length).toBeGreaterThan(0);
    });
});

describe("CKEditor configuration", () => {
    it("returns correct value for enterMode", () => {
        let enterMode = defineEnterMode("paragraph");
        expect(enterMode).toEqual(1);

        enterMode = defineEnterMode("breakLines");
        expect(enterMode).toEqual(2);

        enterMode = defineEnterMode("blocks");
        expect(enterMode).toEqual(3);

        enterMode = defineEnterMode("");
        expect(enterMode).toEqual(1);
    });

    it("returns group named document", () => {
        const group = getToolbarGroupByName("document");
        expect(group).toEqual(TOOLBAR_GROUP[0]);
    });

    it("creates toolbar from advanced configuration", () => {
        const input: AdvancedConfigType[] = [
            { ctItemType: "About", ctItemToolbar: "toolbar1" },
            { ctItemType: "Anchor", ctItemToolbar: "toolbar2" }
        ];
        const grouped = defineAdvancedGroups({ ...defaultRichTextProps, advancedConfig: input });
        const result = [
            {
                name: "toolbar1",
                items: ["About"]
            },
            {
                name: "toolbar2",
                items: ["Anchor"]
            }
        ];
        expect(grouped).toMatchObject(result);
    });

    it("returns configuration object for basic preset", () => {
        const preset = "basic";
        const config = getPreset(preset);

        expect(config).toEqual({
            toolbarGroups: TOOLBAR_GROUP,
            removeButtons:
                "Source,Save,Templates,NewPage,ExportPdf,Preview,Print,Cut,Redo,Copy,Undo," +
                "Paste,PasteText,PasteFromWord,Find,Replace,SelectAll,Scayt," +
                "Form,Checkbox,Radio,TextField,Textarea,Select," +
                "Button,ImageButton,HiddenField,Strike,Underline,Subscript," +
                "Superscript,CopyFormatting,RemoveFormat,CreateDiv,Blockquote,JustifyLeft," +
                "BidiLtr,Image,Table,BidiRtl,JustifyCenter,JustifyRight,Language,JustifyBlock," +
                "HorizontalRule,SpecialChar,Smiley,PageBreak,Iframe,Styles,TextColor,BGColor," +
                "ShowBlocks,Maximize,Format,Font,FontSize,Anchor"
        });
    });

    it("returns configuration object for standard preset", () => {
        const preset = "standard";
        const config = getPreset(preset);

        const toolbarGroups: Array<ToolbarGroup | string> = [...TOOLBAR_GROUP];
        toolbarGroups.splice(4, 0, "/");
        expect(config).toEqual({
            toolbarGroups,
            removeButtons:
                "Save,Templates,NewPage,ExportPdf,Preview,Print,Find," +
                "Replace,SelectAll,Form,Checkbox,Radio,TextField,Textarea," +
                "Select,Button,ImageButton,HiddenField,Underline,Subscript," +
                "Superscript,CopyFormatting,CreateDiv,JustifyLeft,BidiLtr,BidiRtl," +
                "JustifyCenter,JustifyRight,Language,JustifyBlock,Smiley,PageBreak," +
                "Iframe,TextColor,BGColor,Font,FontSize,ShowBlocks"
        });
    });
});
