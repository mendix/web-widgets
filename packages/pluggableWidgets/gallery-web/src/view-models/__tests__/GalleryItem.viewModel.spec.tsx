import { DerivedPropsGate } from "@mendix/widget-plugin-mobx-kit/main";
import { listAction, listExpression, listWidget } from "@mendix/widget-plugin-test-utils";
import { ObjectItem } from "mendix";
import { GalleryItemViewModel } from "../GalleryItem.viewModel";

describe("GalleryItemViewModel", () => {
    const mockItem: ObjectItem = { id: "test-id" } as ObjectItem;

    it("should return class value from item", () => {
        const mockGate = {
            props: {
                itemClass: listExpression(() => "item-class"),
                content: undefined,
                onClick: undefined,
                ariaLabelItem: undefined
            }
        } as unknown as DerivedPropsGate<any>;

        const viewModel = new GalleryItemViewModel(mockGate);
        expect(viewModel.class(mockItem)).toBe("item-class");
    });

    it("should return undefined class when itemClass is not provided", () => {
        const mockGate = {
            props: {
                itemClass: undefined,
                content: undefined,
                onClick: undefined,
                ariaLabelItem: undefined
            }
        } as unknown as DerivedPropsGate<any>;

        const viewModel = new GalleryItemViewModel(mockGate);
        expect(viewModel.class(mockItem)).toBeUndefined();
    });

    it("should return different classes for different items", () => {
        const item1 = { id: "item-1" } as ObjectItem;
        const item2 = { id: "item-2" } as ObjectItem;

        const mockGate = {
            props: {
                itemClass: listExpression(item => (item === item1 ? "class-1" : "class-2")),
                content: undefined,
                onClick: undefined,
                ariaLabelItem: undefined
            }
        } as unknown as DerivedPropsGate<any>;

        const viewModel = new GalleryItemViewModel(mockGate);
        expect(viewModel.class(item1)).toBe("class-1");
        expect(viewModel.class(item2)).toBe("class-2");
    });

    it("should return content from item", () => {
        const mockContent = <div>Test Content</div>;
        const mockGate = {
            props: {
                itemClass: undefined,
                content: listWidget(() => mockContent),
                onClick: undefined,
                ariaLabelItem: undefined
            }
        } as unknown as DerivedPropsGate<any>;

        const viewModel = new GalleryItemViewModel(mockGate);
        expect(viewModel.content(mockItem)).toBe(mockContent);
    });

    it("should return undefined content when content is not provided", () => {
        const mockGate = {
            props: {
                itemClass: undefined,
                content: undefined,
                onClick: undefined,
                ariaLabelItem: undefined
            }
        } as unknown as DerivedPropsGate<any>;

        const viewModel = new GalleryItemViewModel(mockGate);
        expect(viewModel.content(mockItem)).toBeUndefined();
    });

    it("should return aria label from item", () => {
        const mockGate = {
            props: {
                itemClass: undefined,
                content: undefined,
                onClick: undefined,
                ariaLabelItem: listExpression(() => "Item Label")
            }
        } as unknown as DerivedPropsGate<any>;

        const viewModel = new GalleryItemViewModel(mockGate);
        expect(viewModel.label(mockItem)).toBe("Item Label");
    });

    it("should return undefined label when ariaLabelItem is not provided", () => {
        const mockGate = {
            props: {
                itemClass: undefined,
                content: undefined,
                onClick: undefined,
                ariaLabelItem: undefined
            }
        } as unknown as DerivedPropsGate<any>;

        const viewModel = new GalleryItemViewModel(mockGate);
        expect(viewModel.label(mockItem)).toBeUndefined();
    });

    it("should return true when onClick is available for item", () => {
        const mockGate = {
            props: {
                itemClass: undefined,
                content: undefined,
                onClick: listAction(),
                ariaLabelItem: undefined
            }
        } as unknown as DerivedPropsGate<any>;

        const viewModel = new GalleryItemViewModel(mockGate);
        expect(viewModel.hasOnClick(mockItem)).toBe(true);
    });

    it("should return false when onClick is not provided", () => {
        const mockGate = {
            props: {
                itemClass: undefined,
                content: undefined,
                onClick: undefined,
                ariaLabelItem: undefined
            }
        } as unknown as DerivedPropsGate<any>;

        const viewModel = new GalleryItemViewModel(mockGate);
        expect(viewModel.hasOnClick(mockItem)).toBe(false);
    });

    it("should handle all props together", () => {
        const mockContent = <span>Item Content</span>;
        const mockGate = {
            props: {
                itemClass: listExpression(() => "gallery-item"),
                content: listWidget(() => mockContent),
                onClick: listAction(),
                ariaLabelItem: listExpression(() => "Gallery Item Label")
            }
        } as unknown as DerivedPropsGate<any>;

        const viewModel = new GalleryItemViewModel(mockGate);
        expect(viewModel.class(mockItem)).toBe("gallery-item");
        expect(viewModel.content(mockItem)).toBe(mockContent);
        expect(viewModel.label(mockItem)).toBe("Gallery Item Label");
        expect(viewModel.hasOnClick(mockItem)).toBe(true);
    });
});
