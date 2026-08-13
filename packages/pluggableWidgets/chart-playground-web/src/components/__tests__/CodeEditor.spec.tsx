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
        const { container } = render(<CodeEditor value="{}" height="300px" />);

        // Height is applied to the scrollable wrapper, not react-simple-code-editor's own
        // root — that root must grow with content so its overlaid textarea and highlighted
        // <pre> stay pixel-aligned (a fixed height there desyncs cursor/selection from the
        // visible text once content overflows).
        const wrapper = container.querySelector(".widget-charts-playground-code-editor") as HTMLElement;
        expect(wrapper.style.height).toBe("300px");
    });

    it("moves the caret and scroll position to the start after a paste that replaces the whole value", () => {
        render(<CodeEditor value='{"a":1}' onChange={jest.fn()} />);
        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

        // Selecting everything before pasting is what native textareas treat as
        // "replace the whole value".
        textarea.setSelectionRange(0, textarea.value.length);
        let rafCallback: (() => void) | undefined;
        const rafSpy = jest.spyOn(window, "requestAnimationFrame").mockImplementation(cb => {
            rafCallback = cb as () => void;
            return 0;
        });

        fireEvent.paste(textarea);

        // The paste handler reads the pre-paste selection and schedules a correction for
        // after the browser applies the actual insertion — simulate that insertion now,
        // before flushing the scheduled callback.
        textarea.value = '{\n  "a": 1,\n  "b": 2\n}';
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
        textarea.scrollTop = 40;

        rafCallback?.();

        expect(textarea.selectionStart).toBe(0);
        expect(textarea.selectionEnd).toBe(0);
        expect(textarea.scrollTop).toBe(0);

        rafSpy.mockRestore();
    });

    it("leaves the caret where the user pasted for a partial (non-whole-value) paste", () => {
        render(<CodeEditor value='{"a":1}' onChange={jest.fn()} />);
        const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

        // Caret sits mid-document, no selection — a partial paste, not a whole-value replace.
        textarea.setSelectionRange(3, 3);
        const rafSpy = jest.spyOn(window, "requestAnimationFrame");

        fireEvent.paste(textarea);

        expect(rafSpy).not.toHaveBeenCalled();
        expect(textarea.selectionStart).toBe(3);

        rafSpy.mockRestore();
    });

    it("does not reintroduce CodeMirror (the v6.3.0 bundling break)", () => {
        const pkg = JSON.parse(readFileSync(join(__dirname, "../../../package.json"), "utf8"));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        const codeMirrorDep = Object.keys(deps).find(name => /codemirror/i.test(name));

        expect(codeMirrorDep).toBeUndefined();
    });
});
