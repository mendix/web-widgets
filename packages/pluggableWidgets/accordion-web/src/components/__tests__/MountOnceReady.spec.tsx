import "@testing-library/jest-dom";
import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { MountOnceReady } from "../MountOnceReady";

describe("MountOnceReady", () => {
    it("do not mount children if ready prop is always 'false'", () => {
        const max = 10;
        const min = 3;
        const rerenderCount = Math.floor(Math.random() * (max - min)) + min;
        const text = "Should not be mounted";
        const child = (): JSX.Element => <div>{text}</div>;

        const { rerender } = render(<MountOnceReady ready={false}>{child()}</MountOnceReady>);
        expect(screen.queryByText(text)).toBeNull();

        for (let n = 0; n < rerenderCount; n += 1) {
            rerender(<MountOnceReady ready={false}>{child()}</MountOnceReady>);
            expect(screen.queryByText(text)).toBeNull();
        }
    });

    it("mount content once ready prop became 'true'", async () => {
        const text = "Should be mounted";
        const child = (): JSX.Element => <div>{text}</div>;

        const { rerender } = render(<MountOnceReady ready={false}>{child()}</MountOnceReady>);
        expect(screen.queryByText(text)).toBeNull();

        rerender(<MountOnceReady ready={false}>{child()}</MountOnceReady>);
        expect(screen.queryByText(text)).toBeNull();

        rerender(<MountOnceReady ready>{child()}</MountOnceReady>);
        expect(await screen.findByText(text)).toBeVisible();
    });

    it("stay mounted if ready change from 'true' to 'false'", async () => {
        const text = "Should be mounted";
        const child = (): JSX.Element => <div>{text}</div>;

        const { rerender } = render(<MountOnceReady ready={false}>{child()}</MountOnceReady>);
        expect(screen.queryByText(text)).toBeNull();

        rerender(<MountOnceReady ready>{child()}</MountOnceReady>);
        expect(await screen.findByText(text)).toBeVisible();

        rerender(<MountOnceReady ready={false}>{child()}</MountOnceReady>);
        expect(await screen.findByText(text)).toBeVisible();

        rerender(<MountOnceReady ready>{child()}</MountOnceReady>);
        expect(await screen.findByText(text)).toBeVisible();

        rerender(<MountOnceReady ready={false}>{child()}</MountOnceReady>);
        expect(await screen.findByText(text)).toBeVisible();
    });

    it("mount right away if ready is 'true' on initial render", async () => {
        const text = "Should be right away";
        const child = (): JSX.Element => <div>{text}</div>;

        const { rerender } = render(<MountOnceReady ready>{child()}</MountOnceReady>);
        expect(await screen.findByText(text)).toBeVisible();

        rerender(<MountOnceReady ready={false}>{child()}</MountOnceReady>);
        expect(await screen.findByText(text)).toBeVisible();

        rerender(<MountOnceReady ready>{child()}</MountOnceReady>);
        expect(await screen.findByText(text)).toBeVisible();
    });
});
