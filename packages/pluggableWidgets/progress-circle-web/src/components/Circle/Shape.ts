/* 
https://github.com/kimmobrunfeldt/progressbar.js/blob/master/src/shape.js
The MIT License (MIT)

Copyright (c) 2015 Kimmo Brunfeldt

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 
*/

import { extend, isObject, isString, removeChildren, setStyles, floatEquals } from "./Utils";
import Path from "./Path";
import { ShapeOptions } from "./Types";

const DESTROYED_ERROR = "Object is destroyed";

class Shape {
    _opts?: ShapeOptions;
    _container?: HTMLElement;
    svg?: SVGElement;
    path?: SVGPathElement;
    trail?: SVGPathElement;
    text?: HTMLElement;
    _progressPath?: Path;
    containerAspectRatio?: number;

    constructor(container: string | HTMLElement, opts: ShapeOptions) {
        // Throw a better error if progress bars are not initialized with `new` keyword
        if (!(this instanceof Shape)) {
            throw new Error("Constructor was called without new keyword");
        }

        // Prevent calling constructor without parameters so inheritance works correctly.
        if (arguments.length === 0) {
            return;
        }

        this._opts = extend(
            {
                color: "#555",
                strokeWidth: 1.0,
                trailColor: undefined,
                trailWidth: undefined,
                fill: undefined,
                text: {
                    style: {
                        color: "",
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        padding: 0,
                        margin: 0,
                        transform: "translate(-50%, -50%)"
                    },
                    autoStyleContainer: true,
                    alignToBottom: true,
                    value: null,
                    className: "progressbar-text"
                },
                svgStyle: {
                    display: "block",
                    width: "100%"
                },
                warnings: false
            },
            opts
        );

        const svgView = this._createSvgView(this._opts);

        let element: HTMLElement | null;
        if (isString(container)) {
            element = document.querySelector(container);
        } else {
            element = container;
        }

        if (!element) {
            throw new Error("Container does not exist: " + container);
        }

        this._container = element;
        this._container.appendChild(svgView.svg);
        if (this._opts.warnings) {
            this._warnContainerAspectRatio(this._container);
        }

        if (this._opts.svgStyle) {
            setStyles(svgView.svg, this._opts.svgStyle);
        }

        this.svg = svgView.svg;
        this.path = svgView.path;
        this.trail = svgView.trail;
        this.text = undefined;

        const newOpts = extend({ attachment: undefined, shape: this }, this._opts);
        this._progressPath = new Path(svgView.path, newOpts);

        if (isObject(this._opts.text) && this._opts.text.value !== null) {
            this.setText(this._opts.text.value);
        }
    }

    animate(progress: number, opts?: any, cb?: () => any): void {
        if (this._progressPath === null) {
            throw new Error(DESTROYED_ERROR);
        }

        this._progressPath?.animate(progress, opts, cb);
    }

    stop(): void {
        if (this._progressPath === null) {
            throw new Error(DESTROYED_ERROR);
        }

        if (this._progressPath === undefined) {
            return;
        }

        this._progressPath.stop();
    }

    pause(): void {
        if (this._progressPath === null) {
            throw new Error(DESTROYED_ERROR);
        }

        if (this._progressPath === undefined) {
            return;
        }

        if (!this._progressPath._tweenable) {
            return;
        }

        this._progressPath._tweenable.pause();
    }

    resume(): void {
        if (this._progressPath === null) {
            throw new Error(DESTROYED_ERROR);
        }

        if (this._progressPath === undefined) {
            return;
        }

        if (!this._progressPath._tweenable) {
            return;
        }

        this._progressPath._tweenable.resume();
    }

    destroy(): void {
        if (this._progressPath === null) {
            throw new Error(DESTROYED_ERROR);
        }

        this.stop();
        this.svg?.parentNode?.removeChild(this.svg);
        this.svg = undefined;
        this.path = undefined;
        this.trail = undefined;
        this._progressPath = undefined;

        if (this.text !== null) {
            this.text?.parentNode?.removeChild(this.text);
            this.text = undefined;
        }
    }

    set(progress: number): void {
        if (this._progressPath === null) {
            throw new Error(DESTROYED_ERROR);
        }

        this._progressPath?.set(progress);
    }

    value(): number {
        if (this._progressPath === null) {
            throw new Error(DESTROYED_ERROR);
        }

        if (this._progressPath === undefined) {
            return 0;
        }

        return this._progressPath.value();
    }

    setText(newText: string | HTMLElement): void {
        if (this._progressPath === null) {
            throw new Error(DESTROYED_ERROR);
        }

        if (this.text === null) {
            this.text = this._createTextContainer(this._opts, this._container);
            this._container?.appendChild(this.text);
        }

        if (isObject(newText)) {
            removeChildren(this.text);
            this.text?.appendChild(newText);
        } else {
            if (this.text !== undefined) {
                this.text.innerHTML = newText;
            }
        }
    }

    _createSvgView(opts: ShapeOptions): { svg: SVGElement; path: SVGPathElement; trail: SVGPathElement | undefined } {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this._initializeSvg(svg);

        let trailPath;
        if (opts.trailColor || opts.trailWidth) {
            trailPath = this._createTrail(opts);
            svg.appendChild(trailPath);
        }

        const path = this._createPath(opts);
        svg.appendChild(path);

        return {
            svg,
            path,
            trail: trailPath
        };
    }

    _initializeSvg(svg: SVGElement): void {
        svg.setAttribute("viewBox", "0 0 100 100");
    }

    _createPath(opts: any): SVGPathElement {
        const pathString = this._pathString(opts);
        return this._createPathElement(pathString, opts);
    }

    _createTrail(opts: any): SVGPathElement {
        const pathString = this._trailString(opts);

        const newOpts = extend({}, opts);
        if (!newOpts.trailColor) {
            newOpts.trailColor = "#eee";
        }
        if (!newOpts.trailWidth) {
            newOpts.trailWidth = newOpts.strokeWidth;
        }

        newOpts.color = newOpts.trailColor;
        newOpts.strokeWidth = newOpts.trailWidth;
        newOpts.fill = undefined;

        return this._createPathElement(pathString, newOpts);
    }

    _createPathElement(pathString: string, opts: any): SVGPathElement {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathString);
        path.setAttribute("stroke", opts.color);
        path.setAttribute("stroke-width", opts.strokeWidth);

        if (opts.fill) {
            path.setAttribute("fill", opts.fill);
        } else {
            path.setAttribute("fill-opacity", "0");
        }

        return path;
    }

    _createTextContainer(opts: any, container: HTMLElement | undefined): HTMLDivElement {
        const textContainer = document.createElement("div");
        textContainer.className = opts.text.className;

        const textStyle = opts.text.style;
        if (textStyle) {
            if (opts.text.autoStyleContainer) {
                container?.style.setProperty("position", "relative");
            }

            setStyles(textContainer, textStyle);
            if (!textStyle.color) {
                textContainer.style.color = opts.color;
            }
        }
        return textContainer;
    }

    _pathString(opts: ShapeOptions): string {
        throw new Error(`Override this function for each progress bar ${JSON.stringify(opts)}`);
    }

    _trailString(opts: ShapeOptions): string {
        throw new Error(`Override this function for each progress bar ${JSON.stringify(opts)}`);
    }

    _warnContainerAspectRatio(container: HTMLElement): void {
        if (!this.containerAspectRatio) {
            return;
        }

        const computedStyle = window.getComputedStyle(container, null);
        const width = parseFloat(computedStyle.getPropertyValue("width"));
        const height = parseFloat(computedStyle.getPropertyValue("height"));
        if (!floatEquals(this.containerAspectRatio, width / height)) {
            console.warn(
                "Incorrect aspect ratio of container",
                "#" + container.id,
                "detected:",
                computedStyle.getPropertyValue("width") + "(width)",
                "/",
                computedStyle.getPropertyValue("height") + "(height)",
                "=",
                width / height
            );

            console.warn("Aspect ratio of should be", this.containerAspectRatio);
        }
    }
}

export default Shape;
