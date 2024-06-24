import { FunctionComponent } from "react";
import { ToolbarButton, ToolbarDropdown } from "./ToolbarWrapper";
import { RedoToolbar, UndoToolbar } from "./UndoRedo";
import type Quill from "quill";
import { FONT_LIST } from "../../utils/formats/fonts";
import { IconLowerAlpha } from "../../assets/Icons";

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
    bold: { component: ToolbarButton, className: "ql-bold", title: "Bold" },
    italic: { component: ToolbarButton, className: "ql-italic", title: "Italic" },
    underline: { component: ToolbarButton, className: "ql-underline", presetValue: 2, title: "Underline" },
    strike: { component: ToolbarButton, className: "ql-strike", presetValue: 3, title: "Strike" },
    superScript: { component: ToolbarButton, className: "ql-script", value: "super", title: "Superscript" },
    subScript: { component: ToolbarButton, className: "ql-script", value: "sub", title: "Subscript" },
    orderedList: { component: ToolbarButton, className: "ql-list", value: "ordered", title: "Default list" },
    bulletList: { component: ToolbarButton, className: "ql-list", value: "bullet", title: "Bullet list" },
    lowerAlphaList: {
        component: ToolbarButton,
        className: "ql-list",
        value: "lower-alpha",
        presetValue: 2,
        title: "Lower alpha list",
        children: IconLowerAlpha
    },
    checkList: { component: ToolbarButton, className: "ql-list", value: "check", presetValue: 3, title: "Check list" },
    minIndent: { component: ToolbarButton, className: "ql-indent", value: "-1", title: "Decrease indent" },
    plusIndent: { component: ToolbarButton, className: "ql-indent", value: "+1", title: "Increase indent" },
    direction: {
        component: ToolbarButton,
        className: "ql-direction",
        value: "rtl",
        presetValue: 2,
        title: "Text direction"
    },
    link: { component: ToolbarButton, className: "ql-link", title: "Insert/edit link" },
    image: { component: ToolbarButton, className: "ql-image", presetValue: 2, title: "Insert/edit image" },
    video: { component: ToolbarButton, className: "ql-video", presetValue: 3, title: "Insert/edit video" },
    formula: { component: ToolbarButton, className: "ql-formula", presetValue: 3, title: "Insert/edit formula" },
    blockquote: { component: ToolbarButton, className: "ql-blockquote", title: "Blockquote" },
    codeBlock: { component: ToolbarButton, className: "ql-code-block", title: "Code block" },
    align: { component: ToolbarButton, className: "ql-align", title: "Left align" },
    centerAlign: {
        component: ToolbarDropdown,
        className: "ql-align",
        value: ["center", "justify"],
        title: "Center align"
    },
    rightAlign: { component: ToolbarButton, className: "ql-align", value: "right", title: "Right align" },
    font: { component: ToolbarDropdown, className: "ql-font", value: FONT_LIST, title: "Font type" },
    color: { component: ToolbarDropdown, className: "ql-color", value: [], title: "Font color" },
    background: { component: ToolbarDropdown, className: "ql-background", value: [], title: "Font background" },
    header: {
        component: ToolbarDropdown,
        className: "ql-header",
        value: ["1", "2", "3", "4", "5", false],
        title: "Font header"
    },
    clean: { component: ToolbarButton, className: "ql-clean", title: "Clear formatting" }
};

type ToolbarGroupType = {
    [k: string]: string[];
};

export const TOOLBAR_GROUP: ToolbarGroupType = {
    history: ["undo", "redo"],
    fontStyle: ["bold", "italic", "underline", "strike"],
    fontScript: ["superScript", "subScript"],
    fontColor: ["font", "color", "background"],
    list: ["orderedList", "bulletList", "lowerAlphaList", "checkList"],
    indent: ["minIndent", "plusIndent", "direction"],
    embed: ["link", "image", "video", "formula"],
    align: ["align", "centerAlign", "rightAlign"],
    code: ["blockquote", "codeBlock"],
    header: ["header"],
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
        presetValue: 1,
        children: TOOLBAR_GROUP.embed
    },
    {
        presetValue: 2,
        children: TOOLBAR_GROUP.code
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
        presetValue: 3,
        children: TOOLBAR_GROUP.header
    },
    {
        presetValue: 1,
        children: TOOLBAR_GROUP.remove
    }
];
