import Header from "quill/formats/header";
import "./header.scss";

class CustomHeader extends Header {
    static tagName = ["H1", "H2", "H3", "H4", "H5", "H6", "p"];
}

export default CustomHeader;
