import { ReactElement } from "react";
import { IAceEditorProps } from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
interface CodeEditorProps {
    onChange?: IAceEditorProps["onChange"];
    onValidate?: IAceEditorProps["onValidate"];
    overwriteValue?: string;
    readOnly?: IAceEditorProps["readOnly"];
    value: string;
}
export declare const CodeEditor: ({
    readOnly,
    value,
    onChange,
    onValidate,
    overwriteValue
}: CodeEditorProps) => ReactElement;
export {};
//# sourceMappingURL=CodeEditor.d.ts.map
