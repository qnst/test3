



// import SDJS from "../SDJS/SDJS.Index";
// import SDUI from "../SDUI/SDUI.Index";
// import Basic from "./Basic.Index";
// import GPP from "../gListManager";
import $ from 'jquery';
import HvacSVG from "../Helper/SVG.t2"


// import Global from "./Basic.Global";
import Utils1 from "../Helper/Utils1"
import Utils2 from "../Helper/Utils2"
import Utils3 from "../Helper/Utils3"

import ConstantData from "../Data/ConstantData"



import Path from "./Basic.Path";

class RRect extends Path {

  public rx: number;
  public ry: number;

  constructor() {
    super()
    //'use strict';
    this.rx = 0;
    this.ry = 0;
  }

  // GetInstanceName(){
  //   return "RRect";
  // }
  // Basic.RRect.prototype = new Basic.Path,
  // Basic.RRect.prototype.constructor = Basic.RRect,


  SetRRectSize(e: number, t: number, a: number, r: number) {
    console.log("= B.RRect SetRRectSize input:", { e, t, a, r });
    //'use strict';

    if (a >= e / 2) {
      a = (e - 1) / 2;
    }
    if (r >= t / 2) {
      r = (t - 1) / 2;
    }

    this.rx = a;
    this.ry = r;

    const i = this.PathCreator();
    const n = e - 2 * a;
    const o = t - 2 * r;

    i.BeginPath();
    if (a && r) {
      i.MoveTo(0, r);
      i.SimpleArcTo(a, -r, true, true);
      i.LineTo(n, 0, true);
      i.SimpleArcTo(a, r, true, true);
      i.LineTo(0, o, true);
      i.SimpleArcTo(-a, r, true, true);
      i.LineTo(-n, 0, true);
      i.SimpleArcTo(-a, -r, true, true);
      i.ClosePath();
    } else {
      i.MoveTo(0, 0);
      i.LineTo(e, 0, true);
      i.LineTo(0, t, true);
      i.LineTo(-e, 0, true);
      i.ClosePath();
    }

    const s = i.ToString();
    this.SetPath(s, { x: 0, y: 0, width: e, height: t });

    console.log("= B.RRect SetRRectSize output:", { rx: this.rx, ry: this.ry, path: s });
  }

  SetSize(width: number, height: number): void {
    console.log("= B.RRect SetSize input:", { width, height });
    this.SetRRectSize(width, height, this.rx, this.ry);
    console.log("= B.RRect SetSize output:", { rx: this.rx, ry: this.ry });
  }

}

export default RRect;



// export default Basic.RRect;
