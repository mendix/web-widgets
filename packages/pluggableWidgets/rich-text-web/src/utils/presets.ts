import { PresetEnum, RichTextContainerProps } from "typings/RichTextProps";

export interface ToolbarGroup {
    name: string;
    groups?: string[];
}

interface EditorConfig {
    toolbar: string | false;
}

export const toolbarGroups: Array<keyof RichTextContainerProps> = [
    "basicstyle",
    "extendedstyle",
    "textalign",
    "clipboard",
    "fontstyle",
    "paragraph",
    "document",
    "history",
    "accordion",
    "code",
    "anchor",
    "direction",
    "link",
    "list",
    "preview",
    "table",
    "visualaid",
    "media",
    "util",
    "emoticon",
    "remove"
];

const TOOLBAR_GROUP: ToolbarGroup[] = [
    { name: "basicstyle", groups: ["bold", "underline", "italic"] },
    { name: "extendedstyle", groups: ["strikethrough", "subscript", "superscript"] },
    { name: "textalign", groups: ["aligncenter", "alignjustify", "alignleft", "alignright", "alignnone"] },
    { name: "clipboard", groups: ["cut", "copy", "paste", "pastetext"] },
    { name: "fontstyle", groups: ["fontfamily", "fontsize", "forecolor", "backcolor"] },
    { name: "paragraph", groups: ["lineheight", "hr", "indent", "outdent", "blockquote", "blocks"] },
    { name: "document", groups: ["newdocument", "print"] },
    { name: "history", groups: ["undo", "redo"] },
    { name: "accordion", groups: ["accordion"] },
    { name: "code", groups: ["code", "codesample"] },
    { name: "anchor", groups: ["anchor"] },
    { name: "direction", groups: ["ltr", "rtl"] },
    { name: "link", groups: ["link", "unlink", "openlink"] },
    { name: "list", groups: ["bullist", "numlist"] },
    { name: "preview", groups: ["preview", "fullscreen"] },
    { name: "table", groups: ["table", "tabledelete", "tableinsertdialog"] },
    { name: "visualaid", groups: ["visualaid", "visualblocks", "visualchars"] },
    { name: "media", groups: ["media", "image"] },
    { name: "util", groups: ["selectall", "insertdatetime", "searchreplace", "pagebreak", "wordcount"] },
    { name: "emoticon", groups: ["emoticons"] },
    { name: "remove", groups: ["remove", "removeformat"] }
];

export function createPreset(type: PresetEnum, config?: Partial<RichTextContainerProps>): EditorConfig {
    if (config?.stringAttribute?.readOnly) {
        return {
            toolbar: false
        };
    }
    switch (type) {
        case "basic":
            return {
                toolbar: "bold italic | bullist numlist | outdent indent | link | removeformat | help"
            };
        case "standard":
            return {
                toolbar:
                    "undo redo | bold italic strikethrough | removeformat | bullist numlist | blockquote | outdent indent | ltr rtl | alignleft aligncenter alignright alignjustify | fontfamily fontsize forecolor backcolor | image link media | blocks anchor | cut copy paste pastetext | codesample preview code | selectall fullscreen | help"
            };
        case "full":
            return {
                toolbar:
                    "undo redo | bold italic underline strikethrough | superscript subscript | removeformat | bullist numlist | blockquote | outdent indent | ltr rtl | alignleft aligncenter alignright alignjustify | fontfamily fontsize forecolor backcolor | image link media | blocks anchor | cut copy paste pastetext | codesample preview code | emoticons insertdatetime searchreplace | selectall fullscreen | help"
            };
        case "custom":
            return constructCustomToolbar(config);
        default:
            return {
                toolbar:
                    "undo redo | bold italic forecolor | removeformat | bullist numlist | outdent indent | alignleft aligncenter alignright alignjustify | image link media | blocks | codesample preview code | help"
            };
    }
}

function constructCustomToolbar(config?: Partial<RichTextContainerProps>): EditorConfig {
    // let toolbarGroup:Array<string> = [];
    const groupItems = config?.toolbarConfig === "basic" ? defineBasicGroups(config) : defineAdvancedGroups(config!);

    return {
        toolbar: groupItems.join(" | ")
    };
}

function defineBasicGroups(widgetProps: Partial<RichTextContainerProps>): string[] {
    const enabledGroups = Object.entries(widgetProps).flatMap(([prop, enabled]) =>
        toolbarGroups.find(toolbarGroup => toolbarGroup === prop) && enabled ? [prop] : []
    );

    const res = enabledGroups.map((groupName: string) =>
        groupName.includes("separator")
            ? "|"
            : TOOLBAR_GROUP.find(toolbar => toolbar.name === groupName)?.groups?.join(" ")
    );

    return res.filter(i => i !== undefined) as string[];
}

function defineAdvancedGroups(widgetProps: Partial<RichTextContainerProps>): string[] {
    const { advancedConfig: items } = widgetProps;

    const result: string[] = [];
    let toolbarItem: string[] = [];
    items?.forEach(item => {
        if (item.ctItemType === "separator") {
            if (toolbarItem.length) {
                result.push(toolbarItem.join(" "));
            }

            toolbarItem = [];
        } else {
            toolbarItem.push(item.ctItemType);
        }
    });

    if (toolbarItem.length) {
        result.push(toolbarItem.join(" "));
    }

    toolbarItem = [];

    return result;
}
