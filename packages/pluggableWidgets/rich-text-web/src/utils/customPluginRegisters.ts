import Quill from "quill";
import MendixTheme from "./themes/mendix";
import "./formats/fonts";
import "./formats/fontsize";
import CustomListItem from "./formats/customList";
import CustomLink from "./formats/link";
import CustomVideo from "./formats/video";
import { Attributor } from "parchment";
const direction = Quill.import("attributors/style/direction") as Attributor;
const alignment = Quill.import("attributors/style/align") as Attributor;
import { IndentLeftStyle, IndentRightStyle } from "./formats/indent";

class Empty {}

Quill.debug("error");
Quill.register({ "themes/snow": MendixTheme }, true);
Quill.register(CustomListItem, true);
Quill.register(CustomLink, true);
Quill.register(CustomVideo, true);
Quill.register(direction, true);
Quill.register(alignment, true);
Quill.register(IndentLeftStyle, true);
Quill.register(IndentRightStyle, true);
Quill.register({ "ui/view-code": Empty });
