import { Youtube, YoutubeOptions } from "@tiptap/extension-youtube";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { YouTubeResize as YouTubeResizeComponent } from "../components/YouTubeResize";

export type YouTubeResizeOptions = YoutubeOptions & {
    styleDataFormat: "inline" | "class";
};

export const YouTubeResize = Youtube.extend<YouTubeResizeOptions>({
    addOptions() {
        return {
            ...this.parent!(),
            styleDataFormat: "inline"
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(YouTubeResizeComponent);
    }
});
