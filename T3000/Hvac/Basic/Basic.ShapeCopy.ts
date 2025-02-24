



// import SDJS from "../SDJS/SDJS.Index";
// import SDUI from "../SDUI/SDUI.Index";
// import Basic from "./Basic.Index";
// import GPP from "../gListManager";
import $ from 'jquery';
import HvacSVG from "../Helper/SVG.t2"

import Element from "./Basic.Element";

import Global from "./Basic.Global";
import Utils1 from "../Helper/Utils1"
import Utils2 from "../Helper/Utils2"
import Utils3 from "../Helper/Utils3"

import ConstantData from "../Data/ConstantData"


class ShapeCopy extends Element {


  public shapeElem: any;

  constructor() {
    super()
    //'use strict';
    this.svgObj = null;
    this.shapeElem = null;
  }

  // GetInstanceName(){
  //   return "ShapeCopy";
  // }

  // Basic.ShapeCopy.prototype = new Basic.Element,
  // Basic.ShapeCopy.prototype.constructor = Basic.ShapeCopy,
  CreateElement(element, type) {
    //'use strict';
    console.log('= B.ShapeCopy CreateElement input:', { element, type });

    this.svgObj = new HvacSVG.Container(HvacSVG.create('use'));
    this.InitElement(element, type);

    console.log('= B.ShapeCopy CreateElement output:', this.svgObj);
    return this.svgObj;
  }


  SetElementSource(element) {
    //'use strict';
    console.log('= B.ShapeCopy SetElementSource input:', { element });

    const internalID = element.SetInternalID();
    this.svgObj.attr('xlink:href', `#${internalID}`, 'http://www.w3.org/1999/xlink');

    console.log('= B.ShapeCopy SetElementSource output:', this.svgObj);
  }


}

export default ShapeCopy




// export default Basic.ShapeCopy;
