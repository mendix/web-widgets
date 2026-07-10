import { WebIcon, WebImage } from "mendix";
import { dynamic } from "@mendix/widget-plugin-test-utils";
import { getImageProps, GetImagePropsInput } from "../getImageProps";

const webImage = (uri: string): WebImage => ({ uri, name: "test.jpg" });

describe("getImageProps", () => {
    describe('datasource: "image"', () => {
        it("returns the main image URI when main image is available", () => {
            const input: GetImagePropsInput = {
                datasource: "image",
                imageObject: dynamic.available(webImage("https://example.com/main.jpg"))
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: "https://example.com/main.jpg" });
        });

        it("returns the main image URI when main image is loading (uri present)", () => {
            const input: GetImagePropsInput = {
                datasource: "image",
                imageObject: dynamic.loading(webImage("https://example.com/main.jpg"))
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: "https://example.com/main.jpg" });
        });

        it("returns undefined image when main image is loading (no uri yet)", () => {
            const input: GetImagePropsInput = {
                datasource: "image",
                imageObject: dynamic.loading<WebImage>()
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: undefined });
        });

        it("falls back to defaultImage when main image is unavailable and fallback is available", () => {
            const input: GetImagePropsInput = {
                datasource: "image",
                imageObject: dynamic.unavailable<WebImage>(),
                defaultImageDynamic: dynamic.available(webImage("https://example.com/fallback.jpg"))
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: "https://example.com/fallback.jpg" });
        });

        it("falls back to defaultImage when main image is unavailable and fallback is loading", () => {
            const input: GetImagePropsInput = {
                datasource: "image",
                imageObject: dynamic.unavailable<WebImage>(),
                defaultImageDynamic: dynamic.loading(webImage("https://example.com/fallback.jpg"))
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: "https://example.com/fallback.jpg" });
        });

        it("returns undefined image when both main image and fallback are unavailable", () => {
            const input: GetImagePropsInput = {
                datasource: "image",
                imageObject: dynamic.unavailable<WebImage>(),
                defaultImageDynamic: dynamic.unavailable<WebImage>()
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: undefined });
        });

        it("returns undefined image when imageObject and defaultImageDynamic are not provided", () => {
            const input: GetImagePropsInput = { datasource: "image" };
            expect(getImageProps(input)).toEqual({ type: "image", image: undefined });
        });

        it("does not use defaultImage when main image is available", () => {
            const input: GetImagePropsInput = {
                datasource: "image",
                imageObject: dynamic.available(webImage("https://example.com/main.jpg")),
                defaultImageDynamic: dynamic.available(webImage("https://example.com/fallback.jpg"))
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: "https://example.com/main.jpg" });
        });
    });

    describe('datasource: "imageUrl"', () => {
        it("returns the URL when imageUrl is available", () => {
            const input: GetImagePropsInput = {
                datasource: "imageUrl",
                imageUrl: dynamic.available("https://example.com/image.jpg")
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: "https://example.com/image.jpg" });
        });

        it("returns stale URL when imageUrl is loading with a cached value", () => {
            const input: GetImagePropsInput = {
                datasource: "imageUrl",
                imageUrl: dynamic.loading("https://example.com/image.jpg")
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: "https://example.com/image.jpg" });
        });

        it("returns undefined image when imageUrl is loading with no cached value", () => {
            const input: GetImagePropsInput = {
                datasource: "imageUrl",
                imageUrl: dynamic.loading<string>()
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: undefined });
        });

        it("returns undefined image when imageUrl is unavailable", () => {
            const input: GetImagePropsInput = {
                datasource: "imageUrl",
                imageUrl: dynamic.unavailable<string>()
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: undefined });
        });

        it("returns undefined image when imageUrl is not provided", () => {
            const input: GetImagePropsInput = { datasource: "imageUrl" };
            expect(getImageProps(input)).toEqual({ type: "image", image: undefined });
        });
    });

    describe('datasource: "icon"', () => {
        it("returns glyph icon class when a glyph icon is available", () => {
            const glyphIcon: WebIcon = { type: "glyph", iconClass: "glyphicon-star" };
            const input: GetImagePropsInput = {
                datasource: "icon",
                imageIcon: dynamic.available(glyphIcon)
            };
            expect(getImageProps(input)).toEqual({ type: "glyph", image: "glyphicon-star" });
        });

        it("returns image icon URL when an image icon is available", () => {
            const imageIcon: WebIcon = { type: "image", iconUrl: "https://example.com/icon.png" };
            const input: GetImagePropsInput = {
                datasource: "icon",
                imageIcon: dynamic.available(imageIcon)
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: "https://example.com/icon.png" });
        });

        it("returns mx-icon class when a named icon is available", () => {
            const namedIcon: WebIcon = { type: "icon", iconClass: "mx-icon-star" };
            const input: GetImagePropsInput = {
                datasource: "icon",
                imageIcon: dynamic.available(namedIcon)
            };
            expect(getImageProps(input)).toEqual({ type: "icon", image: "mx-icon-star" });
        });

        it("returns fallback when imageIcon is loading", () => {
            const input: GetImagePropsInput = {
                datasource: "icon",
                imageIcon: dynamic.loading<WebIcon>()
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: undefined });
        });

        it("returns fallback when imageIcon is unavailable", () => {
            const input: GetImagePropsInput = {
                datasource: "icon",
                imageIcon: dynamic.unavailable<WebIcon>()
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: undefined });
        });

        it("returns fallback when imageIcon value is undefined (WebIcon = undefined)", () => {
            const input: GetImagePropsInput = {
                datasource: "icon",
                imageIcon: dynamic.available(undefined as WebIcon)
            };
            expect(getImageProps(input)).toEqual({ type: "image", image: undefined });
        });

        it("returns fallback when imageIcon is not provided", () => {
            const input: GetImagePropsInput = { datasource: "icon" };
            expect(getImageProps(input)).toEqual({ type: "image", image: undefined });
        });
    });

    describe("unknown datasource", () => {
        it("returns fallback for an unrecognised datasource value", () => {
            const input = { datasource: "unknown" as GetImagePropsInput["datasource"] };
            expect(getImageProps(input)).toEqual({ type: "image", image: undefined });
        });
    });
});
