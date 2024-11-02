import { If } from "@mendix/widget-plugin-component-kit/If";
import classNames from "classnames";
import { ChangeEvent, createElement, Fragment, ReactElement, useState } from "react";
import { type videoConfigType, type videoEmbedConfigType } from "../../utils/formats";
import { getPatternMatch } from "../../utils/videoUrlPattern";
import { DialogBody, DialogContent, DialogFooter, DialogHeader, FormControl } from "./DialogContent";
import { Range } from "quill";

export type VideoFormType = videoConfigType | videoEmbedConfigType;

export interface VideoDialogProps {
    onSubmit(value: VideoFormType): void;
    onClose(): void;
    selection?: Range | null;
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
        if (e.target.name === "src") {
            const pattern = getPatternMatch(e.target.value);
            setFormState({
                ...formState,
                ...{
                    src: e.target.value,
                    width: pattern?.w || 560,
                    height: pattern?.h || 314
                }
            });
        } else {
            setFormState({ ...formState, [e.target.name]: e.target.value });
        }
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
            <DialogHeader onClose={onClose}>{activeTab === "general" ? "Insert/Edit" : "Embed"} Media</DialogHeader>
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
                            onClick={(e: React.MouseEvent) => {
                                setActiveTab("embed");
                                e.stopPropagation();
                                e.preventDefault();
                            }}
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
