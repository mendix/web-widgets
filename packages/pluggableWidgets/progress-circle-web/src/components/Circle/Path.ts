/* 
https://github.com/kimmobrunfeldt/progressbar.js/blob/master/src/path.js
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

import shifty, { Tweenable } from "shifty";
import { extend, isFunction, isString } from "./Utils";
import { ShapeOptions, ShapeRenderFunction } from "./Types";

const EASING_ALIASES: { [key: string]: string } = {
    easeIn: "easeInCubic",
    easeOut: "easeOutCubic",
    easeInOut: "easeInOutCubic"
};

class Path {
    private path!: SVGPathElement;
    private _opts: ShapeOptions;
    _tweenable?: Tweenable;

    constructor(path: string | SVGPathElement, opts: ShapeOptions) {
        // Throw a better error if not initialized with `new` keyword
        if (!(this instanceof Path)) {
            throw new Error("Constructor was called without new keyword");
        }

        // Default parameters for animation
        opts = extend(
            {
                delay: 0,
                duration: 800,
                easing: "linear",
                from: {},
                to: {}
            },
            opts
        );

        let element: SVGPathElement | null;
        if (isString(path)) {
            element = document.querySelector(path);
        } else {
            element = path;
        }

        // Reveal .path as public attribute
        if (element !== null) {
            this.path = element;
        }

        this._opts = opts;
        this._tweenable = undefined;
        // Set up the starting positions
        if (this.path instanceof SVGPathElement) {
            const length = this.path.getTotalLength();
            this.path.style.setProperty("stroke-dasharray", `${length} ${length}`);
            this.set(0);
        }
    }

    value(): number {
        const offset = this._getComputedDashOffset();
        const length = this.path.getTotalLength();

        const progress = 1 - offset / length;
        // Round number to prevent returning very small number like 1e-30, which
        // is practically 0
        return parseFloat(progress.toFixed(6));
    }

    set(progress: number): void {
        this.stop();
        this.path.style.setProperty("stroke-dashoffset", this._progressToOffset(progress).toString());

        const render = this._opts.render;
        if (isFunction<ShapeRenderFunction>(render)) {
            const easing = this._easing(this._opts.easing);
            const values = this._calculateTo(progress, easing);
            const reference = this._opts.shape || this;
            render(values, reference);
        }
    }

    stop(): void {
        this._stopTween();
        this.path.style.setProperty("stroke-dashoffset", this._getComputedDashOffset().toString());
    }

    // Method introduced here:
    // http://jakearchibald.com/2013/animated-line-drawing-svg/
    animate(progress: number, opts?: ShapeOptions, cb?: () => any): void {
        opts = opts || {};

        if (isFunction<() => any>(opts)) {
            cb = opts;
            opts = {};
        }

        const passedOpts = extend({}, opts);

        // Copy default opts to new object so defaults are not modified
        const defaultOpts = extend({}, this._opts);
        opts = extend(defaultOpts, opts);

        const shiftyEasing = this._easing(opts.easing);
        const values = this._resolveFromAndTo(progress, shiftyEasing, passedOpts);

        this.stop();

        // Trigger a layout so styles are calculated & the browser
        // picks up the starting position before animating
        this.path.getBoundingClientRect();

        const offset = this._getComputedDashOffset();
        const newOffset = this._progressToOffset(progress);

        this._tweenable = new Tweenable();
        this._tweenable
            .tween({
                from: { offset, ...values.from },
                to: { offset: newOffset, ...values.to },
                duration: opts.duration,
                delay: opts.delay,
                easing: shiftyEasing,
                render: (state: any) => {
                    this.path.style.setProperty("stroke-dashoffset", state.offset);
                    const reference = opts?.shape || self;
                    if (opts && opts.render) {
                        opts?.render(state, reference);
                    }
                }
            })
            .then(data => {
                if (isFunction<() => any>(cb)) {
                    cb();
                }
                return data;
            })
            .catch((err: any) => {
                console.error("Error in tweening:", err);
                throw err;
            });
    }

    private _getComputedDashOffset(): number {
        const computedStyle = window.getComputedStyle(this.path, null);
        return parseFloat(computedStyle.getPropertyValue("stroke-dashoffset"));
    }

    private _progressToOffset(progress: number): number {
        const length = this.path.getTotalLength();
        return length - progress * length;
    }

    // Resolves from and to values for animation.
    private _resolveFromAndTo(progress: number, easing: string, opts: any): { from: any; to: any } {
        if (opts.from && opts.to) {
            return {
                from: opts.from,
                to: opts.to
            };
        }

        return {
            from: this._calculateFrom(easing),
            to: this._calculateTo(progress, easing)
        };
    }

    // Calculate `from` values from options passed at initialization
    private _calculateFrom(easing: string): any {
        return shifty.interpolate(this._opts.from, this._opts.to, this.value(), easing);
    }

    // Calculate `to` values from options passed at initialization
    private _calculateTo(progress: number, easing: string): any {
        return shifty.interpolate(this._opts.from, this._opts.to, progress, easing);
    }

    private _stopTween(): void {
        if (this._tweenable !== null) {
            this._tweenable?.stop(true);
            this._tweenable = undefined;
        }
    }

    private _easing(easing?: string): string {
        if (!easing) {
            return "";
        }
        return EASING_ALIASES[easing] ? EASING_ALIASES[easing] : easing;
    }
}

export default Path;
