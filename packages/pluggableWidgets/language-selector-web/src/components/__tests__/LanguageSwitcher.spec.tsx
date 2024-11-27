import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createElement } from "react";
import { PositionEnum, TriggerEnum } from "typings/LanguageSelectorProps";
import { LanguageSwitcher, LanguageSwitcherProps } from "../LanguageSwitcher";
import "@testing-library/jest-dom";

jest.useFakeTimers();

let props: LanguageSwitcherProps = {
    currentLanguage: undefined,
    languageList: [],
    position: "left" as PositionEnum,
    onSelect: jest.fn(),
    trigger: "click" as TriggerEnum,
    className: "",
    tabIndex: 0
};
const language = { _guid: "111", value: "En us" };

describe("Language switcher", () => {
    it("renders the structure with empty language list", async () => {
        const { asFragment } = render(<LanguageSwitcher {...props} />);
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const triggerElement = screen.getByRole("combobox");

        await user.click(triggerElement);
        expect(asFragment()).toMatchSnapshot();
    });

    it("renders the structure with language list and selected default language", async () => {
        props = { ...props, languageList: [language], currentLanguage: language };
        const { asFragment } = render(<LanguageSwitcher {...props} />);
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const triggerElement = screen.getByRole("combobox");

        await user.click(triggerElement);
        expect(asFragment()).toMatchSnapshot();
    });
});
