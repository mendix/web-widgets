import { Attributor } from "parchment";
import Quill from "quill";
import QuillResize from "quill-resize-module";
import MxBlock from "./formats/block";
import Button from "./formats/button";
import CustomListItem from "./formats/customList";
import "./formats/fonts";
import "./formats/fontsize";
import Formula from "./formats/formula";
import CustomImage from "./formats/image";
import { IndentLeftStyle, IndentRightStyle } from "./formats/indent";
import QuillTableBetter from "./formats/quill-table-better/quill-table-better";
import SoftBreak from "./formats/softBreak";
import CustomVideo from "./formats/video";
import { WhiteSpaceStyle } from "./formats/whiteSpace";
import MxUploader from "./modules/uploader";
import MendixTheme from "./themes/mxTheme";
import MxScroll from "./modules/scroll";
const direction = Quill.import("attributors/style/direction") as Attributor;
const alignment = Quill.import("attributors/style/align") as Attributor;

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
Quill.register(WhiteSpaceStyle, true);
Quill.register(CustomVideo, true);
Quill.register(CustomImage, true);
Quill.register({ "formats/softbreak": SoftBreak }, true);
Quill.register(direction, true);
Quill.register(alignment, true);
Quill.register(IndentLeftStyle, true);
Quill.register(IndentRightStyle, true);
Quill.register(Formula, true);
Quill.register(Button, true);
Quill.register(MxBlock, true);
Quill.register({ "modules/uploader": MxUploader }, true);
Quill.register({ "blots/scroll": MxScroll }, true);
Quill.register("modules/resize", QuillResize, true);
// add empty handler for view code, this format is handled by toolbar's custom config via ViewCodeDialog
Quill.register({ "ui/view-code": Empty });
Quill.register({ "modules/table-better": QuillTableBetter }, true);
