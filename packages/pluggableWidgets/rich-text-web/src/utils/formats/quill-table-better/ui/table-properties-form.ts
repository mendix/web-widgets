import { computePosition, flip, offset, shift } from "@floating-ui/react";
import Coloris from "@melloware/coloris";
import "@melloware/coloris/dist/coloris.css";
import Quill from "quill";
import { getProperties } from "../config";
import { ListContainer } from "../formats/list";
import type { Props, TableCell, TableCellBlock, TableContainer, TableHeader, TableList, TableMenus } from "../types";
import {
    addDimensionsUnit,
    createTooltip,
    getClosestElement,
    getComputeSelectedCols,
    isDimensions,
    setElementAttribute,
    setElementProperty
} from "../utils";

interface Child {
    category: string;
    propertyName: string;
    value?: string;
    attribute?: Props;
    options?: string[];
    tooltip?: string;
    menus?: Menus[];
    valid?: (value?: string) => boolean;
    message?: string;
}

interface Menus {
    icon: string;
    describe: string;
    align: string;
}

interface Properties {
    content: string;
    children: Child[];
}

interface Options {
    type: "table" | "cell";
    attribute: Props;
}

interface ColorList {
    value: string;
    describe: string;
}

const ACTION_LIST = [
    { icon: "icons icon-Save", label: "save" },
    { icon: "icons icon-Close", label: "cancel" }
];

const COLOR_LIST: ColorList[] = [
    { value: "#000000", describe: "black" },
    { value: "#4d4d4d", describe: "dimGrey" },
    { value: "#808080", describe: "grey" },
    { value: "#e6e6e6", describe: "lightGrey" },
    { value: "#ffffff", describe: "white" },
    { value: "#ff0000", describe: "red" },
    { value: "#ffa500", describe: "orange" },
    { value: "#ffff00", describe: "yellow" },
    { value: "#99e64d", describe: "lightGreen" },
    { value: "#008000", describe: "green" },
    { value: "#7fffd4", describe: "aquamarine" },
    { value: "#40e0d0", describe: "turquoise" },
    { value: "#4d99e6", describe: "lightBlue" },
    { value: "#0000ff", describe: "blue" },
    { value: "#800080", describe: "purple" }
];

class TablePropertiesForm {
    tableMenus: TableMenus;
    options: Options;
    attrs: Props;
    borderForm: HTMLElement[];
    saveButton: HTMLButtonElement | null;
    form: HTMLDivElement;
    constructor(tableMenus: TableMenus, options: Options) {
        this.tableMenus = tableMenus;
        this.options = options;
        this.attrs = { ...options.attribute };
        this.borderForm = [];
        this.saveButton = null;
        this.form = this.createPropertiesForm(options);
    }

    checkBtnsAction(status: string) {
        if (status === "save") {
            this.saveAction(this.options.type);
        }
        this.removePropertiesForm();
        this.tableMenus.showMenus();
        this.tableMenus.updateMenus();
    }

    createActionBtns(listener: EventListener, showLabel: boolean) {
        const useLanguage = this.getUseLanguage();
        const ownerDocument = this.tableMenus.quill.root.ownerDocument;
        const container = ownerDocument.createElement("div");
        const fragment = ownerDocument.createDocumentFragment();
        container.classList.add("properties-form-action-row");
        for (const { icon, label } of ACTION_LIST) {
            const button = ownerDocument.createElement("button");
            const iconContainer = ownerDocument.createElement("span");
            const iconClasses = icon.split(" ");
            iconContainer.classList.add(...iconClasses);
            button.appendChild(iconContainer);
            button.setAttribute("label", label);
            if (showLabel) {
                const labelContainer = ownerDocument.createElement("span");
                labelContainer.innerText = useLanguage(label);
                button.appendChild(labelContainer);
            }
            fragment.appendChild(button);
        }
        container.addEventListener("click", e => listener(e));
        container.appendChild(fragment);
        return container;
    }

    createCheckBtns(child: Child) {
        const { menus, propertyName } = child;
        const ownerDocument = this.tableMenus.quill.root.ownerDocument;
        const container = ownerDocument.createElement("div");
        const fragment = ownerDocument.createDocumentFragment();
        for (const { icon, describe, align } of menus ?? []) {
            const container = ownerDocument.createElement("span");
            const iconContainer = ownerDocument.createElement("span");
            const iconClasses = icon.split(" ");
            iconContainer.classList.add(...iconClasses);
            container.appendChild(iconContainer);
            container.setAttribute("data-align", align);
            container.classList.add("ql-table-tooltip-hover");
            if (this.options.attribute[propertyName] === align) {
                container.classList.add("ql-table-btns-checked");
            }
            const tooltip = createTooltip(describe);
            container.appendChild(tooltip);
            fragment.appendChild(container);
        }
        container.classList.add("ql-table-check-container");
        container.appendChild(fragment);
        container.addEventListener("click", e => {
            const target: HTMLSpanElement | null = (e.target as HTMLElement).closest("span.ql-table-tooltip-hover");
            const value = target?.getAttribute("data-align");
            this.switchButton(container, target!);
            this.setAttribute(propertyName, value ?? "");
        });
        return container;
    }

    createColorContainer(child: Child) {
        const container = this.tableMenus.quill.root.ownerDocument.createElement("div");
        container.classList.add("ql-table-color-container");
        const input = this.createColorInput(child);
        const inputEl = input.querySelector("input");
        if (inputEl) {
            this.createColorPicker(inputEl);
        }
        container.appendChild(input);
        return container;
    }

    createColorInput(child: Child) {
        const { attribute = {}, propertyName, value } = child;
        const ownerDocument = this.tableMenus.quill.root.ownerDocument;
        const placeholder = attribute?.placeholder ?? "";
        const container = ownerDocument.createElement("div");
        container.classList.add("label-field-view", "label-field-view-color");
        const label = ownerDocument.createElement("label");
        label.innerText = placeholder;
        const input = ownerDocument.createElement("input");
        const attributes = {
            ...attribute,
            class: "property-input",
            value: value ?? "",
            "data-property": propertyName
        };
        setElementAttribute(input, attributes);

        container.appendChild(input);
        container.appendChild(label);
        return container;
    }

    createColorPicker(input: HTMLInputElement) {
        Coloris.init();
        Coloris({
            el: input,
            clearButton: true,
            closeButton: true,
            onChange: (color: string, input: HTMLElement): void => {
                const propertyName = input.getAttribute("data-property") ?? "";
                this.setAttribute(propertyName, color, input);
            },
            swatches: COLOR_LIST.map(({ value }) => value),
            theme: "polaroid"
        });
    }

    createDropdown(value: string) {
        const ownerDocument = this.tableMenus.quill.root.ownerDocument;
        const dropdown = ownerDocument.createElement("div");
        const dropIcon = ownerDocument.createElement("span");
        const dropText = ownerDocument.createElement("span");
        dropIcon.classList.add("icons", "icon-Arrow-down", "ql-table-dropdown-icon");
        value && (dropText.innerText = value);
        dropText.classList.add("ql-table-dropdown-text");
        dropdown.classList.add("ql-table-dropdown-properties");
        dropdown.appendChild(dropText);
        dropdown.appendChild(dropIcon);
        return { dropdown, dropText };
    }

    createInput(child: Child) {
        const { attribute = {}, message, propertyName, valid, value } = child;
        const ownerDocument = this.tableMenus.quill.root.ownerDocument;
        const placeholder = attribute?.placeholder ?? "";
        const container = ownerDocument.createElement("div");
        const wrapper = ownerDocument.createElement("div");
        const label = ownerDocument.createElement("label");
        const input = ownerDocument.createElement("input");
        const status = ownerDocument.createElement("div");
        container.classList.add("label-field-view");
        wrapper.classList.add("label-field-view-input-wrapper");
        label.innerText = placeholder;
        const attributes = {
            ...attribute,
            class: "property-input",
            value: value ?? ""
        };
        setElementAttribute(input, attributes);
        input.addEventListener("input", e => {
            const value = (e.target as HTMLInputElement).value;
            valid && this.switchHidden(status, valid(value));
            this.updateInputStatus(wrapper, !valid?.(value));
            this.setAttribute(propertyName, value, container);
        });
        status.classList.add("label-field-view-status", "ql-hidden");
        message && (status.innerText = message);
        wrapper.appendChild(input);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
        valid && container.appendChild(status);
        return container;
    }

    createList(child: Child, dropText?: HTMLSpanElement) {
        const { options, propertyName } = child;
        if (!options?.length) return null;
        const ownerDocument = this.tableMenus.quill.root.ownerDocument;
        const container = ownerDocument.createElement("ul");
        for (const option of options) {
            const list = ownerDocument.createElement("li");
            list.innerText = option;
            container.appendChild(list);
        }
        container.classList.add("ql-table-dropdown-list", "ql-hidden");
        container.addEventListener("click", e => {
            const value = (e.target as HTMLLIElement).innerText;
            if (dropText) {
                dropText.innerText = value;
            }
            this.toggleBorderDisabled(value);
            this.setAttribute(propertyName, value);
        });
        return container;
    }

    createProperty(property: Properties) {
        const { content, children } = property;
        const ownerDocument = this.tableMenus.quill.root.ownerDocument;
        const useLanguage = this.getUseLanguage();
        const container = ownerDocument.createElement("div");
        const label = ownerDocument.createElement("label");
        label.innerText = content;
        label.classList.add("ql-table-dropdown-label");
        container.classList.add("properties-form-row");
        if (children.length === 1) {
            container.classList.add("properties-form-row-full");
        }
        container.appendChild(label);
        for (const child of children) {
            const node = this.createPropertyChild(child);
            node && container.appendChild(node);
            if (node && content === useLanguage("border")) {
                this.borderForm.push(node);
            }
        }
        return container;
    }

    createPropertyChild(child: Child) {
        const { category, value } = child;
        switch (category) {
            case "dropdown":
                const { dropdown, dropText } = this.createDropdown(value!);
                const list = this.createList(child, dropText);
                dropdown.appendChild(list!);
                dropdown.addEventListener("click", () => {
                    this.toggleHidden(list!);
                    this.updateSelectedStatus(dropdown, dropText.innerText, "dropdown");
                });
                return dropdown;
            case "color":
                return this.createColorContainer(child);
            case "menus":
                return this.createCheckBtns(child);
            case "input":
                return this.createInput(child);
            default:
                break;
        }
    }

    createPropertiesForm(options: Options) {
        const useLanguage = this.getUseLanguage();
        const { title, properties } = getProperties(options, useLanguage);
        const ownerDocument = this.tableMenus.quill.root.ownerDocument;
        const container = ownerDocument.createElement("div");
        container.classList.add("ql-table-properties-form");
        const header = ownerDocument.createElement("h2");
        const actions = this.createActionBtns((e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest("button");
            const label = target?.getAttribute("label") ?? "";
            target && this.checkBtnsAction(label);
        }, true);
        header.innerText = title;
        header.classList.add("properties-form-header");
        container.appendChild(header);
        for (const property of properties) {
            const node = this.createProperty(property);
            container.appendChild(node);
        }
        container.appendChild(actions);
        this.setBorderDisabled();
        this.tableMenus.quill.container.appendChild(container);
        this.updatePropertiesForm(container, options.type);
        this.setSaveButton(actions);
        container.addEventListener("click", (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            this.hiddenSelectList(target);
        });
        return container;
    }

    getCellStyle(td: Element, attrs: Props) {
        const style = (td.getAttribute("style") || "")
            .split(";")
            .filter((value: string) => value.trim())
            .reduce((style: Props, value: string) => {
                const arr = value.split(":");
                return { ...style, [arr[0].trim()]: arr[1].trim() };
            }, {});
        Object.assign(style, attrs);
        return Object.keys(style).reduce((value: string, key: string) => {
            return (value += `${key}: ${style[key]}; `);
        }, "");
    }

    getColorClosest(container: HTMLElement) {
        return getClosestElement(container, ".ql-table-color-container");
    }

    getDiffProperties() {
        const change = this.attrs;
        const old = this.options.attribute;
        return Object.keys(change).reduce((attrs: Props, key) => {
            if (change[key] !== old[key] || key.startsWith("border")) {
                attrs[key] = isDimensions(key) ? addDimensionsUnit(change[key]) : change[key];
            }
            return attrs;
        }, {});
    }

    getUseLanguage() {
        const { language } = this.tableMenus.tableBetter;
        const useLanguage = language.useLanguage.bind(language);
        return useLanguage;
    }

    hiddenSelectList(element: HTMLElement) {
        const listClassName = ".ql-table-dropdown-properties";
        const colorClassName = ".color-picker";
        const list = this.form.querySelectorAll(".ql-table-dropdown-list");
        const colorPicker = this.form.querySelectorAll(".color-picker-select");
        for (const node of [...Array.from(list), ...Array.from(colorPicker)]) {
            if (
                node.closest(listClassName)?.isEqualNode(element.closest(listClassName)) ||
                node.closest(colorClassName)?.isEqualNode(element.closest(colorClassName))
            ) {
                continue;
            }
            node.classList.add("ql-hidden");
        }
    }

    removePropertiesForm() {
        this.form.remove();
        this.borderForm = [];
    }

    saveAction(type: string) {
        switch (type) {
            case "table":
                this.saveTableAction();
                break;
            default:
                this.saveCellAction();
                break;
        }
    }

    saveCellAction() {
        const { selectedTds } = this.tableMenus.tableBetter.cellSelection;
        const { quill, table } = this.tableMenus;
        const colgroup = (Quill.find(table as Node) as TableContainer)?.colgroup();
        const attrs = this.getDiffProperties();
        const width = parseFloat(attrs["width"]);
        const align = attrs["text-align"];
        align && delete attrs["text-align"];
        const newSelectedTds = [];
        if (colgroup && width) {
            delete attrs["width"];
            const { computeBounds } = this.tableMenus.getSelectedTdsInfo();
            const cols = getComputeSelectedCols(computeBounds, table as Element, quill.container);
            for (const col of cols) {
                col.setAttribute("width", `${width}`);
            }
        }
        for (const td of selectedTds) {
            const tdBlot = Quill.find(td) as TableCell;
            const blotName = tdBlot.statics.blotName;
            const formats = tdBlot.formats()[blotName];
            const style = this.getCellStyle(td, attrs);
            if (align) {
                const _align = align === "left" ? "" : align;
                tdBlot.children.forEach((child: TableCellBlock | ListContainer | TableHeader) => {
                    if (child.statics.blotName === ListContainer.blotName) {
                        child.children.forEach((ch: TableList) => {
                            ch.format && ch.format("align", _align);
                        });
                    } else {
                        child.format("align", _align);
                    }
                });
            }
            const parent = tdBlot.replaceWith(blotName, { ...formats, style }) as TableCell;
            newSelectedTds.push(parent.domNode);
        }
        this.tableMenus.tableBetter.cellSelection.setSelectedTds(newSelectedTds);
    }

    saveTableAction() {
        const { table, tableBetter } = this.tableMenus;
        const temporary = (Quill.find(table as Node) as TableContainer).temporary()?.domNode;
        const td = table?.querySelector("td");
        const attrs = this.getDiffProperties();
        const align = attrs["align"];
        delete attrs["align"];
        switch (align) {
            case "center":
                Object.assign(attrs, { margin: "0 auto" });
                break;
            case "left":
                Object.assign(attrs, { margin: "" });
                break;
            case "right":
                Object.assign(attrs, { "margin-left": "auto", "margin-right": "" });
                break;
            default:
                break;
        }
        const element = temporary || table;
        setElementProperty(element!, attrs);
        tableBetter.cellSelection.setSelected(td as Element);
    }

    setAttribute(propertyName: string, value: string, container?: HTMLElement) {
        this.attrs[propertyName] = value;
        if (propertyName.includes("-color") && container) {
            this.updateSelectColor(this.getColorClosest(container)!, value);
        }
    }

    setBorderDisabled() {
        const [borderContainer] = this.borderForm;
        // @ts-ignore
        const borderStyle = borderContainer.querySelector(".ql-table-dropdown-text").innerText;
        this.toggleBorderDisabled(borderStyle);
    }

    setSaveButton(container: HTMLDivElement) {
        const saveButton: HTMLButtonElement | null = container.querySelector('button[label="save"]');
        this.saveButton = saveButton;
    }

    setSaveButtonDisabled(disabled: boolean) {
        if (!this.saveButton) return;
        if (disabled) {
            this.saveButton.setAttribute("disabled", "true");
        } else {
            this.saveButton.removeAttribute("disabled");
        }
    }

    switchButton(container: HTMLDivElement, target: HTMLSpanElement) {
        const children = container.querySelectorAll("span.ql-table-tooltip-hover");
        for (const child of Array.from(children)) {
            child.classList.remove("ql-table-btns-checked");
        }
        target.classList.add("ql-table-btns-checked");
    }

    switchHidden(container: HTMLElement, valid: boolean) {
        if (!valid) {
            container.classList.remove("ql-hidden");
        } else {
            container.classList.add("ql-hidden");
        }
    }

    toggleBorderDisabled(value: string) {
        const [, colorContainer, widthContainer] = this.borderForm;
        if (value === "none" || !value) {
            this.attrs["border-color"] = "";
            this.attrs["border-width"] = "";
            this.updateSelectColor(colorContainer, "");
            this.updateInputValue(widthContainer, "");
            colorContainer.classList.add("ql-table-disabled");
            widthContainer.classList.add("ql-table-disabled");
        } else {
            colorContainer.classList.remove("ql-table-disabled");
            widthContainer.classList.remove("ql-table-disabled");
        }
    }

    toggleHidden(container: HTMLElement) {
        container.classList.toggle("ql-hidden");
    }

    updateInputValue(element: Element, value: string) {
        const input: HTMLInputElement | null = element.querySelector(".property-input");
        if (input) {
            input.value = value;
        }
    }

    updateInputStatus(container: HTMLElement, status: boolean, isColor?: boolean) {
        const closestContainer = isColor
            ? this.getColorClosest(container)
            : getClosestElement(container, ".label-field-view");
        const wrapper = closestContainer?.querySelector(".label-field-view-input-wrapper");
        if (status) {
            wrapper?.classList.add("label-field-view-error");
            this.setSaveButtonDisabled(true);
        } else {
            wrapper?.classList.remove("label-field-view-error");
            const wrappers = this.form.querySelectorAll(".label-field-view-error");
            if (!wrappers.length) this.setSaveButtonDisabled(false);
        }
    }

    updatePropertiesForm(container: HTMLElement, type: string) {
        const target = type === "table" ? this.tableMenus.table! : this.tableMenus.getSelectedTdsInfo().leftTd;

        computePosition(target, container, {
            middleware: [offset(4), flip(), shift({ padding: 10 })],
            placement: "bottom",
            strategy: "fixed"
        }).then(({ x, y }) => {
            setElementProperty(container, {
                left: `${x}px`,
                top: `${y}px`
            });
        });
    }

    updateSelectColor(element: Element, value: string) {
        const input: HTMLInputElement | null = element.querySelector(".property-input");

        if (input) {
            input.value = value;
        }
    }

    updateSelectedStatus(container: HTMLDivElement, value: string, type: string) {
        const selectors = type === "color" ? ".color-list" : ".ql-table-dropdown-list";
        const list = container.querySelector(selectors);
        if (!list) return;
        const lists = Array.from(list.querySelectorAll("li"));
        for (const list of lists) {
            list.classList.remove(`ql-table-${type}-selected`);
        }
        const selected = lists.find(li => {
            const data = type === "color" ? li.getAttribute("data-color") : li.innerText;
            return data === value;
        });
        selected && selected.classList.add(`ql-table-${type}-selected`);
    }
}

export default TablePropertiesForm;
