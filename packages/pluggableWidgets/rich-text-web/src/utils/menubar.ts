import { MenubarModeEnum, RichTextContainerProps } from "typings/RichTextProps";

export const menubarGroups: Array<keyof RichTextContainerProps> = [
    "fileMenubar",
    "editMenubar",
    "insertMenubar",
    "viewMenubar",
    "formatMenubar",
    "tableMenubar",
    "toolsMenubar",
    "helpMenubar"
];

export function createMenubar(type: MenubarModeEnum, config?: Partial<RichTextContainerProps>): string | boolean {
    if (config?.stringAttribute?.readOnly) {
        return false;
    }
    switch (type) {
        case "hide":
            return false;
        case "basic":
            return "file edit insert view";
        case "full":
            return "file edit insert view format table tools help";
        case "custom":
            return constructCustomMenubar(config);
        default:
            return "file edit insert view table";
    }
}

function constructCustomMenubar(config?: Partial<RichTextContainerProps>): string {
    const groupItems = config?.toolbarConfig === "basic" ? defineBasicGroups(config) : defineAdvancedGroups(config!);

    return groupItems.join(" ");
}

function defineBasicGroups(widgetProps: Partial<RichTextContainerProps>): string[] {
    const enabledGroups = Object.entries(widgetProps).flatMap(([prop, enabled]) =>
        menubarGroups.find(menu => menu === prop) && enabled ? [prop] : []
    );

    return enabledGroups.map(menu => menu.replace("Menubar", "").toLowerCase());
}

function defineAdvancedGroups(widgetProps: Partial<RichTextContainerProps>): string[] {
    const { advancedMenubarConfig: items } = widgetProps;
    return items?.map(item => item.menubarItemType) as string[];
}
