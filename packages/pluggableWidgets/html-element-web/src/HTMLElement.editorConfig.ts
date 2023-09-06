import { AttributeValueTypeEnum, HTMLElementPreviewProps } from "../typings/HTMLElementProps";
import { hideNestedPropertiesIn, hidePropertiesIn, Problem, Properties } from "@mendix/pluggable-widgets-tools";
import {
    container,
    ContainerProps,
    datasource,
    dropzone,
    structurePreviewPalette,
    StructurePreviewProps,
    TextProps,
    text
} from "@mendix/widget-plugin-platform/preview/structure-preview-api";
import { isVoidElement, prepareTag } from "./utils/props-utils";

type TagAttributeValuePropName = keyof HTMLElementPreviewProps["attributes"][number];

const disabledElements = ["script"];

function isValidHtmlTagName(name: string): boolean {
    // rather naive approach that works in most cases
    return /^[a-z][\w.-]*$/i.test(name);
}

function attributeValuePropsExcept(valueName: TagAttributeValuePropName): TagAttributeValuePropName[] {
    const allPropNames: TagAttributeValuePropName[] = [
        "attributeValueExpression",
        "attributeValueExpressionRepeat",
        "attributeValueTemplate",
        "attributeValueTemplateRepeat"
    ];

    return allPropNames.filter(n => n !== valueName);
}

function attributeValuePropNameFor(
    values: HTMLElementPreviewProps,
    attributeValueType: AttributeValueTypeEnum
): TagAttributeValuePropName {
    switch (true) {
        case attributeValueType === "expression" && values.tagUseRepeat:
            return "attributeValueExpressionRepeat";
        case attributeValueType === "template" && values.tagUseRepeat:
            return "attributeValueTemplateRepeat";
        case attributeValueType === "expression" && !values.tagUseRepeat:
            return "attributeValueExpression";
        case attributeValueType === "template" && !values.tagUseRepeat:
            return "attributeValueTemplate";
        default:
            throw new Error("Unknown attribute value type: " + attributeValueType);
    }
}

function hideAttributeValueProps(values: HTMLElementPreviewProps, defaultProperties: Properties): void {
    values.attributes.forEach((_v, i) => {
        const valuePropToKeep = attributeValuePropNameFor(values, _v.attributeValueType);
        hideNestedPropertiesIn(defaultProperties, values, "attributes", i, attributeValuePropsExcept(valuePropToKeep));
    });
}
function hideEventValueProps(values: HTMLElementPreviewProps, defaultProperties: Properties): void {
    values.events.forEach((_v, i) => {
        hideNestedPropertiesIn(defaultProperties, values, "events", i, [
            values.tagUseRepeat ? "eventAction" : "eventActionRepeat"
        ]);
    });
}

export function getProperties(values: HTMLElementPreviewProps, defaultProperties: Properties): Properties {
    const propsToHide: Array<keyof HTMLElementPreviewProps> = [];

    if (values.tagName !== "__customTag__") {
        propsToHide.push("tagNameCustom");
    }

    if (!values.tagUseRepeat) {
        propsToHide.push("tagContentRepeatDataSource");
    }

    const tagName = values.tagName === "__customTag__" ? values.tagNameCustom : values.tagName;

    if (isVoidElement(tagName)) {
        // void elements don't allow children, hide all content props and the content mode switch
        propsToHide.push(
            "tagContentMode",
            "tagContentHTML",
            "tagContentContainer",
            "tagContentRepeatHTML",
            "tagContentRepeatContainer"
        );
    } else if (values.tagUseRepeat) {
        // hide non-repeating content props
        propsToHide.push("tagContentHTML", "tagContentContainer");

        if (values.tagContentMode === "innerHTML") {
            propsToHide.push("tagContentRepeatContainer");
        } else {
            propsToHide.push("tagContentRepeatHTML");
        }
    } else {
        // hide repeating content props
        propsToHide.push("tagContentRepeatHTML", "tagContentRepeatContainer");

        if (values.tagContentMode === "innerHTML") {
            propsToHide.push("tagContentContainer");
        } else {
            propsToHide.push("tagContentHTML");
        }
    }

    hidePropertiesIn(defaultProperties, values, propsToHide);
    hideAttributeValueProps(values, defaultProperties);
    hideEventValueProps(values, defaultProperties);

    return defaultProperties;
}

export function check(values: HTMLElementPreviewProps): Problem[] {
    const errors: Problem[] = [];

    if (values.tagName === "__customTag__") {
        if (disabledElements.includes(values.tagNameCustom)) {
            errors.push({
                severity: "error",
                property: "tagNameCustom",
                message: `Tag '${values.tagNameCustom}' is not supported.`
            });
        } else if (!isValidHtmlTagName(values.tagNameCustom)) {
            errors.push({
                severity: "error",
                property: "tagNameCustom",
                message: `Invalid tag name '${values.tagNameCustom}'.`
            });
        }
    }

    const existingAttributeNames = new Set();
    values.attributes.forEach((attr, i) => {
        if (existingAttributeNames.has(attr.attributeName)) {
            errors.push({
                severity: "error",
                property: `attributes/${i + 1}/attributeName`,
                message: `Attribute with name '${attr.attributeName}' already exists.`
            });
        }
        existingAttributeNames.add(attr.attributeName);

        const attributePropName = attributeValuePropNameFor(values, attr.attributeValueType);
        if (!attr[attributePropName].length) {
            errors.push({
                severity: "warning",
                property: `attributes/${i + 1}/${attributePropName}`,
                message: `Value is not specified for attribute '${attr.attributeName}'.`
            });
        }
    });

    const existingEventNames = new Set();
    values.events.forEach((attr, i) => {
        if (existingEventNames.has(attr.eventName)) {
            errors.push({
                severity: "error",
                property: `attributes/${i + 1}/eventName`,
                message: `Event with name '${attr.eventName}' already exists.`
            });
        }
        existingEventNames.add(attr.eventName);
    });

    return errors;
}

export function getPreview(
    values: HTMLElementPreviewProps,
    isDarkMode: boolean,
    spVersion: number[] = [0, 0, 0]
): StructurePreviewProps | null {
    const tagName = prepareTag(values.tagName, values.tagNameCustom);
    const [x, y] = spVersion;
    const canHideDataSourceHeader = x >= 9 && y >= 20;
    const palette = structurePreviewPalette[isDarkMode ? "dark" : "light"];

    const tagText = (content: string): TextProps => text({ fontColor: palette.text.primary })(content);

    const voidElementPreview = (tagName: keyof JSX.IntrinsicElements): ContainerProps =>
        container({ padding: 4 })(tagText(`<${tagName} />`));

    const flowElementPreview = (): ContainerProps =>
        values.tagContentMode === "innerHTML"
            ? container({ padding: 4 })(
                  tagText(
                      `<${tagName}>${
                          values.tagUseRepeat ? values.tagContentRepeatHTML : values.tagContentHTML
                      }</${tagName}>`
                  )
              )
            : container({ padding: 0 })(
                  tagText(`<${tagName}>`),
                  dropzone(dropzone.hideDataSourceHeaderIf(canHideDataSourceHeader))(
                      values.tagUseRepeat ? values.tagContentRepeatContainer : values.tagContentContainer
                  ),
                  tagText(`</${tagName}>`)
              );

    return container({ grow: 1, borders: true, borderWidth: 1 })(
        values.tagContentRepeatDataSource && canHideDataSourceHeader
            ? datasource(values.tagContentRepeatDataSource)()
            : container()(),
        isVoidElement(tagName) ? voidElementPreview(tagName) : flowElementPreview()
    );
}

export function getCustomCaption(values: HTMLElementPreviewProps, _platform = "desktop"): string {
    const tagName = prepareTag(values.tagName, values.tagNameCustom);
    return `<${tagName} />`;
}
