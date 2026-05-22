import { Editor } from "@tiptap/react";
import { createContext, useContext, useReducer, ReactNode, ReactElement, Dispatch } from "react";

// Code view state
export interface CodeViewState {
    isCodeView: boolean;
    htmlCode: string;
    showConfirm: boolean;
}

// Code view actions
export type CodeViewAction =
    | { type: "ENTER_CODE_VIEW"; html: string }
    | { type: "EXIT_CODE_VIEW_REQUEST" }
    | { type: "SAVE_CODE_CHANGES" }
    | { type: "CANCEL_CODE_CHANGES" }
    | { type: "UPDATE_HTML_CODE"; html: string };

// Code view reducer
function codeViewReducer(state: CodeViewState, action: CodeViewAction): CodeViewState {
    switch (action.type) {
        case "ENTER_CODE_VIEW":
            return {
                isCodeView: true,
                htmlCode: action.html,
                showConfirm: false
            };
        case "EXIT_CODE_VIEW_REQUEST":
            return {
                ...state,
                showConfirm: true
            };
        case "SAVE_CODE_CHANGES":
            return {
                isCodeView: false,
                htmlCode: "",
                showConfirm: false
            };
        case "CANCEL_CODE_CHANGES":
            return {
                isCodeView: false,
                htmlCode: "",
                showConfirm: false
            };
        case "UPDATE_HTML_CODE":
            return {
                ...state,
                htmlCode: action.html
            };
        default:
            return state;
    }
}

// Initial state
const initialCodeViewState: CodeViewState = {
    isCodeView: false,
    htmlCode: "",
    showConfirm: false
};

interface EditorContextValue {
    editor: Editor | null;
    codeViewState: CodeViewState;
    codeViewDispatch: Dispatch<CodeViewAction>;
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

export function EditorContextProvider({
    editor,
    children
}: {
    editor: Editor | null;
    children: ReactNode;
}): ReactElement {
    const [codeViewState, codeViewDispatch] = useReducer(codeViewReducer, initialCodeViewState);

    return (
        <EditorContext.Provider value={{ editor, codeViewState, codeViewDispatch }}>{children}</EditorContext.Provider>
    );
}

export function useCurrentEditor(): EditorContextValue {
    const context = useContext(EditorContext);
    if (context === undefined) {
        throw new Error("useCurrentEditor must be used within EditorContextProvider");
    }
    return context;
}
