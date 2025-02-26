



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

class Image extends Element {

  // public svgObj: any;

  constructor() {
    super()
  }

  // GetInstanceName() {
  //   return "Image";
  // }

  // Basic.Image = function () {
  // },
  // Basic.Image.prototype = new Basic.Element,
  // Basic.Image.prototype.constructor = Basic.Image,
  CreateElement(element, type) {
    console.log("= B.Group - CreateElement called with:", { element, type });
    this.svgObj = new HvacSVG.Container(HvacSVG.create('image'));
    this.InitElement(element, type);
    console.log("= B.Group - CreateElement output:", this.svgObj);
    return this.svgObj;
  }

  SetURL(e: string): void {
    console.log("= B.Group SetURL - Input:", e);

    // Set the attributes and source for the SVG image element
    this.svgObj.attr({ preserveAspectRatio: "none" });
    this.svgObj.src = e;
    this.svgObj.attr("xlink:href", e, HvacSVG.xlink);

    console.log("= B.Group SetURL - Output:", this.svgObj);
  }

}

export default Image




// export default Basic.Image;
