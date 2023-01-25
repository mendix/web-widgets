// import { parseStyle } from "@mendix/pluggable-widgets-commons";
import { createElement, ReactElement } from "react";

import Dropdown from "./Dropdown";

export const preview = (): ReactElement => {
    // TODO: Change PIW preview props typing (class -> className) generation to remove the ts-ignore below
    // @ts-ignore
    return <Dropdown />;
};
