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
import { IndentLeftClass, IndentRightClass } from "./formats/indent";
import QuillTableBetter from "./formats/quill-table-better/quill-table-better";
import SoftBreak from "./formats/softBreak";
import CustomVideo from "./formats/video";
import { WhiteSpaceClass } from "./formats/whiteSpace";
import MxUploader from "./modules/uploader";
import MendixTheme from "./themes/mxTheme";
import MxScroll from "./modules/scroll";
import MxQuillResize from "./modules/MxQuillResize";
const direction = Quill.import("attributors/class/direction") as Attributor;
const alignment = Quill.import("attributors/class/align") as Attributor;

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
Quill.register(WhiteSpaceClass, true);
Quill.register(CustomVideo, true);
Quill.register(CustomImage, true);
Quill.register({ "formats/softbreak": SoftBreak }, true);
Quill.register(direction, true);
Quill.register(alignment, true);
Quill.register(IndentLeftClass, true);
Quill.register(IndentRightClass, true);
Quill.register(Formula, true);
Quill.register(Button, true);
Quill.register(MxBlock, true);
Quill.register({ "modules/uploader": MxUploader }, true);
Quill.register({ "blots/scroll": MxScroll }, true);
// Use MxQuillResize instead of QuillResize for CSP compliance
// Copy the Modules property from QuillResize to maintain compatibility
MxQuillResize.Modules = QuillResize.Modules;
Quill.register("modules/resize", MxQuillResize, true);
// add empty handler for view code, this format is handled by toolbar's custom config via ViewCodeDialog
Quill.register({ "ui/view-code": Empty });
Quill.register({ "modules/table-better": QuillTableBetter }, true);
