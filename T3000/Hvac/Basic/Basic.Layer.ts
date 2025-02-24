

// import Basic from "./Basic.Index";

import HvacSVG from "../Helper/SVG.t2"
import $ from "jquery";
// import SDJS from "../SDJS/SDJS.Index";
// import SDUI from "../SDUI/SDUI.Index";

import Container from "./Basic.Container";

// import Global from "./Basic.Global";
import Utils1 from "../Helper/Utils1"
import Utils2 from "../Helper/Utils2"
import Utils3 from "../Helper/Utils3"

import ConstantData from "../Data/ConstantData"


class Layer extends Container {
  public scaleOKFlag: boolean;
  public dpiScaleOnlyFlag: boolean;

  constructor() {
    super()
    //'use strict';
    this.scaleOKFlag = true;
    this.dpiScaleOnlyFlag = false;
  }

  // GetInstanceName(){
  //   return "Layer";
  // }

  // Basic.Layer.prototype = new Basic.Container,
  //   Basic.Layer.prototype.constructor = Basic.Layer,
  CreateElement(elementParam, optionsParam) {
    'use strict';
    console.log('= B.Layer CreateElement input:', elementParam, optionsParam);
    this.svgObj = new HvacSVG.Container(HvacSVG.create('g'));
    this.InitElement(elementParam, optionsParam);
    console.log('= B.Layer CreateElement output:', this.svgObj);
    return this.svgObj;
  }

  AllowScaling(isAllowedScaling: boolean) {
    'use strict';
    console.log('= B.Layer AllowScaling input:', isAllowedScaling);
    this.scaleOKFlag = isAllowedScaling;
    if (isAllowedScaling) {
      this.dpiScaleOnlyFlag = false;
    }
    console.log('= B.Layer AllowScaling output:', {
      scaleOKFlag: this.scaleOKFlag,
      dpiScaleOnlyFlag: this.dpiScaleOnlyFlag
    });
  }

  AllowDpiScalingOnly(isAllowedDpiScaling: boolean) {
    'use strict';
    console.log('= B.Layer AllowDpiScalingOnly input:', isAllowedDpiScaling);

    this.dpiScaleOnlyFlag = isAllowedDpiScaling;
    if (isAllowedDpiScaling) {
      this.scaleOKFlag = false;
    }

    console.log('= B.Layer AllowDpiScalingOnly output:', {
      scaleOKFlag: this.scaleOKFlag,
      dpiScaleOnlyFlag: this.dpiScaleOnlyFlag
    });
  }

  IsScalingAllowed() {
    'use strict';
    console.log('= B.Layer IsScalingAllowed input: none');
    const result = this.scaleOKFlag;
    console.log('= B.Layer IsScalingAllowed output:', result);
    return result;
  }

  IsDpiScalingAllowed() {
    'use strict';
    console.log('= B.Layer IsDpiScalingAllowed input: none');
    const result = this.dpiScaleOnlyFlag;
    console.log('= B.Layer IsDpiScalingAllowed output:', result);
    return result;
  }



}

export default Layer;

// export default Basic.Layer;
