import { Youtube } from "@tiptap/extension-youtube";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { YouTubeResize as YouTubeResizeComponent } from "../components/YouTubeResize";

export const YouTubeResize = Youtube.extend({
    addNodeView() {
        return ReactNodeViewRenderer(YouTubeResizeComponent);
    }
});
