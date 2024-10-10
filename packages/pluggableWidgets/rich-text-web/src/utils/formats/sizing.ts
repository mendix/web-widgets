import { Attributor, Scope, StyleAttributor } from "parchment";

const config = {
    scope: Scope.BLOCK
};

const HeightAttribute = new Attributor("height", "height", config);
const HeightStyle = new StyleAttributor("height", "height", config);

const WidthAttribute = new Attributor("width", "width", config);
const WidthStyle = new StyleAttributor("width", "width", config);

export { HeightAttribute, HeightStyle, WidthAttribute, WidthStyle };
