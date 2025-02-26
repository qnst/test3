



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



import Element from "./Basic.Element";

class Oval extends Element {
  public shapeElem: any;


  constructor() {
    super();
    //'use strict';
    this.svgObj = null,
      this.shapeElem = null
  }

  // GetInstanceName(){
  //   return "Oval";
  // }
  // Basic.Oval.prototype = new Basic.Element,
  // Basic.Oval.prototype.constructor = Basic.Oval,
  CreateElement(width: number, height: number) {
    console.log("= B.Oval CreateElement input =>", { width, height });

    this.svgObj = new HvacSVG.Container(HvacSVG.create('g'));
    this.shapeElem = new HvacSVG.Ellipse();
    this.svgObj.add(this.shapeElem);

    this.InitElement(width, height);

    console.log("= B.Oval CreateElement output =>", this.svgObj);
    return this.svgObj;
  }

  SetSize(width: number, height: number) {
    console.log("= B.Oval SetSize input =>", { width, height });

    width = Utils1.RoundCoord(width);
    height = Utils1.RoundCoord(height);

    this.geometryBBox.width = width;
    this.geometryBBox.height = height;

    this.svgObj.size(width, height);
    this.shapeElem.size(width, height);

    this.UpdateTransform();
    this.RefreshPaint();

    console.log("= B.Oval SetSize output =>", this.geometryBBox);
  }

}

export default Oval


// export default Basic.Oval;
