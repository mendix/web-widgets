import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ReactElement } from "react";
import { TranslationProvider, useT } from "..";

function Probe(): ReactElement {
    const t = useT();
    return <span>{t("toolbar.bold")}</span>;
}

describe("TranslationProvider + useT", () => {
    const originalLang = document.documentElement.lang;

    afterEach(() => {
        document.documentElement.lang = originalLang;
    });

    it("resolves strings in the page language", () => {
        document.documentElement.lang = "nl";
        render(
            <TranslationProvider>
                <Probe />
            </TranslationProvider>
        );
        expect(screen.getByText("Vet")).toBeInTheDocument();
    });

    it("falls back to English for an unbundled page language", () => {
        document.documentElement.lang = "xx";
        render(
            <TranslationProvider>
                <Probe />
            </TranslationProvider>
        );
        expect(screen.getByText("Bold")).toBeInTheDocument();
    });

    it("renders English when no provider is mounted", () => {
        render(<Probe />);
        expect(screen.getByText("Bold")).toBeInTheDocument();
    });
});
