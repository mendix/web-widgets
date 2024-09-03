import Quill from "quill";
import MendixTheme from "./themes/mendix";
import "./formats/fonts";
import "./formats/fontsize";
import CustomListItem from "./formats/customList";
import CustomLink from "./formats/link";
import CustomVideo from "./formats/video";

Quill.register({ "themes/snow": MendixTheme }, true);
Quill.register(CustomListItem, true);
Quill.register(CustomLink, true);
Quill.register(CustomVideo, true);
