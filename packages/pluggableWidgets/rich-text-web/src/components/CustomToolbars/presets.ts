import { RichTextContainerProps } from "typings/RichTextProps";
import { DEFAULT_TOOLBAR, TOOLBAR_GROUP, type toolbarContentType } from "./constants";

export function createPreset(config?: Partial<RichTextContainerProps>): toolbarContentType[] {
    return config?.preset !== "custom"
        ? DEFAULT_TOOLBAR
        : config?.toolbarConfig === "basic"
        ? defineBasicGroups(config)
        : defineAdvancedGroups(config!);
}

function defineBasicGroups(widgetProps: Partial<RichTextContainerProps>): toolbarContentType[] {
    const enabledGroups: Array<toolbarContentType | undefined> = Object.entries(widgetProps).map(([prop, enabled]) => {
        if (Object.hasOwn(TOOLBAR_GROUP, prop) && enabled) {
            return {
                children: TOOLBAR_GROUP[prop.toString()]
            };
        } else {
            return undefined;
        }
    });
    return enabledGroups.filter(x => x !== undefined) as toolbarContentType[];
}

function defineAdvancedGroups(widgetProps: Partial<RichTextContainerProps>): toolbarContentType[] {
    const { advancedConfig: items } = widgetProps;

    const result: toolbarContentType[] = [
        {
            children: []
        }
    ];
    items?.forEach(item => {
        if (item.ctItemType === "separator") {
            result.push({
                children: []
            });
        } else {
            result[result.length - 1].children.push(item.ctItemType);
        }
    });

    return result;
}
