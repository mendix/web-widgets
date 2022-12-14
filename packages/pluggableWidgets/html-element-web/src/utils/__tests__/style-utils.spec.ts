import { convertInlineCssToReactStyle } from "../style-utils";

describe("style-utils", () => {
    it("converts usual properties", () => {
        const style = convertInlineCssToReactStyle("background-color: red; border-radius: 20px");

        expect(style).toEqual({
            backgroundColor: "red",
            borderRadius: "20px"
        });
    });
    it("converts properties with no space between props and names", () => {
        const style = convertInlineCssToReactStyle("background-color:#FF00FF");

        expect(style).toEqual({
            backgroundColor: "#FF00FF"
        });
    });
    it("converts properties with multiple spaces and newlines between props and names", () => {
        const style = convertInlineCssToReactStyle("background-color \n\n : \n    #FF00FF");

        expect(style).toEqual({
            backgroundColor: "#FF00FF"
        });
    });
    it("converts properties with colons inside", () => {
        const style = convertInlineCssToReactStyle("background-image: url(http://localhost:8080/img.png)");

        expect(style).toEqual({
            backgroundImage: "url(http://localhost:8080/img.png)"
        });
    });
    it("ignores broken properties", () => {
        const style = convertInlineCssToReactStyle("background-color: red; ; foo-bar");

        expect(style).toEqual({
            backgroundColor: "red"
        });
    });
    it("doesn't convert css variables", () => {
        const style = convertInlineCssToReactStyle("--super-custom-var: red");

        expect(style).toEqual({
            "--super-custom-var": "red"
        });
    });
    it("converts vendor prefixes", () => {
        const style = convertInlineCssToReactStyle(
            "-moz-color: orange; -o-color: blue; -webkit-color: green; -ms-color: red"
        );
        expect(style).toEqual({
            MozColor: "orange",
            OColor: "blue",
            WebkitColor: "green",
            msColor: "red"
        });
    });
});
