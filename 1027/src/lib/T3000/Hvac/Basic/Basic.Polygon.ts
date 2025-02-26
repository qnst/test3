



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


class Polygon extends Path {

  constructor() {
    super()
  }

  // GetInstanceName(){
  //   return "Polygon";
  // }

  // Basic.Polygon = function () {
  // },
  // Basic.Polygon.prototype = new Basic.Path,
  // Basic.Polygon.prototype.constructor = Basic.Polygon,
  SetPoints(points: { x: number, y: number }[]) {
    console.log("= B.Polygon SetPoints input:", points);

    let pathCreator = this.PathCreator();
    let min = { x: 0, y: 0 };
    let max = { x: 0, y: 0 };
    let length = points.length;

    pathCreator.BeginPath();

    if (length > 1) {
      pathCreator.MoveTo(points[0].x, points[0].y);
      min.x = max.x = points[0].x;
      min.y = max.y = points[0].y;
    }

    for (let i = 1; i < length; i++) {
      pathCreator.LineTo(points[i].x, points[i].y);
      min.x = Math.min(min.x, points[i].x);
      min.y = Math.min(min.y, points[i].y);
      max.x = Math.max(max.x, points[i].x);
      max.y = Math.max(max.y, points[i].y);
    }

    if (length > 1) {
      pathCreator.ClosePath();
    }

    let pathString = pathCreator.ToString();
    this.SetPath(pathString, {
      x: min.x,
      y: min.y,
      width: max.x - min.x,
      height: max.y - min.y
    });

    console.log("= B.Polygon SetPoints output pathString:", pathString);
    console.log("= B.Polygon SetPoints output bounding box:", {
      x: min.x,
      y: min.y,
      width: max.x - min.x,
      height: max.y - min.y
    });
  }

}

export default Polygon



// export default Basic.Polygon
