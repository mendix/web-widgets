import { Attributor } from "parchment";
import Quill from "quill";
const Size = Quill.import("attributors/style/size") as Attributor;

import "./fonts.scss";

export const FONT_SIZE_LIST = [
    "8px",
    "9px",
    "10px",
    "12px",
    "14px",
    "16px",
    "20px",
    "24px",
    "32px",
    "42px",
    "54px",
    "68px",
    "84px",
    "98px"
];

Size.whitelist = FONT_SIZE_LIST;
Quill.register(Size, true);
