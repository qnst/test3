


// import Basic from "./Basic.Index";
import HvacSVG from "../Helper/SVG.t2"
import $ from "jquery";
// import SDJS from "../SDJS/SDJS.Index";
// import SDUI from "../SDUI/SDUI.Index";
// this.svgObj = new SVG.Container(SVG.create('g')),

import Element from "./Basic.Element";
// import Global from "./Basic.Global";
import Utils1 from "../Helper/Utils1"
import Utils2 from "../Helper/Utils2"
import Utils3 from "../Helper/Utils3"

import ConstantData from "../Data/ConstantData"


class Rect extends Element {

  public shapeElem: any;

  constructor() {
    super();
    //'use strict';
    this.svgObj = null,
      this.shapeElem = null
  }
  // GetInstanceName(){
  //   return "Rect";
  // }


  // Basic.Rect.prototype = new Basic.Element
  // Basic.Rect.prototype.constructor = Basic.Rect
  CreateElement(e, t) {
    console.log('= B.Rect CreateElement input:', { e, t });

    this.svgObj = new HvacSVG.Container(HvacSVG.create('g'));
    this.shapeElem = new HvacSVG.Rect();
    this.svgObj.add(this.shapeElem);

    this.InitElement(e, t);

    console.log('= B.Rect CreateElement output svgObj:', this.svgObj);
    return this.svgObj;
  }

  SetSize(e, t) {
    //'use strict';
    console.log('= B.Rect SetSize input:', { width: e, height: t });

    const roundedWidth = Utils1.RoundCoord(e);
    const roundedHeight = Utils1.RoundCoord(t);

    this.geometryBBox.width = roundedWidth;
    this.geometryBBox.height = roundedHeight;
    this.svgObj.size(roundedWidth, roundedHeight);
    this.shapeElem.size(roundedWidth, roundedHeight);

    this.UpdateTransform();
    this.RefreshPaint();

    console.log('= B.Rect SetSize output geometryBBox:', this.geometryBBox);
  }

}

export default Rect;

// export default Basic.Rect;
