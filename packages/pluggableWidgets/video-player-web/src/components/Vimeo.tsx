import { Component, ReactElement } from "react";
import { validateUrl } from "../utils/Utils";

export interface VimeoProps {
    url: string;
    autoPlay: boolean;
    loop: boolean;
    muted: boolean;
    aspectRatio?: boolean;
    title?: string;
}

export class Vimeo extends Component<VimeoProps> {
    private handleAttributes = this.getUrlAttributes.bind(this);

    render(): ReactElement {
        return (
            <iframe
                className="widget-video-player-iframe"
                src={this.generateUrl(this.props.url)}
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
                title={this.props.title}
            />
        );
    }

    private generateUrl(url: string): string {
        const attributes = this.handleAttributes();
        try {
            if (url.includes("player.vimeo.com")) {
                return `${url}${attributes}`;
            }

            const urlVimeoSplit = url.split("/");
            if (urlVimeoSplit.length > 0) {
                const id = urlVimeoSplit[urlVimeoSplit.length - 1];
                if (Number(id) > 0 && isFinite(Number(id))) {
                    return `https://player.vimeo.com/video/${id}${attributes}`;
                }
            }
        } catch (_e: unknown) {
            return url;
        }
        return url;
    }

    private getUrlAttributes(): string {
        let attributes = "?dnt=1";
        attributes += "&autoplay=" + (this.props.autoPlay ? "1" : "0");
        attributes += "&muted=" + (this.props.muted ? "1" : "0");
        attributes += "&loop=" + (this.props.loop ? "1" : "0");
        return attributes;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    public static canPlay(url: string): boolean {
        return !!url && !!validateUrl(url) && url.indexOf("vimeo.com") > -1;
    }
}
