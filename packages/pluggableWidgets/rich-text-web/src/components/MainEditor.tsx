import { memo } from "react";
import { useCKEditor, CKEditorHookProps } from "ckeditor4-react";

export interface MainEditorProps {
    config: CKEditorHookProps<never>;
}

// Main idea of this component is to make sure it's never rerenders.
// This is why we pass function that always returns true.
export const MainEditor = memo(
    // eslint-disable-next-line prefer-arrow-callback
    function MainEditor({ config }: MainEditorProps): null {
        useCKEditor(config);
        return null;
    },
    () => true
);
