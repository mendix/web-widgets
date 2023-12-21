// Headers:
// Event, Target, Selection method, Action type, Expected effect

export const clickTests = [
    ["click", "cell", "rowClick", "single", "select"],
    ["click", "cell", "rowClick", "double", "select"],
    ["click", "cell", "rowClick", "none", "select"],
    ["click", "cell", "checkbox", "single", "execAction"],
    ["click", "cell", "checkbox", "double", "none"],
    ["click", "cell", "checkbox", "none", "none"],
    ["click", "cell", "none", "single", "execAction"],
    ["click", "cell", "none", "double", "none"],
    ["click", "cell", "none", "none", "none"],
    ["click", "checkbox", "checkbox", "single", "select"],
    ["click", "checkbox", "checkbox", "double", "select"],
    ["click", "checkbox", "checkbox", "none", "select"],
    ["click", "checkbox", "none", "double", "none"],
    ["click", "checkbox", "none", "single", "none"],
    ["click", "checkbox", "none", "none", "none"]
];

export const shiftClickTests = [
    ["shift+click", "cell", "rowClick", "single", "select"],
    ["shift+click", "cell", "rowClick", "double", "select"],
    ["shift+click", "cell", "rowClick", "none", "select"],
    ["shift+click", "cell", "checkbox", "single", "execAction"],
    ["shift+click", "cell", "checkbox", "double", "none"],
    ["shift+click", "cell", "checkbox", "none", "none"],
    ["shift+click", "cell", "none", "single", "execAction"],
    ["shift+click", "cell", "none", "double", "none"],
    ["shift+click", "cell", "none", "none", "none"],
    ["shift+click", "checkbox", "checkbox", "single", "select"],
    ["shift+click", "checkbox", "checkbox", "double", "select"],
    ["shift+click", "checkbox", "checkbox", "none", "select"],
    ["shift+click", "checkbox", "none", "double", "none"],
    ["shift+click", "checkbox", "none", "single", "none"],
    ["shift+click", "checkbox", "none", "none", "none"]
];

export const doubleClickTests = [
    ["dblclick", "cell", "rowClick", "single", "none"],
    ["dblclick", "cell", "rowClick", "double", "execAction"],
    ["dblclick", "cell", "rowClick", "none", "none"],
    ["dblclick", "cell", "checkbox", "single", "none"],
    ["dblclick", "cell", "checkbox", "double", "execAction"],
    ["dblclick", "cell", "checkbox", "none", "none"],
    ["dblclick", "cell", "none", "single", "none"],
    ["dblclick", "cell", "none", "double", "execAction"],
    ["dblclick", "cell", "none", "none", "none"],
    ["dblclick", "checkbox", "checkbox", "single", "none"],
    ["dblclick", "checkbox", "checkbox", "double", "none"],
    ["dblclick", "checkbox", "checkbox", "none", "none"],
    ["dblclick", "checkbox", "none", "double", "none"],
    ["dblclick", "checkbox", "none", "single", "none"],
    ["dblclick", "checkbox", "none", "none", "none"]
];

export const shiftSpaceTests = [
    ["shift+space", "cell", "rowClick", "single", "select"],
    ["shift+space", "cell", "rowClick", "double", "select"],
    ["shift+space", "cell", "rowClick", "none", "select"],
    ["shift+space", "cell", "checkbox", "single", "select"],
    ["shift+space", "cell", "checkbox", "double", "select"],
    ["shift+space", "cell", "checkbox", "none", "select"],
    ["shift+space", "cell", "none", "single", "none"],
    ["shift+space", "cell", "none", "double", "none"],
    ["shift+space", "cell", "none", "none", "none"],
    ["shift+space", "checkbox", "checkbox", "single", "select"],
    ["shift+space", "checkbox", "checkbox", "double", "select"],
    ["shift+space", "checkbox", "checkbox", "none", "select"],
    ["shift+space", "checkbox", "none", "double", "none"],
    ["shift+space", "checkbox", "none", "single", "none"],
    ["shift+space", "checkbox", "none", "none", "none"]
];

export const enterKeyupTests = [
    ["keyup{enter}", "cell", "rowClick", "single", "execAction"],
    ["keyup{enter}", "cell", "rowClick", "double", "execAction"],
    ["keyup{enter}", "cell", "rowClick", "none", "none"],
    ["keyup{enter}", "cell", "checkbox", "single", "execAction"],
    ["keyup{enter}", "cell", "checkbox", "double", "execAction"],
    ["keyup{enter}", "cell", "checkbox", "none", "none"],
    ["keyup{enter}", "cell", "none", "single", "execAction"],
    ["keyup{enter}", "cell", "none", "double", "execAction"],
    ["keyup{enter}", "cell", "none", "none", "none"],
    ["keyup{enter}", "checkbox", "checkbox", "single", "none"],
    ["keyup{enter}", "checkbox", "checkbox", "double", "none"],
    ["keyup{enter}", "checkbox", "checkbox", "none", "none"],
    ["keyup{enter}", "checkbox", "none", "double", "none"],
    ["keyup{enter}", "checkbox", "none", "single", "none"],
    ["keyup{enter}", "checkbox", "none", "none", "none"]
];

export const spaceKeyupTests = [
    ["keyup{space}", "cell", "rowClick", "single", "execAction"],
    ["keyup{space}", "cell", "rowClick", "double", "execAction"],
    ["keyup{space}", "cell", "rowClick", "none", "none"],
    ["keyup{space}", "cell", "checkbox", "single", "execAction"],
    ["keyup{space}", "cell", "checkbox", "double", "execAction"],
    ["keyup{space}", "cell", "checkbox", "none", "none"],
    ["keyup{space}", "cell", "none", "single", "execAction"],
    ["keyup{space}", "cell", "none", "double", "execAction"],
    ["keyup{space}", "cell", "none", "none", "none"],
    ["keyup{space}", "checkbox", "checkbox", "single", "select"],
    ["keyup{space}", "checkbox", "checkbox", "double", "select"],
    ["keyup{space}", "checkbox", "checkbox", "none", "select"],
    ["keyup{space}", "checkbox", "none", "double", "none"],
    ["keyup{space}", "checkbox", "none", "single", "none"],
    ["keyup{space}", "checkbox", "none", "none", "none"]
];
