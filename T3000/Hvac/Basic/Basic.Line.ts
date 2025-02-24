



// import SDJS from "../SDJS/SDJS.Index";
// import SDUI from "../SDUI/SDUI.Index";
// import Basic from "./Basic.Index";
// import GPP from "../gListManager";
import $ from 'jquery';
import HvacSVG from "../Helper/SVG.t2"


import Path from "./Basic.Path";

// import Global from "./Basic.Global";
import Utils1 from "../Helper/Utils1"
import Utils2 from "../Helper/Utils2"
import Utils3 from "../Helper/Utils3"

import ConstantData from "../Data/ConstantData"


class Line extends Path {

  constructor() {
    super()
  }

  // GetInstanceName(){
  //   return "Line";
  // }


  // Basic.Line = function () {
  // },
  //   Basic.Line.prototype = new Basic.Path,
  //   Basic.Line.prototype.constructor = Basic.Line,
  SetPoints(
    startXCoord: number,
    startYCoord: number,
    endXCoord: number,
    endYCoord: number
  ): void {
    console.log("= B.Line SetPoints input:", {
      startXCoord,
      startYCoord,
      endXCoord,
      endYCoord,
    });

    const pathCreator = this.PathCreator();
    pathCreator.BeginPath();
    pathCreator.MoveTo(startXCoord, startYCoord);
    pathCreator.LineTo(endXCoord, endYCoord);

    const pathString = pathCreator.ToString();
    console.log("= B.Line SetPoints output path:", pathString);

    this.SetPath(pathString, {
      x: Math.min(startXCoord, endXCoord),
      y: Math.min(startYCoord, endYCoord),
      width: Math.abs(endXCoord - startXCoord),
      height: Math.abs(endYCoord - startYCoord),
    });
  }

}

export default Line;




// export default Basic.Line;
