/* 
https://github.com/kimmobrunfeldt/progressbar.js/blob/master/src/utils.js
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

// Utility functions

import React from "react";
import { ShapeOptions } from "./Types";

const PREFIXES = "Webkit Moz O ms".split(" ");
const FLOAT_COMPARISON_EPSILON = 0.001;

// Copy all attributes from source object to destination object.
// destination object is mutated.
function extend(source: ShapeOptions, destination: ShapeOptions): ShapeOptions {
    // destination = destination || {};
    // source = source || {};
    destination.text = destination.text ? { ...source.text, ...destination.text } : source.text;
    const result = { ...source, ...destination };
    return result;
}

// Renders templates with given variables. Variables must be surrounded with
// braces without any spaces, e.g. {variable}
// All instances of variable placeholders will be replaced with given content
// Example:
// render('Hello, {message}!', {message: 'world'})
function render(template: string, vars: { [key: string]: string }): string {
    let rendered = template;

    for (const key in vars) {
        if (vars[key]) {
            const val = vars[key];
            const regExpString = "\\{" + key + "\\}";
            const regExp = new RegExp(regExpString, "g");

            rendered = rendered.replace(regExp, val);
        }
    }

    return rendered;
}

function setStyle(element: HTMLElement, style: string, value: string): void {
    const elStyle = element.style; // cache for performance

    for (const prefix of PREFIXES) {
        elStyle.setProperty(prefix + capitalize(style), value);
    }

    elStyle.setProperty(style, value);
}

function setStyles(element: HTMLElement | SVGElement, styles: React.CSSProperties): void {
    forEachObject(styles, (styleValue, styleName) => {
        // Allow disabling some individual styles by setting them
        // to null or undefined
        if (styleValue === null || styleValue === undefined) {
            return;
        }

        // If style's value is {prefix: true, value: '50%'},
        // Set also browser prefixed styles
        // if (isObject(styleValue) && styleValue.prefix === true) {
        //     // setStyle(element, styleName, styleValue.value);
        // } else {
        element.style.setProperty(styleName, styleValue);
        // }
    });
}

function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function isString(obj: any): obj is string {
    return typeof obj === "string" || obj instanceof String;
}

function isFunction<T>(obj: any): obj is T {
    return typeof obj === "function";
}

function isArray(obj: any): obj is any[] {
    return Object.prototype.toString.call(obj) === "[object Array]";
}

// Returns true if `obj` is object as in {a: 1, b: 2}, not if it's function or
// array
function isObject(obj: any): obj is object {
    if (isArray(obj)) {
        return false;
    }

    const type = typeof obj;
    return type === "object" && !!obj;
}

function forEachObject(object: { [key: string]: any }, callback: (value: any, key: string) => void): void {
    for (const key in object) {
        if (object[key]) {
            const val = object[key];
            callback(val, key);
        }
    }
}

function floatEquals(a: number, b: number): boolean {
    return Math.abs(a - b) < FLOAT_COMPARISON_EPSILON;
}

// https://coderwall.com/p/nygghw/don-t-use-innerhtml-to-empty-dom-elements
function removeChildren(el?: HTMLElement): void {
    if (el !== undefined) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    }
}

export {
    extend,
    render,
    setStyle,
    setStyles,
    capitalize,
    isString,
    isFunction,
    isObject,
    forEachObject,
    floatEquals,
    removeChildren
};
