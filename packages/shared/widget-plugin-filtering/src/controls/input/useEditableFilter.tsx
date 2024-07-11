import { createElement, useState } from "react";

import { InputFilterInterface } from "../../main";
import { EditableFilterStore } from "./EditableFilterStore";

export function useEditableFilter(filter: InputFilterInterface): void {
    const [ed] = useState(() => new EditableFilterStore({ filter }));
    <input type="text" value={ed.input1.value} onChange={ed.input1.onChange} />;
}
