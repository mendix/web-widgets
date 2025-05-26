const { createElement } = require("react");

module.exports = {
    Icon: ({ icon }) => {
        if (icon && icon.type) {
            if (icon?.type === "glyph") {
                return createElement("span", { className: "glyphicon " + icon?.iconClass });
            }
            if (icon?.type === "image") {
                return createElement("img", { src: icon.iconUrl });
            }
            if (icon?.type === "icon") {
                return createElement("span", { className: icon?.iconClass });
            }
        }
    }
};
