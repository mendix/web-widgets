import { getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import { CKEditorConfig } from "ckeditor4-react";
import { PresetEnum, CtItemTypeEnum, RichTextContainerProps } from "../../typings/RichTextProps";
import {
    createPreset,
    TOOLBAR_GROUP,
    ToolbarGroup,
    ToolbarItems,
    GroupType,
    createCustomToolbar,
    Style
} from "./ckeditorPresets";

export type PluginName = "stylesheetparser" | "codesnippet" | "openlink" | "indent" | "indentlist";

const PLUGIN_CONFIGS = {
    openlink: {
        extraPlugins: "openlink",
        name: "OpenLink",
        config: {
            openlink_enableReadOnly: true,
            openlink_target: "_blank",
            openlink_modifier: 0
        }
    },
    codesnippet: {
        extraPlugins: "codesnippet",
        name: "CodeSnippet",
        config: {
            codeSnippet_theme: "idea"
        }
    },
    stylesheetparser: {
        extraPlugins: "stylesheetparser",
        name: "StylesheetParser",
        config: {
            contentsCss: "theme.compiled.css"
        }
    },
    indent: null,
    indentlist: null
};

export function getToolbarGroupByName(name: string): ToolbarGroup | undefined {
    return TOOLBAR_GROUP.find((group: ToolbarGroup) => group.name === name);
}

export function defineEnterMode(type: string): number {
    switch (type) {
        case "paragraph":
            return 1;
        case "breakLines":
            return 2;
        case "blocks":
            return 3;
        default:
            return 1;
    }
}

export function getPreset(type: PresetEnum): CKEditorConfig {
    switch (type) {
        case "standard":
            return createPreset("standard");
        case "basic":
            return createPreset("basic");
        case "full":
            return createPreset("full");
        default:
            return createPreset("basic");
    }
}

export function addPlugin(name: PluginName, config: CKEditorConfig): CKEditorConfig {
    const plugin = PLUGIN_CONFIGS[name];
    if (plugin && config) {
        if (config.extraPlugins && !config.extraPlugins.includes(plugin.extraPlugins)) {
            config.extraPlugins += `,${plugin.extraPlugins}`;
        } else {
            config.extraPlugins = plugin.extraPlugins;
        }
        Object.assign(config, plugin.config);
    }
    return config;
}

export function defineBasicGroups(widgetProps: RichTextContainerProps): string[] {
    const enabledGroups = Object.entries(widgetProps).flatMap(([prop, enabled]) =>
        prop.includes("Group") && enabled ? [prop] : []
    );

    return enabledGroups.map((groupName: GroupType) =>
        groupName.includes("separator") ? "/" : groupName.replace("Group", "").toLowerCase()
    );
}

export function defineAdvancedGroups(widgetProps: RichTextContainerProps): ToolbarItems[] {
    const { advancedConfig: items } = widgetProps;
    const toolbarObj: {
        [key: string]: Array<CtItemTypeEnum | "-">;
    } = {};
    items.forEach(item => {
        const id = item.ctItemToolbar;
        const type = item.ctItemType !== "seperator" ? item.ctItemType : "-";

        if (!toolbarObj[id]) {
            toolbarObj[id] = [];
        }
        toolbarObj[id].push(type);
    });

    const keys: string[] = Object.keys(toolbarObj);
    const toolbarArray: ToolbarItems[] = [];
    keys.forEach((key: string) =>
        toolbarArray.push({
            name: key,
            items: toolbarObj[key]
        })
    );
    return toolbarArray;
}

export function defineStyleSet(widgetProps: RichTextContainerProps): Style[] | string {
    const { stylesConfig: items } = widgetProps;
    const styleSet: Style[] = [];
    if (items.length === 0) {
        return "default";
    } else {
        items.forEach(item => {
            const styleAttributes = {
                class: item.styleClass
            };
            styleSet.push({
                name: item.styleName,
                element: item.styleElement,
                attributes: styleAttributes
            });
        });
        return styleSet;
    }
}

export function getToolbarConfig(widgetProps: RichTextContainerProps): CKEditorConfig {
    const { preset, toolbarConfig } = widgetProps;

    if (preset !== "custom") {
        return getPreset(preset);
    }

    const isBasic = toolbarConfig === "basic";
    const groupItems = isBasic ? defineBasicGroups(widgetProps) : defineAdvancedGroups(widgetProps);

    return createCustomToolbar(groupItems, isBasic);
}

export function getCKEditorConfig(widgetProps: RichTextContainerProps): CKEditorConfig {
    const {
        codeHighlight,
        advancedContentFilter,
        allowedContent,
        disallowedContent,
        spellChecker,
        enterMode,
        shiftEnterMode,
        tabIndex,
        stringAttribute,
        width,
        widthUnit,
        height,
        heightUnit,
        styleSetName,
        validSelectors,
        skipSelectors
    } = widgetProps;

    const dimensions = getDimensions({
        width,
        widthUnit,
        height,
        heightUnit
    });

    const config: CKEditorConfig = {
        autoGrow_minHeight: 300,
        toolbarCanCollapse: true,
        autoGrow_onStartup: true,
        width: dimensions.width,
        height: dimensions.height,
        tabIndex,
        enterMode: defineEnterMode(enterMode || ""),
        shiftEnterMode: defineEnterMode(shiftEnterMode || ""),
        disableNativeSpellChecker: !spellChecker,
        readOnly: stringAttribute.readOnly,
        removeButtons: "",
        stylesSet: defineStyleSet(widgetProps),
        ...getToolbarConfig(widgetProps)
    };

    const plugins: PluginName[] = ["openlink", "indent", "indentlist"];

    if (codeHighlight) {
        plugins.push("codesnippet");
    }

    if (styleSetName) {
        plugins.push("stylesheetparser");
        if (validSelectors) {
            config.stylesheetParser_validSelectors = new RegExp(validSelectors);
        }
        if (skipSelectors) {
            config.stylesheetParser_skipSelectors = new RegExp(skipSelectors);
        }
    }

    for (const plugin of plugins) {
        addPlugin(plugin, config);
    }

    if (advancedContentFilter === "custom") {
        config.extraAllowedContent = allowedContent;
        config.disallowedContent = disallowedContent;
    }

    return config;
}
