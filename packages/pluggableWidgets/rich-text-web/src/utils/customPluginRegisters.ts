import Quill from "quill";
import MendixTheme from "./themes/mxTheme";
import "./formats/fonts";
import "./formats/fontsize";
import CustomListItem from "./formats/customList";
import CustomLink from "./formats/link";
import CustomVideo from "./formats/video";
import Button from "./formats/button";
import { Attributor } from "parchment";
const direction = Quill.import("attributors/style/direction") as Attributor;
const alignment = Quill.import("attributors/style/align") as Attributor;
import { IndentLeftStyle, IndentRightStyle } from "./formats/indent";
import Formula from "./formats/formula";
import CustomHeader from "./formats/header";
class Empty {
    doSomething(): string {
        return "";
    }
}
/**
 * Custom format registration for quill.
 */
Quill.debug("error");
Quill.register({ "themes/snow": MendixTheme }, true);
Quill.register(CustomListItem, true);
Quill.register(CustomLink, true);
Quill.register(CustomVideo, true);
Quill.register(direction, true);
Quill.register(alignment, true);
Quill.register(IndentLeftStyle, true);
Quill.register(IndentRightStyle, true);
Quill.register(Formula, true);
Quill.register(CustomHeader, true);
Quill.register(Button, true);
// add empty handler for view code, this format is handled by toolbar's custom config via ViewCodeDialog
Quill.register({ "ui/view-code": Empty });
