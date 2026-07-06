import { readFileSync } from "fs";
import { join } from "path";
import { fireEvent, render, screen } from "@testing-library/react";
import { CodeEditor } from "../CodeEditor";

describe("CodeEditor", () => {
    it("renders JSON value with syntax highlighting", () => {
        const { container } = render(<CodeEditor value='{"type":"scatter","x":[1,2,3]}' />);

        // highlight.js wraps tokens in .hljs-* spans; a bare textarea would not.
        expect(container.querySelector(".hljs-attr, .hljs-string, .hljs-number")).not.toBeNull();
    });

    it("calls onChange with the new text when edited", () => {
        const onChange = jest.fn();
        render(<CodeEditor value="{}" onChange={onChange} />);

        fireEvent.input(screen.getByRole("textbox"), { target: { value: '{"a":1}' } });

        expect(onChange).toHaveBeenCalledWith('{"a":1}');
    });

    it("disables the editor when readOnly", () => {
        render(<CodeEditor value="{}" readOnly />);

        // The disabled textarea is what blocks user edits in the modeler panel.
        expect((screen.getByRole("textbox") as HTMLTextAreaElement).disabled).toBe(true);
    });

    it("surfaces an error for invalid JSON", () => {
        render(<CodeEditor value='{"type": ' />);

        // Malformed JSON must be flagged, not silently accepted.
        expect(screen.queryByRole("alert")).not.toBeNull();
    });

    it("shows no error for valid JSON", () => {
        render(<CodeEditor value='{"a":1}' />);

        expect(screen.queryByRole("alert")).toBeNull();
    });

    it("shows no error for an empty value", () => {
        render(<CodeEditor value="" />);

        // Empty is not invalid.
        expect(screen.queryByRole("alert")).toBeNull();
    });

    it("honors the height prop (unchanged prop contract)", () => {
        render(<CodeEditor value="{}" height="300px" />);

        // react-simple-code-editor applies the style prop to its container (parent of the textarea).
        const container = screen.getByRole("textbox").parentElement as HTMLElement;
        expect(container.style.height).toBe("300px");
    });

    it("does not reintroduce CodeMirror (the v6.3.0 bundling break)", () => {
        const pkg = JSON.parse(readFileSync(join(__dirname, "../../../package.json"), "utf8"));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        const codeMirrorDep = Object.keys(deps).find(name => /codemirror/i.test(name));

        expect(codeMirrorDep).toBeUndefined();
    });
});
