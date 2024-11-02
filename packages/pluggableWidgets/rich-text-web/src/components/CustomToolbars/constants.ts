import type Quill from "quill";
import { FunctionComponent } from "react";
import { IconLowerAlpha } from "../../assets/Icons";
import { FONT_LIST } from "../../utils/formats/fonts";
import { FONT_SIZE_LIST } from "../../utils/formats/fontsize";
import { ToolbarButton, ToolbarDropdown } from "./ToolbarWrapper";
import { RedoToolbar, UndoToolbar } from "./UndoRedo";

type DefaultComponentProps = {
    className?: string;
    value?: string | any[];
    presetValue?: number;
    title: string;
    children?: FunctionComponent;
};

type CustomComponentProps =
    | {
          quill?: Quill | null;
      }
    | DefaultComponentProps;

type toolbarMappingType = {
    [k: string]: {
        component: FunctionComponent<CustomComponentProps>;
        custom?: boolean;
    } & DefaultComponentProps;
};

export const TOOLBAR_MAPPING: toolbarMappingType = {
    undo: { component: UndoToolbar, custom: true, title: "Undo" },
    redo: { component: RedoToolbar, custom: true, title: "Redo" },
    bold: { component: ToolbarButton, className: "ql-bold icons icon-Text-bold", title: "Bold" },
    italic: { component: ToolbarButton, className: "ql-italic icons icon-Text-italic", title: "Italic" },
    underline: {
        component: ToolbarButton,
        className: "ql-underline icons icon-Text-underline",
        presetValue: 2,
        title: "Underline"
    },
    strike: {
        component: ToolbarButton,
        className: "ql-strike icons icon-Text-strikethrough",
        presetValue: 3,
        title: "Strike"
    },
    superScript: {
        component: ToolbarButton,
        className: "ql-script icons icon-Text-superscript",
        value: "super",
        title: "Superscript"
    },
    subScript: {
        component: ToolbarButton,
        className: "ql-script icons icon-Text-subscript",
        value: "sub",
        title: "Subscript"
    },
    size: { component: ToolbarDropdown, className: "size ql-size", value: FONT_SIZE_LIST, title: "Font size" },
    orderedList: {
        component: ToolbarButton,
        className: "ql-list icons icon-List-numbers",
        value: "ordered",
        title: "Default list"
    },
    bulletList: {
        component: ToolbarButton,
        className: "ql-list icons icon-List-bullets",
        value: "bullet",
        title: "Bullet list"
    },
    lowerAlphaList: {
        component: ToolbarButton,
        className: "ql-list icons icon-List-lower-alpha",
        value: "lower-alpha",
        presetValue: 2,
        title: "Lower alpha list",
        children: IconLowerAlpha
    },
    checkList: {
        component: ToolbarButton,
        className: "ql-list  icons icon-List-checklist",
        value: "check",
        presetValue: 3,
        title: "Check list"
    },
    minIndent: {
        component: ToolbarButton,
        className: "ql-indent icons icon-Text-indent-right",
        value: "-1",
        title: "Decrease indent"
    },
    plusIndent: {
        component: ToolbarButton,
        className: "ql-indent icons icon-Text-indent-left",
        value: "+1",
        title: "Increase indent"
    },
    direction: {
        component: ToolbarButton,
        className: "ql-direction direction icons",
        value: "rtl",
        presetValue: 2,
        title: "Text direction"
    },
    link: { component: ToolbarButton, className: "ql-link icons icon-Hyperlink", title: "Insert/edit link" },
    image: {
        component: ToolbarButton,
        className: "ql-image icons icon-Image",
        presetValue: 2,
        title: "Insert/edit image"
    },
    video: {
        component: ToolbarButton,
        className: "ql-video icons icon-Film",
        presetValue: 3,
        title: "Insert/edit video"
    },
    formula: {
        component: ToolbarButton,
        className: "ql-formula icons icon-Insert-edit-math",
        presetValue: 3,
        title: "Insert/edit formula"
    },
    blockquote: { component: ToolbarButton, className: "ql-blockquote icons icon-Blockquote", title: "Blockquote" },
    codeBlock: { component: ToolbarButton, className: "ql-code-block icons icon-Code-block", title: "Code block" },
    code: { component: ToolbarButton, className: "ql-code icons icon-Inline-code", title: "Code" },
    viewCode: {
        component: ToolbarButton,
        className: "ql-view-code icons icon-View-edit-code",
        title: "View/edit Code"
    },
    align: { component: ToolbarButton, className: "ql-align icons icon-Text-align-left", title: "Left align" },
    centerAlign: {
        component: ToolbarDropdown,
        className: "ql-align icons",
        value: ["center", "justify"],
        title: "Center align"
    },
    rightAlign: {
        component: ToolbarButton,
        className: "ql-align icons icon-Text-align-right",
        value: "right",
        title: "Right align"
    },
    font: { component: ToolbarDropdown, className: "ql-font font", value: FONT_LIST, title: "Font type" },
    color: { component: ToolbarDropdown, className: "ql-color icons", value: [], title: "Font color" },
    background: { component: ToolbarDropdown, className: "ql-background icons", value: [], title: "Font background" },
    header: {
        component: ToolbarDropdown,
        className: "ql-header",
        value: ["1", "2", "3", "4", "5", "6", "7"],
        title: "Font header"
    },
    clean: { component: ToolbarButton, className: "ql-clean icons icon-Clear-formating", title: "Clear formatting" }
};

type ToolbarGroupType = {
    [k: string]: string[];
};

export const TOOLBAR_GROUP: ToolbarGroupType = {
    history: ["undo", "redo"],
    fontStyle: ["bold", "italic", "underline", "strike"],
    fontScript: ["superScript", "subScript"],
    list: ["orderedList", "bulletList", "lowerAlphaList", "checkList"],
    indent: ["minIndent", "plusIndent", "direction"],
    align: ["align", "centerAlign", "rightAlign"],
    fontColor: ["font", "size", "color", "background"],
    embed: ["link", "image", "video", "formula"],
    header: ["header"],
    code: ["blockquote", "code", "codeBlock", "viewCode"],
    remove: ["clean"]
};

export type toolbarContentType = {
    presetValue?: number;
    children: Array<keyof toolbarMappingType>;
};

export const DEFAULT_TOOLBAR: toolbarContentType[] = [
    {
        presetValue: 2,
        children: TOOLBAR_GROUP.history
    },
    {
        presetValue: 1,
        children: TOOLBAR_GROUP.fontStyle
    },
    {
        presetValue: 3,
        children: TOOLBAR_GROUP.fontScript
    },
    {
        presetValue: 1,
        children: TOOLBAR_GROUP.list
    },
    {
        presetValue: 1,
        children: TOOLBAR_GROUP.indent
    },
    {
        presetValue: 2,
        children: TOOLBAR_GROUP.align
    },
    {
        presetValue: 2,
        children: TOOLBAR_GROUP.fontColor
    },
    {
        presetValue: 1,
        children: TOOLBAR_GROUP.embed
    },
    {
        presetValue: 3,
        children: TOOLBAR_GROUP.header
    },
    {
        presetValue: 2,
        children: TOOLBAR_GROUP.code
    },
    {
        presetValue: 1,
        children: TOOLBAR_GROUP.remove
    }
];

export const IMG_MIME_TYPES = ["image/png", "image/jpeg"];
