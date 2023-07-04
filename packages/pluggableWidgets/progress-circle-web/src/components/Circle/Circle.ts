import Shape from "./Shape";
import { ShapeOptions } from "./Types";
import { render } from "./Utils";

class Circle extends Shape {
    static _pathTemplate: string =
        "M 50,50 m 0,-{radius}" + " a {radius},{radius} 0 1 1 0,{2radius}" + " a {radius},{radius} 0 1 1 0,-{2radius}";

    _pathString(opts: ShapeOptions): string {
        let widthOfWider = opts.strokeWidth ? opts.strokeWidth : 1;
        if (opts.trailWidth && opts.trailWidth > widthOfWider) {
            widthOfWider = opts.trailWidth;
        }

        const r = 50 - widthOfWider / 2;

        return render(Circle._pathTemplate, {
            radius: r.toString(),
            "2radius": (r * 2).toString()
        });
    }

    _trailString(opts: ShapeOptions): string {
        return this._pathString(opts);
    }
}

export default Circle;
