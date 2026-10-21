import { render, screen } from "@testing-library/react";
import { ReactElement } from "react";
import { createContextWithStub, getGlobalFilterContextObject } from "../context";
import { getGlobalDynamicModeContext } from "../dynamic/context";
import { EDYNAMICMODE, ENOCONTEXT } from "../errors";
import { withFilterAPI } from "../helpers/withFilterAPI";
import { CustomFilterHost } from "../stores/generic/CustomFilterHost";

const FilterAPI = getGlobalFilterContextObject();
const DynamicMode = getGlobalDynamicModeContext();

const Filter = withFilterAPI(function Filter(): ReactElement {
    return <span>filter widget</span>;
});

function withFilterContext(children: ReactElement): ReactElement {
    const api = createContextWithStub({ filterObserver: new CustomFilterHost(), parentChannelName: "grid" });
    return <FilterAPI.Provider value={api}>{children}</FilterAPI.Provider>;
}

describe("withFilterAPI and Dynamic mode", () => {
    it("renders the widget when there is no Dynamic mode provider", () => {
        render(withFilterContext(<Filter />));
        expect(screen.getByText("filter widget")).toBeTruthy();
    });

    it("renders the widget when Dynamic mode is off", () => {
        render(
            withFilterContext(
                <DynamicMode.Provider value={{ dynamic: false }}>
                    <Filter />
                </DynamicMode.Provider>
            )
        );
        expect(screen.getByText("filter widget")).toBeTruthy();
    });

    it("renders the Dynamic mode error when Dynamic mode is on", () => {
        render(
            withFilterContext(
                <DynamicMode.Provider value={{ dynamic: true }}>
                    <Filter />
                </DynamicMode.Provider>
            )
        );
        expect(screen.queryByText("filter widget")).toBeNull();
        expect(screen.getByText(EDYNAMICMODE.message)).toBeTruthy();
    });

    it("prefers the Dynamic mode error over a missing filter context", () => {
        render(
            <DynamicMode.Provider value={{ dynamic: true }}>
                <Filter />
            </DynamicMode.Provider>
        );
        expect(screen.getByText(EDYNAMICMODE.message)).toBeTruthy();
        expect(screen.queryByText(ENOCONTEXT.message)).toBeNull();
    });
});
