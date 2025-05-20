import { createElement } from "react";
import { render } from "@testing-library/react";

import { Video } from "../Video";

describe("Video Player", () => {
    it("Renders the structure of youtube tags", () => {
        const { asFragment } = render(
            <Video
                url="http://youtube.com/video/123456"
                poster=""
                autoStart={false}
                showControls={false}
                loop={false}
                muted={false}
                aspectRatio={false}
                preview={false}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("Renders the structure of vimeo tags", () => {
        const { asFragment } = render(
            <Video
                url="http://vimeo.com/123456"
                poster=""
                autoStart={false}
                showControls={false}
                loop={false}
                muted={false}
                aspectRatio={false}
                preview={false}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("Renders the structure of dailymotion tags", () => {
        const { asFragment } = render(
            <Video
                url="http://dailymotion.com/123456"
                poster=""
                autoStart={false}
                showControls={false}
                loop={false}
                muted={false}
                aspectRatio={false}
                preview={false}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("Renders the structure of html5 player tags", () => {
        const { asFragment } = render(
            <Video
                url="http://ext.com/video.mp4"
                poster=""
                autoStart={false}
                showControls={false}
                loop={false}
                muted={false}
                aspectRatio={false}
                preview={false}
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it("Renders the structure with title property", () => {
        const { asFragment } = render(
            <Video
                url="http://youtube.com/video/123456"
                poster=""
                autoStart={false}
                showControls={false}
                loop={false}
                muted={false}
                aspectRatio={false}
                preview={false}
                title="Sample Video Title"
            />
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
