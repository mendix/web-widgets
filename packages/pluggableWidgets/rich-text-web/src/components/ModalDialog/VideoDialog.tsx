import { createElement, ReactElement, useState, ChangeEvent, Fragment } from "react";
import { If } from "@mendix/widget-plugin-component-kit/If";
import { DialogContent, DialogHeader, DialogBody, FormControl, DialogFooter } from "./DialogContent";
import classNames from "classnames";
import { type videoConfigType, type videoEmbedConfigType } from "../../utils/formats";

export type VideoFormType = videoConfigType | videoEmbedConfigType;

export interface VideoDialogProps {
    onSubmit(value: VideoFormType): void;
    onClose(): void;
}

export function getValueType(value: VideoFormType): VideoFormType {
    return Object.hasOwn(value, "src") && (value as videoConfigType).src !== undefined
        ? (value as videoConfigType)
        : (value as videoEmbedConfigType);
}

function GeneralVideoDialog(props: VideoDialogProps): ReactElement {
    const { onSubmit, onClose } = props;
    const [formState, setFormState] = useState<videoConfigType>({
        src: "",
        width: 560,
        height: 314
    });

    const onInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <Fragment>
            <FormControl label="URL">
                <input className="form-control" type="url" name="src" onChange={onInputChange} value={formState.src} />
            </FormControl>
            <FormControl label="Width">
                <input
                    className="form-control"
                    type="number"
                    name="width"
                    onChange={onInputChange}
                    value={formState.width}
                />
            </FormControl>
            <FormControl label="Height">
                <input
                    className="form-control"
                    type="number"
                    name="height"
                    onChange={onInputChange}
                    value={formState.height}
                />
            </FormControl>
            <DialogFooter onSubmit={() => onSubmit(formState)} onClose={onClose}></DialogFooter>
        </Fragment>
    );
}

function EmbedVideoDialog(props: VideoDialogProps): ReactElement {
    const { onSubmit, onClose } = props;
    const [formState, setFormState] = useState<videoEmbedConfigType>({
        embedcode: ""
    });

    const onInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    return (
        <Fragment>
            <FormControl label="URL">
                {" "}
                <textarea
                    className="form-control"
                    name="embedcode"
                    onChange={onInputChange}
                    value={formState.embedcode}
                />
            </FormControl>

            <DialogFooter onSubmit={() => onSubmit(formState)} onClose={onClose}></DialogFooter>
        </Fragment>
    );
}

export default function VideoDialog(props: VideoDialogProps): ReactElement {
    const { onClose } = props;
    const [activeTab, setActiveTab] = useState("general");

    return (
        <DialogContent className="video-dialog">
            <DialogHeader onClose={onClose}>Insert/Edit Media</DialogHeader>
            <DialogBody>
                <div>
                    <ul className="nav nav-tabs mx-tabcontainer-tabs" role="tablist">
                        <li
                            role="presentation"
                            className={classNames({
                                active: activeTab === "general"
                            })}
                            onClick={() => setActiveTab("general")}
                        >
                            <a href="#">General</a>
                        </li>
                        <li
                            role="presentation"
                            className={classNames({
                                active: activeTab === "embed"
                            })}
                            onClick={() => setActiveTab("embed")}
                        >
                            <a href="#">Embed</a>
                        </li>
                    </ul>
                </div>
                <div>
                    <If condition={activeTab === "general"}>
                        <GeneralVideoDialog {...props} />
                    </If>
                    <If condition={activeTab === "embed"}>
                        <EmbedVideoDialog {...props} />
                    </If>
                </div>
            </DialogBody>
        </DialogContent>
    );
}
