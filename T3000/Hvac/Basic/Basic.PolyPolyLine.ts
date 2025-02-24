



// import SDJS from "../SDJS/SDJS.Index";
// import SDUI from "../SDUI/SDUI.Index";
// import Basic from "./Basic.Index";
// import GPP from "../gListManager";
import $ from 'jquery';
import HvacSVG from "../Helper/SVG.t2"

// import Global from "./Basic.Global";


import Path from "./Basic.Path";
import Utils1 from "../Helper/Utils1"
import Utils2 from "../Helper/Utils2"
import Utils3 from "../Helper/Utils3"

import ConstantData from "../Data/ConstantData"


class PolyPolyLine extends Path {

  public pList: any;

  constructor() {
    super();
    this.pList = [];
    this.arrowElems = [];
  }

  // GetInstanceName(){
  //   return "PolyPolyLine";
  // }

  // Basic.PolyPolyLine = function () {
  //   //'use strict';
  //   this.pList = [],
  //     this.arrowElems = []
  // // },
  //   Basic.PolyPolyLine.prototype = new Basic.Path,
  //   Basic.PolyPolyLine.prototype.constructor = Basic.PolyPolyLine,
  Clear() {
    //'use strict';
    console.log("= B.PolyPolyLine Clear: Clearing polyline list");
    this.pList = [];
    this.BuildPath();
    console.log("= B.PolyPolyLine Clear: Polyline list cleared and path rebuilt");
  }

  AddPolyLine(points, startArrowFlag, endArrowFlag) {
    //'use strict';
    console.log("= B.PolyPolyLine AddPolyLine: Adding polyline", { points, startArrowFlag, endArrowFlag });
    this.pList.push({
      points: points,
      sArrowFlag: startArrowFlag,
      eArrowFlag: endArrowFlag
    });
    console.log("= B.PolyPolyLine AddPolyLine: Polyline added", this.pList);
  }

  BuildPath() {
    //'use strict';
    console.log("= B.PolyPolyLine BuildPath: Building path");
    let e, t, a, r, i, n, o, s, l, S;
    const c = this.PathCreator();
    let u = null;
    const p = { x: 0, y: 0 };
    const d = { x: 0, y: 0 };
    let D = true;
    let g = true;

    while (this.arrowAreaElem.children().length) {
      this.arrowAreaElem.removeAt(0);
    }

    this.arrowElems.length = 0;
    c.BeginPath();
    this.arrowheadBounds = [];
    a = this.pList.length;

    for (e = 0; e < a; e++) {
      i = null;
      n = null;
      r = this.pList[e].points.length;

      for (t = 0; t < r - 1; t++) {
        s = t === 0;
        l = t === r - 2;
        u = this.pList[e].points[t];
        o = this.pList[e].points[t + 1];

        if (s && this.pList[e].sArrowFlag && this.sArrowRec) {
          i = {
            arrowRec: this.sArrowRec,
            arrowSize: this.sArrowSize,
            arrowDisp: this.sArrowDisp
          };
        }

        if (l && this.pList[e].eArrowFlag && this.eArrowRec) {
          n = {
            arrowRec: this.eArrowRec,
            arrowSize: this.eArrowSize,
            arrowDisp: this.eArrowDisp
          };
        }

        if (i || n) {
          this.GenerateArrowheads(u, o, i, n);
          g = false;
        }

        if (D) {
          p.x = Math.min(u.x, o.x);
          p.y = Math.min(u.y, o.y);
          d.x = Math.max(u.x, o.x);
          d.y = Math.max(u.y, o.y);
        } else {
          p.x = Math.min(p.x, u.x, o.x);
          p.y = Math.min(p.y, u.y, o.y);
          d.x = Math.max(d.x, u.x, o.x);
          d.y = Math.max(d.y, u.y, o.y);
        }

        D = false;

        if (i) {
          u = i.segPt;
        }

        if (n) {
          o = n.segPt;
        }

        if (s) {
          c.MoveTo(u.x, u.y);
        } else if (!l) {
          c.LineTo(u.x, u.y);
        }

        if (l) {
          c.LineTo(o.x, o.y);
        }
      }

      if (i) {
        this.arrowAreaElem.add(i.arrowElem);
        this.arrowElems.push(i.arrowElem);
      }

      if (n) {
        this.arrowAreaElem.add(n.arrowElem);
        this.arrowElems.push(n.arrowElem);
      }
    }

    if (g && u) {
      i = {
        arrowRec: this.EmptyArrowhead(),
        arrowSize: this.sArrowSize,
        arrowDisp: false
      };
      this.GenerateArrowheads(u, o, i, null);
      this.arrowAreaElem.add(i.arrowElem);
      this.arrowElems.push(i.arrowElem);
    }

    S = c.ToString();
    this.origPathData = S;
    this.pathElem.plot(S);
    this.UpdateTransform();
    this.geometryBBox.x = p.x;
    this.geometryBBox.y = p.y;
    this.geometryBBox.width = d.x - p.x;
    this.geometryBBox.height = d.y - p.y;
    this.RefreshPaint();

    console.log("= B.PolyPolyLine BuildPath: Path built", {
      origPathData: this.origPathData,
      geometryBBox: this.geometryBBox
    });
  }

  UpdateArrowheads() {
    //'use strict';
    this.BuildPath()
  }

  GenerateArrowheads(startPoint, endPoint, startArrow, endArrow) {
    //'use strict';
    console.log("= B.PolyPolyLine GenerateArrowheads: Generating arrowheads", { startPoint, endPoint, startArrow, endArrow });

    let deltaX, deltaY, distance, startArrowDim, endArrowDim, trimAmount, startTrim, endTrim;
    let startArrowElem = null, endArrowElem = null;

    if (startArrow) {
      startArrow.segPt = { x: startPoint.x, y: startPoint.y };
      startArrow.attachPt = { x: startPoint.x, y: startPoint.y };
      startArrow.offset = { x: startPoint.x, y: startPoint.y };
      startArrow.arrowElem = null;
      startArrow.angle = 180;
    }

    if (endArrow) {
      endArrow.segPt = { x: endPoint.x, y: endPoint.y };
      endArrow.attachPt = { x: endPoint.x, y: endPoint.y };
      endArrow.offset = { x: endPoint.x, y: endPoint.y };
      endArrow.arrowElem = null;
      endArrow.angle = 0;
    }

    deltaX = endPoint.x - startPoint.x;
    deltaY = endPoint.y - startPoint.y;
    distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (startArrow) {
      startArrowDim = this.CalcArrowheadDim(startArrow.arrowRec, startArrow.arrowSize, startArrow.arrowDisp);
    }

    if (endArrow) {
      endArrowDim = this.CalcArrowheadDim(endArrow.arrowRec, endArrow.arrowSize, endArrow.arrowDisp);
    }

    trimAmount = (startArrowDim ? startArrowDim.trimAmount : 0) + (endArrowDim ? endArrowDim.trimAmount : 0);

    if (trimAmount > distance) {
      startTrim = (startArrowDim ? startArrowDim.trimAmount : 0) / trimAmount * distance;
      endTrim = (endArrowDim ? endArrowDim.trimAmount : 0) / trimAmount * distance;
    } else {
      startTrim = startArrowDim ? startArrowDim.trimAmount : 0;
      endTrim = endArrowDim ? endArrowDim.trimAmount : 0;
    }

    if (distance) {
      const unitX = deltaX / distance;
      const unitY = deltaY / distance;

      if (startArrow) {
        startArrow.segPt.x = startPoint.x + startTrim * unitX;
        startArrow.segPt.y = startPoint.y + startTrim * unitY;
        startArrow.attachPt.x = startArrow.arrowRec.centered ? startPoint.x + distance / 2 * unitX : startArrow.segPt.x;
        startArrow.attachPt.y = startArrow.arrowRec.centered ? startPoint.y + distance / 2 * unitY : startArrow.segPt.y;
        startArrow.angle = startArrow.arrowRec.noRotate ? 0 : Utils1.CalcAngleFromPoints(endPoint, startPoint);
        startArrow.offset.x = startArrow.attachPt.x - startArrowDim.attachX;
        startArrow.offset.y = startArrow.attachPt.y - startArrowDim.attachY;
      }

      if (endArrow) {
        endArrow.segPt.x = startPoint.x + (distance - endTrim) * unitX;
        endArrow.segPt.y = startPoint.y + (distance - endTrim) * unitY;
        endArrow.attachPt.x = endArrow.arrowRec.centered ? startPoint.x + distance / 2 * unitX : endArrow.segPt.x;
        endArrow.attachPt.y = endArrow.arrowRec.centered ? startPoint.y + distance / 2 * unitY : endArrow.segPt.y;
        endArrow.angle = endArrow.arrowRec.noRotate ? 0 : Utils1.CalcAngleFromPoints(startPoint, endPoint);
        endArrow.offset.x = endArrow.attachPt.x - endArrowDim.attachX;
        endArrow.offset.y = endArrow.attachPt.y - endArrowDim.attachY;
      }

      if (startArrowDim) {
        startArrowDim.offsetX = startArrow.offset.x;
        startArrowDim.offsetY = startArrow.offset.y;
        startArrowDim.angle = startArrow.angle;
        startArrowDim.rotatePt = startArrow.attachPt;
        startArrow.arrowElem = this.CreateArrowheadElem(startArrow.arrowRec, startArrowDim, true, this.arrowheadBounds);
      }

      if (endArrowDim) {
        endArrowDim.offsetX = endArrow.offset.x;
        endArrowDim.offsetY = endArrow.offset.y;
        endArrowDim.angle = endArrow.angle;
        endArrowDim.rotatePt = endArrow.attachPt;
        endArrow.arrowElem = this.CreateArrowheadElem(endArrow.arrowRec, endArrowDim, false, this.arrowheadBounds);
      }
    }

    console.log("= B.PolyPolyLine GenerateArrowheads: Arrowheads generated", { startArrow, endArrow });
  }

}




export default PolyPolyLine;
