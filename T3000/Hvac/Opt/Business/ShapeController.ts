

import GlobalData from '../../Data/GlobalData'
import Utils1 from '../../Helper/Utils1'
import Utils3 from '../../Helper/Utils3'
import Utils2 from '../../Helper/Utils2'
import ListManager from '../../Data/ListManager'
import Resources from '../../Data/Resources'
import FileParser from '../../Data/FileParser'
// import RRect from '../../Shape/Shape.RRect'
// import Oval from '../../Shape/Shape.Oval'
import Line from '../../Shape/Shape.Line'
import Rect from '../../Shape/Shape.Rect'

import $ from 'jquery'
import Polygon from '../../Shape/Shape.Polygon'
import Commands from '../../Opt/Business/Commands'
import RRect from '../../Shape/Shape.RRect'
import Oval from '../../Shape/Shape.Oval'
import Collab from '../../Data/Collab'
import Clipboard from './Clipboard'
import ConstantData from '../../Data/ConstantData'

import PolySeg from '../../Model/PolySeg'
import Hook from '../../Model/Hook'
import RightClickData from '../../Model/RightClickData'
import ConstantData2 from '../../Data/ConstantData2'
import SVGFragmentSymbol from '../../Shape/Shape.SVGFragmentSymbol'
import QuickStyle from '../../Model/QuickStyle'
import Instance from '../../Data/Instance/Instance'
import PolyList from '../../Model/PolyList'


class ShapeController {


  CancelModalOperation = function (e) {
    Commands.MainController.Selection.SetSelectionTool(Resources.Tools.Tool_Select, false);
    GlobalData.optManager.CancelModalOperation();
    if (!e) {
      // Collab.UnLockMessages();
      // Collab.UnBlockMessages();
    }
    return false;
  }


  SetDefaultWallThickness = function (e, t) {
    console.log('SetDefaultWallThickness 1e =', e);
    console.log('SetDefaultWallThickness 1t =', t);
    // debugger


    /*
          var a = 1;
        GlobalData  gDocumentHandler.rulerSettings.useInches ||
            (a = ConstantData.Defines.MetricConv),
            t &&
            (e = t.Data.thick);
          var r = e * GlobalData.docHandler.rulerSettings.major / (GlobalData.docHandler.rulerSettings.majorScale * a);
          Collab.AllowMessage() &&
            Collab.BeginSecondaryEdit();
          var i = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
          if (!Utils2.IsEqual(i.def.wallThickness, r, 0.01) || t) {
            if (
              GlobalData.optManager.CloseEdit(!0, !0),
              i = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0),
              t ||
              (i.def.wallThickness = r),
              Collab.AllowMessage()
            ) {
              var n = {
                thick: e
              };
              Collab.BuildMessage(
                ConstantData.CollabMessages.SetDefaultWallThickness,
                n,
                !1,
                !1
              )
            }
            GlobalData.optManager.CompleteOperation(null)
          }
          */



    var conversionFactor = 1;
    if (!GlobalData.docHandler.rulerSettings.useInches) {
      conversionFactor = ConstantData.Defines.MetricConv;
    }
    if (t) {
      e = t.Data.thick;
    }


    var wallThickness = e * GlobalData.docHandler.rulerSettings.major / (GlobalData.docHandler.rulerSettings.majorScale * conversionFactor);

    // if (Collab.AllowMessage()) {
    //   Collab.BeginSecondaryEdit();
    // }

    var sessionBlock = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, false);

    if (!Utils2.IsEqual(sessionBlock.def.wallThickness, wallThickness, 0.01) || t) {
      GlobalData.optManager.CloseEdit(true, true);
      sessionBlock = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, true);

      if (!t) {
        sessionBlock.def.wallThickness = wallThickness;
      }

      // if (Collab.AllowMessage()) {
      //   var message = {
      //     thick: e
      //   };
      //   Collab.BuildMessage(ConstantData.CollabMessages.SetDefaultWallThickness, message, false, false);
      // }

      var sessionBlock = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, false);


      GlobalData.optManager.CompleteOperation(null);
    }

  }


  DrawNewWallShape = function (e, t) {
    console.log('= ShapeController DrawNewWallShape e,t=>', e, t);
    console.log('= ShapeController DrawNewWallShape gBusinessManager=>', GlobalData.gBusinessManager)
    // debugger
    var a;
    var r = t != null;
    var i = null;//Double ===  Business.GetSelectionBusinessManager();

    if (i == null) {
      i = GlobalData.gBusinessManager;
    }

    if (i && i.AddWall) {
      GlobalData.optManager.CloseEdit();
      i.ToggleAddingWalls(true);
      a = i.AddWall(r, t);
      ConstantData.DocumentContext.UsingWallTool = true;
    }

    if (r) {
      console.log('= ShapeController DrawNewWallShape a=>', a);
      return a;
    }
  }



  StampOrDragDropNewShape = function (t, a) {
    console.log('StampOrDragDropNewShape', t, a);
    var r, i;
    GlobalData.optManager.SetUIAdaptation(t);

    // if (ConstantData.DocumentContext.HTMLFocusControl && ConstantData.DocumentContext.HTMLFocusControl.blur) {
    //   ConstantData.DocumentContext.HTMLFocusControl.blur();
    // }

    // if (a) {
    //   ConstantData.DocumentContext.ShapeTool = a;
    // } else {
    //   a = ConstantData.DocumentContext.ShapeTool;
    // }

    // if (gListManager.isMobilePlatform) {
    //   if (t.type === "pointerdown") {
    //     e = false;
    //     gListManager.PreDragDropOrStamp();
    //     r = this;
    //     i = this.StampOrDragDropMobileCallback;
    //     gListManager.StampTimeout = window.setTimeout(i, 200, r, a);
    //   } else if (t.type === "pointerup") {
    //     e = true;
    //   }
    // } else {
    // if (t.type === "mousedown" || t.type === "pointerdown" || t.type === "touchstart") {
    //   if (t.preventDefault) {
    //     t.preventDefault();
    //   }
    //   e = false;
    //   GlobalData.optManager.PreDragDropOrStamp();
    //   r = this;
    //   i = this.StampOrDragDropCallback;
    //   GlobalData.optManager.StampTimeout = window.setTimeout(i, 200, r, a);
    // } else if (t.type === "mouseup" || t.type === "pointerup" || t.type === "touchend") {
    //   e = true;
    // }  // }






    var e = false;
    GlobalData.optManager.PreDragDropOrStamp();
    r = this;
    i = this.StampOrDragDropCallback;
    GlobalData.optManager.StampTimeout = window.setTimeout(i, 200, r, a);


  }


  DrawNewLineShape = function (e, t, a, r) {

    // Double start to draw line
    console.log(' => ============DrawNewLineShape 1 e, t, a, r=>', e, t, a, r);

    /*
    var i = !1,
      n = null;
    switch (
    null == r ? (
      e ? ConstantData.DocumentContext.LineTool = e : e = ConstantData.DocumentContext.LineTool,
      GlobalData.optManager.forcedotted = t ? Resources.LinePatternData[Resources.Windows_LinePatterns.SEP_Dotted - 1] : null
    ) : i = !0,
    e
    ) {
      case 'line':
        n = this.DrawNewLine(a, 0, i, r);
        break;
      case 'commline':
        n = this.DrawNewLine(a, 1, i, r);
        break;
      case 'digiline':
        n = this.DrawNewLine(a, 2, i, r);
        break;
      case 'arcLine':
        n = this.DrawNewArcLine(i, a, r);
        break;
      case 'segLine':
        n = this.DrawNewSegLine(i, a, r);
        break;
      case 'arcSegLine':
        n = this.DrawNewArcSegLine(i, a, r);
        break;
      case 'polyLine':
        n = this.DrawNewPolyLine(i, a, r);
        break;
      case 'polyLineContainer':
        n = this.DrawNewPolyLineContainer(i, a, r);
        break;
      case 'freehandLine':
        n = this.DrawNewFreehandLine(i, a, r);
        break;
      case 'moveWall':
        GlobalData.gBusinessManager &&
          GlobalData.gBusinessManager.AddWall ? n = GlobalData.gBusinessManager.AddWall(i, r) : (
          ConstantData.DocumentContext.LineTool = 'line',
          n = this.DrawNewLine(a, 0, i, r)
        )
    }
    if (i) return n
    */





    let isDrawing = false;
    let newShape = null;

    // if (r == null) {
    //   if (e) {
    //     ConstantData.DocumentContext.LineTool = e;
    //   } else {
    //     e = ConstantData.DocumentContext.LineTool;
    //   }
    //   GlobalData.optManager.forcedotted = t ? Resources.LinePatternData[Resources.Windows_LinePatterns.SEP_Dotted - 1] : null;
    // } else {
    //   isDrawing = true;
    // }

    // debugger;

    // Resources.LineToolTypes = {
    //   StraightLine: 'line',
    //   ArcLine: 'arcLine',
    //   ArcSegmentedLine: 'arcSegLine',
    //   SegmentedLine: 'segLine',
    //   PolyLine: 'polyLine',
    //   PolyLineContainer: 'polyLineContainer',
    //   MoveWall: 'moveWall',
    //   CommLine: 'commline',
    //   DigiLine: 'digiline',
    //   FreehandLine: 'freehandLine'
    // }

    // LineTool:Resources.LineToolTypes.StraightLine

    // Double set e default type to line

    e = "line";
    // e = type;

    switch (e) {
      case 'line':
        newShape = this.DrawNewLine(a, 0, isDrawing, r);
        break;
      case 'commline':
        newShape = this.DrawNewLine(a, 1, isDrawing, r);
        break;
      case 'digiline':
        newShape = this.DrawNewLine(a, 2, isDrawing, r);
        break;
      case 'arcLine':
        newShape = this.DrawNewArcLine(isDrawing, a, r);
        break;
      case 'segLine':
        newShape = this.DrawNewSegLine(isDrawing, a, r);
        break;
      case 'arcSegLine':
        newShape = this.DrawNewArcSegLine(isDrawing, a, r);
        break;
      case 'polyLine':
        newShape = this.DrawNewPolyLine(isDrawing, a, r);
        break;
      case 'polyLineContainer':
        newShape = this.DrawNewPolyLineContainer(isDrawing, a, r);
        break;
      case 'freehandLine':
        newShape = this.DrawNewFreehandLine(isDrawing, a, r);
        break;
      case 'moveWall':
        if (GlobalData.gBusinessManager && GlobalData.gBusinessManager.AddWall) {
          newShape = GlobalData.gBusinessManager.AddWall(isDrawing, r);
        } else {
          // ConstantData.DocumentContext.LineTool = 'line';
          newShape = this.DrawNewLine(a, 0, isDrawing, r);
        }
        break;
    }

    if (isDrawing) {
      return newShape;
    }
  }


  DrawNewLine = function (e, t, a, r) {
    console.log(' => ============DrawNewLineShape 2 e, t, a, r=>', e, t, a, r);

    var i = GlobalData.objectStore.GetObject(GlobalData.optManager.theSEDSessionBlockID).Data,
      n = 0 == (i.def.textflags & ConstantData.TextFlags.SED_TF_HorizText),
      o = i.d_sarrow,
      s = i.d_earrow,
      l = i.d_sarrowdisp,
      S = i.d_earrowdisp,
      c = 0;
    switch (t) {
      case ConstantData2.LineTypes.SED_LS_Comm:
      case ConstantData2.LineTypes.SED_LS_Digi:
        c = 0.25
    }
    if (o > 0 != s > 0 && (0 === s && (s = o, S = l), o = 0, l = !1), r) u = Utils1.DeepCopy(r.Data.attributes);
    else var u = {
      Frame: {
        x: 0,
        y: 0,
        width: 1,
        height: 1
      },
      StartPoint: {
        x: 0,
        y: 0
      },
      EndPoint: {
        x: 0,
        y: 0
      },
      StartArrowID: o,
      StartArrowDisp: l,
      EndArrowID: s,
      EndArrowDisp: S,
      ArrowSizeIndex: i.d_arrowsize,
      TextGrow: ConstantData.TextGrowBehavior.HORIZONTAL,
      TextAlign: ConstantData.DocumentContext.CurrentTextAlignment,
      TextDirection: n,
      Dimensions: i.dimensions,
      ShortRef: t,
      shapeparam: c,
      bOverrideDefaultStyleOnDraw: !0
    };
    var p = new Line(u),
      d = Utils1.DeepCopy(i.def.style);
    if (r && r.Data && r.Data.attributes && r.Data.attributes.StyleRecord) d = Utils1.DeepCopy(r.Data.attributes.StyleRecord);
    else {
      var D = Resources.FindStyle(ConstantData.Defines.TextBlockStyle);
      d.Text.Paint.Color = '#000000'//Double D.Text.Paint.Color
    }
    if (
      p.StyleRecord = d,
      i.flags & ConstantData.SessionFlags.SEDS_AllowHops &&
      (
        p.flags = Utils2.SetFlag(p.flags, ConstantData.ObjFlags.SEDO_LineHop, !0)
      ),
      a
    ) return p;
    GlobalData.optManager.DrawNewObject(p, e)
  }


  StampOrDragDropCallback = function (t, a) {
    console.log('StampOrDragDropCallback 1 t=', t);
    console.log('StampOrDragDropCallback 2 a=', a);
    //debugger
    var r;
    var i = ConstantData.SDRShapeTypes;

    GlobalData.optManager.StampTimeout = null;
    // SDUI.Commands.MainController.Dropdowns.HideAllDropdowns(),
    if (a !== 'textLabel') {
      ConstantData.DocumentContext.ShapeTool = a;
    }

    //Double ===
    var e = false;

    if (e) {
      r = false;
      GlobalData.optManager.UnbindDragDropOrStamp();
    } else {
      r = true;
    }

    switch (a) {
      case 'textLabel':
        t.StampTextLabel(false, false);
        break;
      case i.SED_S_Rect:
        t.StampRectangle(r, false);
        break;
      case i.SED_S_RRect:
        t.StampRoundRect(r, false);
        break;
      case i.SED_S_Circ:
        t.StampCircle(r, true);
        break;
      case i.SED_S_Oval:
        t.StampCircle(r, false);
        break;
      default:
        t.StampShape(a, r, false);
    }
  }


  StampRectangle = function (e, t) {
    console.log('StampRectangle 1 e=', e)
    console.log('StampRectangle 2 t=', t)
    var a,
      r,
      i = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
    t ? (
      a = ConstantData.Defines.Shape_Square,//ListManager.Model.ts 100
      r = ConstantData.Defines.Shape_Square//ListManager.Model.ts 100
    ) : (
      a = ConstantData.Defines.Shape_Width,//ListManager.Model.ts 150
      r = ConstantData.Defines.Shape_Height//ListManager.Model.ts 150
    );
    var n = {
      Frame: {
        x: - 1000,
        y: - 1000,
        width: a,
        height: r
      },
      TextGrow: ConstantData.TextGrowBehavior.PROPORTIONAL,// ListManager.Model.ts 0
      shapeparam: i.def.rrectparam,
      moreflags: ConstantData.ObjMoreFlags.SED_MF_FixedRR// ListManager.Model.ts 64
    };
    t &&
      (n.ObjGrow = ConstantData.GrowBehavior.PROPORTIONAL); //3
    var o = new Rect(n);
    console.log('StampRectangle 3 o=', o)
    // e ? GlobalData.optManager.DragDropNewShape(o, !0, !0, !0, null, null) :
    //  GlobalData.optManager.MouseStampNewShape(o, !0, !0, !0, null, null)

    GlobalData.optManager.MouseStampNewShape(o, !0, !0, !0, null, null)
  }

  StampRoundRect = function (e, t) {
    var a,
      r,
      i = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
    t ? (
      a = ConstantData.Defines.Shape_Square,
      r = ConstantData.Defines.Shape_Square
    ) : (
      a = ConstantData.Defines.Shape_Width,
      r = ConstantData.Defines.Shape_Height
    );
    var n = {
      Frame: {
        x: - 1000,
        y: - 1000,
        width: a,
        height: r
      },
      TextGrow: ConstantData.TextGrowBehavior.PROPORTIONAL,
      shapeparam: i.def.rrectparam,
      moreflags: ConstantData.ObjMoreFlags.SED_MF_FixedRR
    };
    t &&
      (n.ObjGrow = ConstantData.GrowBehavior.PROPORTIONAL);
    var o = new RRect(n);
    // e ? GlobalData.optManager.DragDropNewShape(o, !0, !0, !0, null, null) :
    //  GlobalData.optManager.MouseStampNewShape(o, !0, !0, !0, null, null)

    GlobalData.optManager.MouseStampNewShape(o, !0, !0, !0, null, null)
  }

  StampCircle = function (e, t) {
    //debugger
    var a,
      r;
    t ? (
      a = ConstantData.Defines.Shape_Square,
      r = ConstantData.Defines.Shape_Square
    ) : (
      a = ConstantData.Defines.Shape_Width,
      r = ConstantData.Defines.Shape_Height
    );
    var i = - 1000,
      n = - 1000,
      o = null;
    if (t) {
      o = {
        Frame: {
          x: i,
          y: n,
          width: 100,
          height: 100
        },
        TextGrow: ConstantData.TextGrowBehavior.PROPORTIONAL,
        ObjGrow: ConstantData.GrowBehavior.PROPORTIONAL
      }
    } else o = {
      Frame: {
        x: i,
        y: n,
        width: a,
        height: r
      },
      TextGrow: ConstantData.TextGrowBehavior.PROPORTIONAL
    };
    var s = new Oval(o);

    //  debugger
    // e ? GlobalData.optManager.DragDropNewShape(s, !0, !0, !0, null, null) :
    // GlobalData.optManager.MouseStampNewShape(s, !0, !0, !0, null, null)

    GlobalData.optManager.MouseStampNewShape(s, !0, !0, !0, null, null)
  }


  StampTextLabel = function (e, t) {
    Commands.MainController.Selection.SetSelectionTool(Resources.Tools.Tool_Text, e);
    var a = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theTEDSessionBlockID, !1);
    if (t || - 1 == a.theActiveTextEditObjectID) {
      if (!t) {
        var r = GlobalData.optManager.GetTargetSelect();
        if (r >= 0) {
          var i = GlobalData.optManager.GetObjectPtr(r, !1);
          if (i && i.AllowTextEdit()) {
            var n = GlobalData.optManager.svgObjectLayer.GetElementByID(r);
            return GlobalData.optManager.ActivateTextEdit(n),
              void GlobalData.optManager.UpdateTools()
          }
        }
      }
    } else GlobalData.optManager.DeactivateTextEdit();
    var o = GlobalData.objectStore.GetObject(GlobalData.optManager.theSEDSessionBlockID).Data,
      s = Resources.FindStyle(ConstantData.Defines.TextBlockStyle);
    null == s &&
      (s = o.def.style);
    var l = {
      StyleRecord: $.extend(!0, {
      }, s),
      Frame: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      TMargins: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      },
      TextGrow: ConstantData.TextGrowBehavior.HORIZONTAL,
      TextAlign: ConstantData.TextAlign.LEFT,
      flags: ConstantData.ObjFlags.SEDO_TextOnly
    };
    null == l.StyleRecord.Line &&
      (l.StyleRecord.Line = Utils1.DeepCopy(s.Border)),
      l.StyleRecord.Line.Thickness = 0;
    var S = new Rect(l),
      c = Utils1.DeepCopy(o.def.style);
    c.Text.Paint = Utils1.DeepCopy(s.Text.Paint),
      S.StyleRecord.Text = c.Text;
    var u = GlobalData.optManager.CalcDefaultInitialTextStyle(S.StyleRecord.Text),
      p = GlobalData.optManager.svgDoc.CalcStyleMetrics(u);
    GlobalData.optManager.stampShapeOffsetX = 0,
      GlobalData.optManager.stampShapeOffsetY = p.ascent,
      S.Frame.height = p.height,
      e ||
      GlobalData.optManager.DeactivateTextEdit(!1),
      GlobalData.optManager.StampNewTextShapeOnTap(S, !1, !1, !1, e, this.StampCallback, {
        bActivateText: !0
      })
  }

  // StampOrDragDropNewShape = function (t, a) {
  //   console.log('StampOrDragDropNewShape 1 t=', t)
  //   console.log('StampOrDragDropNewShape 2 a=', a)


  //   /*
  //   var r,
  //     i;
  //   if (
  //     GlobalData.optManager.SetUIAdaptation(t),

  //     // Resources.ts
  //     ConstantData.DocumentContext.HTMLFocusControl &&
  //     ConstantData.DocumentContext.HTMLFocusControl.blur &&
  //     ConstantData.DocumentContext.HTMLFocusControl.blur(),
  //     a ? ConstantData.DocumentContext.ShapeTool = a : a = ConstantData.DocumentContext.ShapeTool,
  //     GlobalData.optManager.isMobilePlatform
  //   ) {
  //     if (
  //       'pointerdown' == t.type &&
  //       (
  //         e = !1,
  //         GlobalData.optManager.PreDragDropOrStamp(),
  //         r = this,
  //         i = this.StampOrDragDropMobileCallback,
  //         GlobalData.optManager.StampTimeout = window.setTimeout(i, 200, r, a)
  //       ),
  //       'pointerup' == t.type
  //     ) return void (e = !0)
  //   } else if (
  //     'mousedown' != t.type &&
  //     'pointerdown' != t.type &&
  //     'touchstart' != t.type ||
  //     (
  //       t.preventDefault &&
  //       t.preventDefault(),
  //       e = !1,
  //       GlobalData.optManager.PreDragDropOrStamp(),
  //       r = this,
  //       i = this.StampOrDragDropCallback,
  //       GlobalData.optManager.StampTimeout = window.setTimeout(i, 200, r, a)
  //     ),
  //     'mouseup' == t.type ||
  //     'pointerup' == t.type ||
  //     'touchend' == t.type
  //   ) return void (e = !0)
  //    */


  //   // debugger;
  //   // var r, i;
  //   // if (GlobalData.optManager.SetUIAdaptation(t),
  //   //   ConstantData.DocumentContext.HTMLFocusControl &&
  //   //   ConstantData.DocumentContext.HTMLFocusControl.blur &&
  //   //   ConstantData.DocumentContext.HTMLFocusControl.blur(),
  //   //   a ? ConstantData.DocumentContext.ShapeTool = a : a = ConstantData.DocumentContext.ShapeTool,
  //   //   GlobalData.optManager.isMobilePlatform) {
  //   //   if (t.type === 'pointerdown') {
  //   //     e = !1;
  //   //     GlobalData.optManager.PreDragDropOrStamp();
  //   //     r = this;
  //   //     i = this.StampOrDragDropMobileCallback;
  //   //     GlobalData.optManager.StampTimeout = window.setTimeout(i, 200, r, a);
  //   //   } else if (t.type === 'pointerup') {
  //   //     e = !0;
  //   //   }
  //   //   // Double ===
  //   // } else if (t.type === "click" || t.type === 'mousedown' || t.type === 'pointerdown' || t.type === 'touchstart') {
  //   //   t.preventDefault && t.preventDefault();
  //   //   e = !1;
  //   //   GlobalData.optManager.PreDragDropOrStamp();
  //   //   r = this;
  //   //   i = this.StampOrDragDropCallback;
  //   //   GlobalData.optManager.StampTimeout = window.setTimeout(i, 200, r, a);
  //   // } else if (t.type === 'mouseup' || t.type === 'pointerup' || t.type === 'touchend') {
  //   //   e = !0;
  //   // }














  //   var r, i;
  //   if (GlobalData.optManager.SetUIAdaptation(t),
  //     ConstantData.DocumentContext.HTMLFocusControl &&
  //     ConstantData.DocumentContext.HTMLFocusControl.blur &&
  //     ConstantData.DocumentContext.HTMLFocusControl.blur(),
  //     a ? ConstantData.DocumentContext.ShapeTool = a : a = ConstantData.DocumentContext.ShapeTool,
  //     GlobalData.optManager.isMobilePlatform) {
  //     if (t.type === 'pointerdown') {
  //       e = false;
  //       GlobalData.optManager.PreDragDropOrStamp();
  //       r = this;
  //       i = this.StampOrDragDropMobileCallback;
  //       GlobalData.optManager.StampTimeout = window.setTimeout(i, 200, r, a);
  //     } else if (t.type === 'pointerup') {
  //       e = true;
  //     }
  //   } else if (t.type === "click" || t.type === 'mousedown' || t.type === 'pointerdown' || t.type === 'touchstart') {
  //     t.preventDefault && t.preventDefault();
  //     e = false;
  //     GlobalData.optManager.PreDragDropOrStamp();
  //     r = this;
  //     i = this.StampOrDragDropCallback;
  //     GlobalData.optManager.StampTimeout = window.setTimeout(i, 200, r, a);
  //   } else if (t.type === 'mouseup' || t.type === 'pointerup' || t.type === 'touchend') {
  //     e = true;
  //   }


  // }



  StampShape = function (e, t) {
    var a,
      r = ConstantData.SDRShapeTypes,
      i = {
        x: - 1000,
        y: - 1000,
        width: ConstantData.Defines.Shape_Width,
        height: ConstantData.Defines.Shape_Height
      },
      n = GlobalData.optManager.GetShapeParams(e, i);

    console.log('StampShape====== n>', n);
    n.bIsSquare ? (
      ConstantData.Defines.Shape_Square,
      ConstantData.Defines.Shape_Square
    ) : (
      ConstantData.Defines.Shape_Width,
      ConstantData.Defines.Shape_Height
    );
    var o = {
      Frame: i,
      TextGrow: ConstantData.TextGrowBehavior.PROPORTIONAL,
      dataclass: n.dataclass,
      shapeparam: n.shapeparam
    };
    switch (
    n.bIsSquare &&
    (o.ObjGrow = ConstantData.GrowBehavior.PROPORTIONAL),
    n.dataclass
    ) {
      case r.SED_S_Rect:
        // a = new ListManager.Rect(o);
        a = new Rect(o);
        break;
      case r.SED_S_RRect:
        // a = new ListManager.RRect(o);
        a = new RRect(o);
        break;
      case r.SED_S_Oval:
        // a = new ListManager.Oval(o);
        a = new Oval(o);
        break;
      default:
        var s = n.polyVectorMethod(i, n.shapeparam);
        o.VertexArray = s,
          // (a = new ListManager.Polygon(o)).dataclass = n.dataclass
          (a = new Polygon(o)).dataclass = n.dataclass
    }
    // t ? GlobalData.optManager.DragDropNewShape(a, !0, !0, !0, null, null) :
    // GlobalData.optManager.MouseStampNewShape(a, !0, !0, !0, null, null)
    GlobalData.optManager.MouseStampNewShape(a, !0, !0, !0, null, null)

  }


  RotateShapes = function (e) {
    try {
      GlobalData.optManager.CloseEdit(),
        GlobalData.optManager.RotateShapes(parseInt(e, 10))
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e)
      throw e;
    }
  }

  AlignShapes = function (e) {
    try {
      GlobalData.optManager.CloseEdit(),
        GlobalData.optManager.AlignShapes(e)
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e);
      throw e;
    }
  }

  DeleteSelectedObjects = function () {
    try {
      GlobalData.optManager.CloseEdit(),
        GlobalData.optManager.DeleteSelectedObjects()
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e);
      throw e;
    }
  }

  Undo = function () {

    /*
    try {
      if (Collab.AllowMessage())
        if (Collab.IsSecondary()) {
          if (!Collab.AllowUndo())
            return !1;
          Collab.BuildMessage(ConstantData.CollabMessages.Undo, null, !1)
        } else
          GlobalData.optManager.Undo() && Collab.BuildMessage(ConstantData.CollabMessages.Undo, null, !1);
      else
        GlobalData.optManager.Undo()
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e)
    }
      */

    try {
      GlobalData.optManager.Undo()
    }
    catch (e) {
      GlobalData.optManager.ExceptionCleanup(e);
      throw e;
    }
  }

  Redo = function () {
    try {
      if (Collab.AllowMessage()) if (Collab.IsSecondary()) {
        if (!Collab.AllowRedo()) return !1;
        Collab.BuildMessage(ConstantData.CollabMessages.Redo, null, !1)
      } else GlobalData.optManager.Redo() &&
        Collab.BuildMessage(ConstantData.CollabMessages.Redo, null, !1);
      else GlobalData.optManager.Redo()
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e);
      throw e;
    }
  }


  Copy = function () {

    // GlobalData.optManager.CopyObjects();
    // return;

    try {
      var e = !1;
      try {
        e = document.execCommand('copy')
      } catch (e) {
        throw e
      }
      e ||
        GlobalData.optManager.CopyObjects()
    } catch (e) {

      GlobalData.optManager.RestorePrimaryStateManager();
      GlobalData.optManager.ExceptionCleanup(e);
      throw e
    }
  }


  Cut = function () {

    // GlobalData.optManager.CutObjects()
    // return;

    // debugger

    try {
      var e = !1;
      try {
        e = document.execCommand('cut')
      } catch (e) {
        throw e
      }
      e ||
        GlobalData.optManager.CutObjects()
    } catch (e) {
      throw e
      GlobalData.optManager.RestorePrimaryStateManager(),
        GlobalData.optManager.ExceptionCleanup(e)
    }
  }


  Paste = function (e) {
    /*
    try {
      GlobalData.optManager.PastePoint = null,
        e &&
        GlobalData.optManager.RightClickParams &&
        (GlobalData.optManager.PastePoint = GlobalData.optManager.RightClickParams.HitPt),
        Clipboard.PasteFromUIaction()
    } catch (e) {
      throw e
      GlobalData.optManager.ExceptionCleanup(e)
    }
    */

    // debugger

    try {
      GlobalData.optManager.PastePoint = null;
      if (e && GlobalData.optManager.RightClickParams) {
        GlobalData.optManager.PastePoint = GlobalData.optManager.RightClickParams.HitPt;
      }
      Clipboard.PasteFromUIaction();
    } catch (error) {
      GlobalData.optManager.ExceptionCleanup(error);
      throw error;
    }


  }


  SendToBackOf = function () {
    try {
      GlobalData.optManager.CloseEdit();
      GlobalData.optManager.SendToBackOf();
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e);
      throw e
    }
  }

  BringToFrontOf = function () {
    try {
      GlobalData.optManager.CloseEdit();
      GlobalData.optManager.BringToFrontOf();
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e);
      throw e
    }
  }


  GroupSelectedShapes = function () {
    try {
      GlobalData.optManager.CloseEdit();
      GlobalData.optManager.GroupSelectedShapes(!1, null, !1, !1, !0);
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e);
      throw e;
    }
  }

  UngroupSelectedShapes = function () {
    try {
      GlobalData.optManager.CloseEdit();
      GlobalData.optManager.UngroupSelectedShapes();
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e);
      throw e;
    }
  }

  FlipHorizontal = function () {
    try {
      GlobalData.optManager.CloseEdit();
      GlobalData.optManager.FlipShapes(ConstantData.ExtraFlags.SEDE_FlipHoriz);
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e);
      throw e;
    }
  }

  FlipVertical = function () {
    try {
      GlobalData.optManager.CloseEdit();
      GlobalData.optManager.FlipShapes(ConstantData.ExtraFlags.SEDE_FlipVert);
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e);
      throw e;
    }
  }

  MakeSameSize = function (e) {
    try {
      GlobalData.optManager.CloseEdit(),
        GlobalData.optManager.MakeSameSize(parseInt(e, 10))
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e)
    }
  }

  GetSelectionContext = function () {
    try {
      return GlobalData.optManager.GetSelectionContext()
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e)
    }
  }

  IsActiveTextEdit = function () {
    try {
      return - 1 != GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theTEDSessionBlockID, !1).theActiveTextEditObjectID
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e)
    }
  }

  HandleKeyDown = function (e, t, a) {
    try {
      return GlobalData.optManager.HandleKeyDown(e, t, a)
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e)
    }
  }


  Duplicate = function () {
    try {
      GlobalData.optManager.DuplicateObjects()
    } catch (e) {
      GlobalData.optManager.RestorePrimaryStateManager(),
        GlobalData.optManager.ExceptionCleanup(e)
    }
  }

  HandleKeyPress = function (e, t) {
    try {
      return GlobalData.optManager.HandleKeyPress(e, t)
    } catch (e) {
      GlobalData.optManager.ExceptionCleanup(e)
    }
  }

  SD_PreLoad_Symbol = function (e, t, a, r) {
    // null != SDUI.Commands.MainController.Shapes.SD_PreloadTimer &&
    //   (
    //     clearTimeout(SDUI.Commands.MainController.Shapes.SD_PreloadTimer),
    //     SDUI.Commands.MainController.Shapes.SD_PreloadTimer = null
    //   );
    // var i = SDUI.Commands.MainController.Symbols.GetLMObject(e);
    // if (null == i) {
    //   if (!r) return void (
    //     SDUI.Commands.MainController.Shapes.SD_PreloadTimer = setTimeout(
    //       SDUI.Commands.MainController.Shapes.SD_PreLoad_Symbol,
    //       20,
    //       e,
    //       t,
    //       a,
    //       !1
    //     )
    //   );
    //   if (null == (i = GlobalData.optManager.BuildSymbolObject(e, - 1))) return
    // }
    // if (
    //   null == GlobalData.optManager.theDrawShape &&
    //   (GlobalData.optManager.theDrawShape = i),
    //   i.SymbolData.HasNative
    // ) {
    //   if (null == i.nativeDataArrayBuffer) return void (
    //     SDUI.Commands.MainController.Shapes.SD_PreloadTimer = setTimeout(
    //       SDUI.Commands.MainController.Shapes.SD_PreLoad_Symbol,
    //       20,
    //       e,
    //       t,
    //       a,
    //       !1
    //     )
    //   )
    // } else {
    //   var n = GlobalData.optManager.GetSymbolFormat(i.SymbolData),
    //     o = Globals.SymbolFormats;
    //   switch (n) {
    //     case o.EMF:
    //     case o.PNG:
    //     case o.JPG:
    //       if (null == i.EMFBuffer) return void (
    //         SDUI.Commands.MainController.Shapes.SD_PreloadTimer = setTimeout(
    //           SDUI.Commands.MainController.Shapes.SD_PreLoad_Symbol,
    //           20,
    //           e,
    //           t,
    //           a,
    //           !1
    //         )
    //       );
    //       break;
    //     case o.SVGColor:
    //       var s = SDF.GetSVGFragmentFromCache(e);
    //       if (null == s || null == s.fragment) return void (
    //         SDUI.Commands.MainController.Shapes.SD_PreloadTimer = setTimeout(
    //           SDUI.Commands.MainController.Shapes.SD_PreLoad_Symbol,
    //           20,
    //           e,
    //           t,
    //           a,
    //           !1
    //         )
    //       )
    //   }
    // }
    // a(e, t)

    this.StampOrDragDropNewSymbol(e, t)
  }


  DragDropSymbol = function (r, i) {
    // if (!(GlobalData.optManager.isMobilePlatform && r.touches && r.touches > 1)) {
    //   if (
    //     GlobalData.optManager.EndStampSession(),
    //     GlobalData.optManager.SetUIAdaptation(r),
    //     GlobalData.optManager.IsRightClick(r)
    //   ) return r.preventDefault(),
    //     r.stopPropagation(),
    //     GlobalData.optManager.RightClickParams = new RightClickData,
    //     GlobalData.optManager.RightClickParams.TargetID = i,
    //     'smartpanel-recentSymbolsPalette-container' === r.currentTarget.parentElement.id ? GlobalData.optManager.RightClickParams.RecentSymbol = !0 : GlobalData.optManager.RightClickParams.RecentSymbol = !1,
    //     void Commands.MainController.ShowContextualMenu(
    //       Resources.Controls.ContextMenus.SymbolMenu.Id.toLowerCase(),
    //       r.clientX,
    //       r.clientY
    //     );
    //   if (
    //     ConstantData.DocumentContext.HTMLFocusControl &&
    //     ConstantData.DocumentContext.HTMLFocusControl.blur &&
    //     ConstantData.DocumentContext.HTMLFocusControl.blur(),
    //     t = !1,
    //     SDUI.Commands.MainController.Symbols.SelectButton(i),
    //     GlobalData.optManager.isMobilePlatform
    //   ) {
    //     if ('click' == r.type || 'mousedown' == r.type) return;
    //     if (
    //       GlobalData.optManager.currentModalOperation != ListManager.ModalOperations.NONE
    //     ) return;
    //     if (GlobalData.optManager.symbolLibraryItemID != i) return void (GlobalData.optManager.symbolLibraryItemID = i);
    //     r.preventDefault &&
    //       r.preventDefault(),
    //       GlobalData.optManager.PreDragDropOrStamp(),
    //       this.StampOrDragDropNewSymbol(i, !0)
    //   } else {
    //     if (
    //       'mousedown' == r.type ||
    //       'pointerdown' == r.type ||
    //       'touchstart' == r.type
    //     ) {
    //       if (a) return;
    //       a = !0,
    //         r.preventDefault &&
    //         r.preventDefault(),
    //         e = !1,
    //         GlobalData.optManager.PreDragDropOrStamp();
    //       SDUI.Commands.MainController.Symbols.GetLMObject(i);
    //       var n = this.StampOrDragDropSymbolCallback;
    //       GlobalData.optManager.StampTimeout = window.setTimeout(n, 200, this, i)
    //     }
    //     if ('mouseup' == r.type || 'pointerup' == r.type || 'touchend' == r.type) return void (e = !0)
    //   }
    // }

    this.StampOrDragDropSymbolCallback(r, i)
  }

  StampOrDragDropSymbolCallback = function (r, i) {
    // var n;
    // if (
    //   a = !1,
    //   SDUI.Commands.MainController.Dropdowns.HideAllDropdowns(),
    //   t
    // ) return GlobalData.optManager.UnbindDragDropOrStamp(),
    //   void (t = !1);
    // e ? (GlobalData.optManager.UnbindDragDropOrStamp(), n = !1) : n = !0,
    //   SDUI.Commands.MainController.Shapes.SD_PreLoad_Symbol(i, n, r.StampOrDragDropNewSymbol, !0)

    this.SD_PreLoad_Symbol(i, !0, r.StampOrDragDropNewSymbol, !0)
  }

  StampOrDragDropNewSymbol = function (e, t) {
    GlobalData.optManager.ReplaceSymbolID = null;
    // var a = GlobalData.optManager.BuildSymbolObject(e, t);

    var svgF0 = '<g><g fill="##FILLCOLOR=#7F7F7F##" transform="translate(0,0)"><g class="pump"> <circle stroke="##LINECOLOR=#000000##" cy="16" cx="15.955" r="9.9609003" class="pump-background" /> <g transform="translate(16,16)"> <path d="M -5,8.1369 V -8.1191 L 9.078,0.0091 Z" class="rotating-middle" stroke="##LINECOLOR=#000000##" stroke-width="##LINETHICK=1##"/></g></g></g></g>';
    var svgF1 = '<g  class="heat-pump" stroke-linejoin="round"  stroke="#000"  transform="translate(39 -2.3842e-7)"  fill="currentColor" > <rect  class="inner" height="27.718"  width="27.718"  y="2.141"  x="-36.859" stroke-width="1.0868" ></rect>  <g transform="matrix(1.0276 0 0 1.0276 -39.441 -.44130)"  stroke-linecap="round"  stroke-miterlimit="1"  stroke-width="1.3509" > <path d="m16.234 16.944 8.6837-6.894-8.6837-6.894v3.447h-13.152v6.894h13.152z" fill="#ce2824" ></path> <path d="m15.766 28.844-8.6837-6.894 8.6837-6.894v3.447h13.152v6.894h-13.152z" fill="#3238db"></path></g></g>';

    var tempData = new SVGFragmentSymbol(null);
    tempData.StyleRecord = new QuickStyle();
    tempData.SVGFragment = svgF1;//

    if (tempData) {
      // var r = (a.ExtraFlags & ConstantData.ExtraFlags.SEDE_NoColor) > 0;
      // t ? GlobalData.optManager.DragDropNewShape(a, !0, !0, r, null, null) : GlobalData.optManager.MouseStampNewShape(a, !0, !0, r, null, null)
      GlobalData.optManager.DragDropNewShape(tempData, !0, !0, false, null, null)
    }
  }


  DrawNewSegLine = function (e, t, a) {
    var r,
      i = GlobalData.objectStore.GetObject(GlobalData.optManager.theSEDSessionBlockID).Data,
      n = 0 == (i.def.textflags & ConstantData.TextFlags.SED_TF_HorizText),
      o = i.d_sarrow,
      s = i.d_earrow,
      l = i.d_sarrowdisp,
      S = i.d_earrowdisp;
    o > 0 != s > 0 &&
      (0 === s && (s = o, S = l), o = 0, l = !1),
      r = a ? Utils1.DeepCopy(a.Data.attributes) : {
        Frame: {
          x: 0,
          y: 0,
          width: 1,
          height: 1
        },
        StartPoint: {
          x: 0,
          y: 0
        },
        EndPoint: {
          x: 0,
          y: 0
        },
        StartArrowID: o,
        EndArrowID: s,
        StartArrowDisp: l,
        EndArrowDisp: S,
        ArrowSizeIndex: i.d_arrowsize,
        CurveAdjust: 7,
        TextGrow: ConstantData.TextGrowBehavior.HORIZONTAL,
        TextAlign: ConstantData.DocumentContext.CurrentTextAlignment,
        TextDirection: n,
        Dimensions: i.dimensions,
        curveparam: i.def.curveparam,
        bOverrideDefaultStyleOnDraw: !0
      };
    var c = new Instance.Shape.SegmentedLine(r),
      u = Utils1.DeepCopy(i.def.style);
    if (a && a.Data && a.Data.attributes && a.Data.attributes.StyleRecord) u = Utils1.DeepCopy(a.Data.attributes.StyleRecord);
    else {
      var p = Resources.FindStyle(ConstantData.Defines.TextBlockStyle);
      u.Text.Paint.Color = p.Text.Paint.Color
    }
    if (
      c.StyleRecord = u,
      i.flags & ConstantData.SessionFlags.SEDS_AllowHops &&
      (
        c.flags = Utils2.SetFlag(c.flags, ConstantData.ObjFlags.SEDO_LineHop, !0)
      ),
      e
    ) return c;
    GlobalData.optManager.DrawNewObject(c, t)
  }

  DrawNewArcSegLine = function (e, t, a) {
    var r,
      i = GlobalData.objectStore.GetObject(GlobalData.optManager.theSEDSessionBlockID).Data,
      n = 0 == (i.def.textflags & ConstantData.TextFlags.SED_TF_HorizText),
      o = i.d_sarrow,
      s = i.d_earrow,
      l = i.d_sarrowdisp,
      S = i.d_earrowdisp;
    o > 0 != s > 0 &&
      (0 === s && (s = o, S = l), o = 0, l = !1),
      r = a ? Utils1.DeepCopy(a.Data.attributes) : {
        Frame: {
          x: 0,
          y: 0,
          width: 1,
          height: 1
        },
        StartPoint: {
          x: 0,
          y: 0
        },
        EndPoint: {
          x: 0,
          y: 0
        },
        StartArrowID: o,
        EndArrowID: s,
        StartArrowDisp: l,
        EndArrowDisp: S,
        ArrowSizeIndex: i.d_arrowsize,
        CurveAdjust: 7,
        TextGrow: ConstantData.TextGrowBehavior.HORIZONTAL,
        TextAlign: ConstantData.DocumentContext.CurrentTextAlignment,
        TextDirection: n,
        Dimensions: i.dimensions,
        bOverrideDefaultStyleOnDraw: !0
      };
    var c = new ListManager.ArcSegmentedLine(r),
      u = Utils1.DeepCopy(i.def.style);
    if (a && a.Data && a.Data.attributes && a.Data.attributes.StyleRecord) u = Utils1.DeepCopy(a.Data.attributes.StyleRecord);
    else {
      var p = Resources.FindStyle(ConstantData.Defines.TextBlockStyle);
      u.Text.Paint.Color = p.Text.Paint.Color
    }
    if (
      c.StyleRecord = u,
      i.flags & ConstantData.SessionFlags.SEDS_AllowHops &&
      (
        c.flags = Utils2.SetFlag(c.flags, ConstantData.ObjFlags.SEDO_LineHop, !0)
      ),
      e
    ) return c;
    GlobalData.optManager.DrawNewObject(c, t)
  }

  DrawNewPolyLine = function (e, t, a) {
    var r,
      i = GlobalData.objectStore.GetObject(GlobalData.optManager.theSEDSessionBlockID).Data,
      n = 0 == (i.def.textflags & ConstantData.TextFlags.SED_TF_HorizText),
      o = i.d_sarrow,
      s = i.d_earrow,
      l = i.d_sarrowdisp,
      S = i.d_earrowdisp;
    o > 0 != s > 0 &&
      (0 === s && (s = o, S = l), o = 0, l = !1),
      a ? r = Utils1.DeepCopy(a.Data.attributes) : (
        (
          r = {
            Frame: {
              x: 0,
              y: 0,
              width: 1,
              height: 1
            },
            StartPoint: {
              x: 0,
              y: 0
            },
            EndPoint: {
              x: 0,
              y: 0
            },
            StartArrowID: o,
            EndArrowID: s,
            StartArrowDisp: l,
            EndArrowDisp: S,
            ArrowSizeIndex: i.d_arrowsize,
            CurveAdjust: 7,
            polylist: new PolyList(),
            TextGrow: ConstantData.TextGrowBehavior.HORIZONTAL,
            TextAlign: ConstantData.DocumentContext.CurrentTextAlignment,
            TextDirection: n,
            Dimensions: i.dimensions,
            extraflags: ConstantData.ExtraFlags.SEDE_SideKnobs,
            bOverrideDefaultStyleOnDraw: !0
          }
        ).polylist.segs.push(
          new PolySeg(ConstantData.LineType.LINE, 0, 0)
        ),
        r.polylist.segs.push(
          new PolySeg(ConstantData.LineType.LINE, 0, 0)
        )
      );
    var c = new Instance.Shape.PolyLine(r),
      u = Utils1.DeepCopy(i.def.style);
    if (a && a.Data && a.Data.attributes && a.Data.attributes.StyleRecord) u = Utils1.DeepCopy(a.Data.attributes.StyleRecord);
    else {
      var p = Resources.FindStyle(ConstantData.Defines.TextBlockStyle);
      u.Text.Paint.Color = p.Text.Paint.Color
    }
    if (c.StyleRecord = u, e) return c;
    GlobalData.optManager.DrawNewObject(c, t)
  }

  DrawNewPolyLineContainer = function (e, t, a) {
    var r,
      i = GlobalData.objectStore.GetObject(GlobalData.optManager.theSEDSessionBlockID).Data,
      n = (
        GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1),
        0 == (i.def.textflags & ConstantData.TextFlags.SED_TF_HorizText)
      );
    a ? r = Utils1.DeepCopy(a.Data.attributes) : (
      (
        r = {
          Frame: {
            x: 0,
            y: 0,
            width: 1,
            height: 1
          },
          StartPoint: {
            x: 0,
            y: 0
          },
          EndPoint: {
            x: 0,
            y: 0
          },
          StartArrowID: i.d_sarrow,
          EndArrowID: i.d_earrow,
          StartArrowDisp: i.d_sarrowdisp,
          EndArrowDisp: i.d_earrowdisp,
          ArrowSizeIndex: i.d_arrowsize,
          CurveAdjust: 7,
          polylist: new PolyList(),
          TextGrow: ConstantData.TextGrowBehavior.HORIZONTAL,
          TextAlign: ConstantData.DocumentContext.CurrentTextAlignment,
          TextDirection: n,
          Dimensions: i.dimensions
        }
      ).polylist.segs.push(
        new PolySeg(ConstantData.LineType.LINE, 0, 0)
      ),
      r.polylist.segs.push(
        new PolySeg(ConstantData.LineType.LINE, 0, 0)
      )
    );
    var o = new Instance.Shape.PolyLineContainer(r);
    if (e) return o;
    GlobalData.optManager.DrawNewObject(o, t)
  }

  DrawNewFreehandLine = function (e, t, a) {
    var r = GlobalData.objectStore.GetObject(GlobalData.optManager.theSEDSessionBlockID).Data;
    a ? attributes = Utils1.DeepCopy(a.Data.attributes) : (
      attributes = {
        Frame: {
          x: 0,
          y: 0,
          width: 1,
          height: 1
        },
        StartPoint: {
          x: 0,
          y: 0
        },
        EndPoint: {
          x: 0,
          y: 0
        },
        pointlist: [],
        bOverrideDefaultStyleOnDraw: !0
      },
      attributes.pointlist.push({
        x: 0,
        y: 0
      })
    );
    var i = new ListManager.FreehandLine(attributes),
      n = Utils1.DeepCopy(r.def.style);
    if (
      a &&
      a.Data &&
      a.Data.attributes &&
      a.Data.attributes.StyleRecord &&
      (n = Utils1.DeepCopy(a.Data.attributes.StyleRecord)),
      i.StyleRecord = n,
      e
    ) return i;
    GlobalData.optManager.DrawNewObject(i, t)
  }

  DrawNewArcLine = function (e, t, a) {
    var r,
      i = GlobalData.objectStore.GetObject(GlobalData.optManager.theSEDSessionBlockID).Data,
      n = 0 == (i.def.textflags & ConstantData.TextFlags.SED_TF_HorizText),
      o = i.d_sarrow,
      s = i.d_earrow,
      l = i.d_sarrowdisp,
      S = i.d_earrowdisp;
    o > 0 != s > 0 &&
      (0 === s && (s = o, S = l), o = 0, l = !1),
      r = a ? Utils1.DeepCopy(a.Data.attributes) : {
        Frame: {
          x: 0,
          y: 0,
          width: 1,
          height: 1
        },
        StartPoint: {
          x: 0,
          y: 0
        },
        EndPoint: {
          x: 0,
          y: 0
        },
        StartArrowID: o,
        EndArrowID: s,
        StartArrowDisp: l,
        EndArrowDisp: S,
        ArrowSizeIndex: i.d_arrowsize,
        CurveAdjust: 7,
        TextGrow: ConstantData.TextGrowBehavior.HORIZONTAL,
        TextAlign: ConstantData.DocumentContext.CurrentTextAlignment,
        TextDirection: n,
        Dimensions: i.dimensions,
        bOverrideDefaultStyleOnDraw: !0
      };
    var c = new Instance.Shape.ArcLine(r),
      u = Utils1.DeepCopy(i.def.style);
    if (a && a.Data && a.Data.attributes && a.Data.attributes.StyleRecord) u = Utils1.DeepCopy(a.Data.attributes.StyleRecord);
    else {
      var p = Resources.FindStyle(ConstantData.Defines.TextBlockStyle);
      u.Text.Paint.Color = p.Text.Paint.Color
    }
    if (
      c.StyleRecord = u,
      i.flags & ConstantData.SessionFlags.SEDS_AllowHops &&
      (
        c.flags = Utils2.SetFlag(c.flags, ConstantData.ObjFlags.SEDO_LineHop, !0)
      ),
      e
    ) return c;
    GlobalData.optManager.DrawNewObject(c, t)
  }

}

export default ShapeController


// const ShapeController = function () {
//   this.AddDirection = function (e, t) {
//     switch (e) {
//       case 'left':
//         GlobalDatagBusinessController.AddLeft();
//         break;
//       case 'right':
//         GlobalDatagBusinessController.AddRight();
//         break;
//       case 'up':
//         GlobalDatagBusinessController.AddAbove();
//         break;
//       case 'down':
//         GlobalDatagBusinessController.AddBelow(!1);
//         break;
//       case 'co-manager':
//         GlobalDatagBusinessController.AddCoManager();
//         break;
//       case 'assistant':
//         GlobalDatagBusinessController.AddAssistant();
//         break;
//       case 'addparents':
//         GlobalDatagBusinessController.AddParents();
//         break;
//       case 'adddescendants':
//         GlobalDatagBusinessController.AddDescendants();
//         break;
//       case 'addsibling':
//         GlobalDatagBusinessController.AddRightPeer(null, t)
//     }
//   },
//     this.AddSplitPath = function (e) {
//       switch (e) {
//         case 'left':
//           GlobalDatagBusinessController.SplitPathLeft(null, GlobalDatagFlowChartManager);
//           break;
//         case 'right':
//           GlobalDatagBusinessController.SplitPathRight(null, GlobalDatagFlowChartManager);
//           break;
//         case 'up':
//           GlobalDatagBusinessController.SplitPathUp(null, GlobalDatagFlowChartManager);
//           break;
//         case 'down':
//           GlobalDatagBusinessController.SplitPathDown(null, GlobalDatagFlowChartManager)
//       }
//     },
//     this.JoinPath = function () {
//       GlobalDatagBusinessController.JoinPath()
//     },
//     this.SelectLastAddedObject = function () {
//       var e = GlobalData.optManager.ZList(),
//         t = e.length;
//       t &&
//         GlobalData.optManager.SelectObjects([e[t - 1]], !1, !1)
//     },
//     this.AddRectangle = function (e, t) {
//       var a,
//         r,
//         i = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
//       e ? (
//         a = ConstantData.Defines.Shape_Square,
//         r = ConstantData.Defines.Shape_Square
//       ) : (
//         a = ConstantData.Defines.Shape_Width,
//         r = ConstantData.Defines.Shape_Height
//       );
//       var n = GlobalData.optManager.CalcWorkAreaUL(50, 50),
//         o = {
//           Frame: {
//             x: n.x,
//             y: n.y,
//             width: a,
//             height: r
//           },
//           TextGrow: ConstantData.TextGrowBehavior.PROPORTIONAL,
//           shapeparam: i.def.rrectparam,
//           moreflags: ConstantData.ObjMoreFlags.SED_MF_FixedRR
//         },
//         s = new ListManager.Rect(o);
//       GlobalData.optManager.AddNewObject(s, !0, !0),
//         this.SelectLastAddedObject(),
//         t ||
//         GlobalData.optManager.PreserveUndoState(!1)
//     },
//     this.AddRoundRect = function (e) {
//       var t,
//         a,
//         r = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
//       e ? (
//         t = ConstantData.Defines.Shape_Square,
//         a = ConstantData.Defines.Shape_Square
//       ) : (
//         t = ConstantData.Defines.Shape_Width,
//         a = ConstantData.Defines.Shape_Height
//       );
//       var i = GlobalData.optManager.CalcWorkAreaUL(50, 50),
//         n = {
//           Frame: {
//             x: i.x,
//             y: i.y,
//             width: t,
//             height: a
//           },
//           TextGrow: ConstantData.TextGrowBehavior.PROPORTIONAL,
//           shapeparam: r.def.rrectparam,
//           moreflags: ConstantData.ObjMoreFlags.SED_MF_FixedRR
//         },
//         o = new ListManager.RRect(n);
//       GlobalData.optManager.AddNewObject(o, !0, !0),
//         this.SelectLastAddedObject(),
//         GlobalData.optManager.PreserveUndoState(!1)
//     },
//     this.AddCircle = function (e) {
//       var t,
//         a;
//       e ? (
//         t = ConstantData.Defines.Shape_Square,
//         a = ConstantData.Defines.Shape_Square
//       ) : (
//         t = ConstantData.Defines.Shape_Width,
//         a = ConstantData.Defines.Shape_Height
//       );
//       var r = GlobalData.optManager.CalcWorkAreaUL(50, 50),
//         i = null;
//       if (e) {
//         i = {
//           Frame: {
//             x: r.x,
//             y: r.y,
//             width: 100,
//             height: 100
//           },
//           TextGrow: ConstantData.TextGrowBehavior.PROPORTIONAL
//         }
//       } else i = {
//         Frame: {
//           x: r.x,
//           y: r.y,
//           width: t,
//           height: a
//         },
//         TextGrow: ConstantData.TextGrowBehavior.PROPORTIONAL
//       };
//       var n = new ListManager.Oval(i);
//       GlobalData.optManager.AddNewObject(n, !0, !0),
//         this.SelectLastAddedObject(),
//         GlobalData.optManager.PreserveUndoState(!1)
//     };
//   var e = !1;
//   var t = !1;
//   this.StampOrDragDropMobileCallback = function (t, a) {
//     var r;
//     if (
//       GlobalData.optManager.StampTimeout = null,
//       SDUI.Commands.MainController.Dropdowns.HideAllDropdowns(),
//       'textLabel' != a &&
//       (ConstantData.DocumentContext.ShapeTool = a),
//       e ? (r = !1, GlobalData.optManager.UnbindDragDropOrStamp()) : r = !0,
//       r
//     ) switch (a) {
//       case 'textLabel':
//         t.StampTextLabel(!1, !1);
//         break;
//       case 'rect':
//         t.StampRectangle(!0, !1);
//         break;
//       case 'roundRect':
//         t.StampRoundRect(!0, !1);
//         break;
//       case 'circle':
//         t.StampCircle(!0, !0);
//         break;
//       case 'oval':
//         t.StampCircle(!0, !1);
//         break;
//       case 'square':
//         t.StampRectangle(!0, !0);
//         break;
//       case 'roundSquare':
//         t.StampRoundRect(!0, !0)
//     } else switch (a) {
//       case 'rect':
//         t.AddRectangle(!1);
//         break;
//       case 'roundRect':
//         t.AddRoundRect(!1);
//         break;
//       case 'circle':
//         t.AddCircle(!0);
//         break;
//       case 'oval':
//         t.AddCircle(!1);
//         break;
//       case 'square':
//         t.AddRectangle(!0);
//         break;
//       case 'roundSquare':
//         t.AddRoundRect(!0)
//     }
//   },
//     this.StampOrDragDropCallback = function (t, a) {
//       console.log('StampOrDragDropCallback 1 t=', t)
//       console.log('StampOrDragDropCallback 2 a=', a)
//       var r,
//         i = FileParser.SDRShapeTypes;
//       switch (
//       GlobalData.optManager.StampTimeout = null,
//       SDUI.Commands.MainController.Dropdowns.HideAllDropdowns(),
//       'textLabel' != a &&
//       (ConstantData.DocumentContext.ShapeTool = a),
//       e ? (r = !1, GlobalData.optManager.UnbindDragDropOrStamp()) : r = !0,
//       a
//       ) {
//         case 'textLabel':
//           t.StampTextLabel(!1, !1);
//           break;
//         case i.SED_S_Rect:
//           t.StampRectangle(r, !1);
//           break;
//         case i.SED_S_RRect:
//           t.StampRoundRect(r, !1);
//           break;
//         case i.SED_S_Circ:
//           t.StampCircle(r, !0);
//           break;
//         case i.SED_S_Oval:
//           t.StampCircle(r, !1);
//           break;
//         default:
//           t.StampShape(a, r, !1)
//       }
//     },
//     this.StampOrDragDropNewShape = function (t, a) {
//       console.log('StampOrDragDropNewShape 1 t=', t)
//       console.log('StampOrDragDropNewShape 2 a=', a)


//       /*
//       var r,
//         i;
//       if (
//         GlobalData.optManager.SetUIAdaptation(t),

//         // Resources.ts
//         ConstantData.DocumentContext.HTMLFocusControl &&
//         ConstantData.DocumentContext.HTMLFocusControl.blur &&
//         ConstantData.DocumentContext.HTMLFocusControl.blur(),
//         a ? ConstantData.DocumentContext.ShapeTool = a : a = ConstantData.DocumentContext.ShapeTool,
//         GlobalData.optManager.isMobilePlatform
//       ) {
//         if (
//           'pointerdown' == t.type &&
//           (
//             e = !1,
//             GlobalData.optManager.PreDragDropOrStamp(),
//             r = this,
//             i = this.StampOrDragDropMobileCallback,
//             GlobalData.optManager.StampTimeout = window.setTimeout(i, 200, r, a)
//           ),
//           'pointerup' == t.type
//         ) return void (e = !0)
//       } else if (
//         'mousedown' != t.type &&
//         'pointerdown' != t.type &&
//         'touchstart' != t.type ||
//         (
//           t.preventDefault &&
//           t.preventDefault(),
//           e = !1,
//           GlobalData.optManager.PreDragDropOrStamp(),
//           r = this,
//           i = this.StampOrDragDropCallback,
//           GlobalData.optManager.StampTimeout = window.setTimeout(i, 200, r, a)
//         ),
//         'mouseup' == t.type ||
//         'pointerup' == t.type ||
//         'touchend' == t.type
//       ) return void (e = !0)
//        */


//       // debugger;
//       var r, i;
//       if (GlobalData.optManager.SetUIAdaptation(t),
//         ConstantData.DocumentContext.HTMLFocusControl &&
//         ConstantData.DocumentContext.HTMLFocusControl.blur &&
//         ConstantData.DocumentContext.HTMLFocusControl.blur(),
//         a ? ConstantData.DocumentContext.ShapeTool = a : a = ConstantData.DocumentContext.ShapeTool,
//         GlobalData.optManager.isMobilePlatform) {
//         if (t.type === 'pointerdown') {
//           e = !1;
//           GlobalData.optManager.PreDragDropOrStamp();
//           r = this;
//           i = this.StampOrDragDropMobileCallback;
//           GlobalData.optManager.StampTimeout = window.setTimeout(i, 200, r, a);
//         } else if (t.type === 'pointerup') {
//           e = !0;
//         }
//         // Double ===
//       } else if (t.type === "click" || t.type === 'mousedown' || t.type === 'pointerdown' || t.type === 'touchstart') {
//         t.preventDefault && t.preventDefault();
//         e = !1;
//         GlobalData.optManager.PreDragDropOrStamp();
//         r = this;
//         i = this.StampOrDragDropCallback;
//         GlobalData.optManager.StampTimeout = window.setTimeout(i, 200, r, a);
//       } else if (t.type === 'mouseup' || t.type === 'pointerup' || t.type === 'touchend') {
//         e = !0;
//       }




//     },
//     this.StampSVGFragmentSymbol = function (e) {
//       var t,
//         a,
//         r = GlobalData.optManager.GetNextTestSymbolFragment();
//       if (r && r.SVGFragment) {
//         t = r.width,
//           a = r.height;
//         var i = - 1000,
//           n = - 1000;
//         r = r.SVGFragment.slice(0);
//         var o = {
//           Frame: {
//             x: i,
//             y: n,
//             width: t,
//             height: a
//           },
//           InitialGroupBounds: {
//             width: t,
//             height: a
//           },
//           TextGrow: ConstantData.TextGrowBehavior.PROPORTIONAL,
//           SVGFragment: r
//         },
//           s = new ListManager.SVGFragmentSymbol(o);
//         s &&
//           (
//             e ? GlobalData.optManager.DragDropNewShape(s, !0, !0, !0, null, null) : GlobalData.optManager.MouseStampNewShape(s, !0, !0, !0, null, null)
//           )
//       }
//     },

//     this.StampRoundRect = function (e, t) {
//       var a,
//         r,
//         i = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
//       t ? (
//         a = ConstantData.Defines.Shape_Square,
//         r = ConstantData.Defines.Shape_Square
//       ) : (
//         a = ConstantData.Defines.Shape_Width,
//         r = ConstantData.Defines.Shape_Height
//       );
//       var n = {
//         Frame: {
//           x: - 1000,
//           y: - 1000,
//           width: a,
//           height: r
//         },
//         TextGrow: ConstantData.TextGrowBehavior.PROPORTIONAL,
//         shapeparam: i.def.rrectparam,
//         moreflags: ConstantData.ObjMoreFlags.SED_MF_FixedRR
//       };
//       t &&
//         (n.ObjGrow = ConstantData.GrowBehavior.PROPORTIONAL);
//       var o = new ListManager.RRect(n);
//       console.log('StampRoundRect 1 o=', o)
//       e ? GlobalData.optManager.DragDropNewShape(o, !0, !0, !0, null, null) : GlobalData.optManager.MouseStampNewShape(o, !0, !0, !0, null, null)
//     },

//     this.StampCallback = function (e, t) {
//       if (t.bActivateText) {
//         var a = GlobalData.optManager.svgObjectLayer.GetElementByID(e);
//         GlobalData.optManager.ActivateTextEdit(a)
//       }
//     };
//   var a = !1;

//     this.SD_PreloadTimer = null,





//     this.ForceStampSymbolCallback = function (e, t) {
//       var a = GlobalData.optManager.BuildSymbolObject(e, !1);
//       if (a) {
//         var r = (a.ExtraFlags & ConstantData.ExtraFlags.SEDE_NoColor) > 0;
//         GlobalData.optManager.MouseStampNewShape(a, !0, !0, r, null, null)
//       }
//     },
//     this.ForceStampSymbol = function (e) {
//       if (
//         SDUI.Commands.MainController.Symbols.CurrentSymbol != e &&
//         (
//           SDUI.Commands.MainController.Symbols.CurrentSymbol = e,
//           null == SDUI.Commands.MainController.Symbols.GetSymbolData(e)
//         )
//       ) SDUI.CMSContent.GetSymbolMetadata(
//         SDUI.AppSettings.ContentSource,
//         e,
//         (
//           function (t) {
//             if (t) {
//               SDUI.Commands.MainController.Symbols.StoreSymbolData(e, t),
//                 GlobalData.optManager.ReplaceSymbolID = null;
//               var a = SDUI.Commands.MainController.Shapes.ForceStampSymbolCallback;
//               SDUI.Commands.MainController.Shapes,
//                 window.setTimeout(a, 0, e)
//             }
//           }
//         )
//       );
//       GlobalData.optManager.ReplaceSymbolID = null;
//       var t = SDUI.Commands.MainController.Shapes.ForceStampSymbolCallback;
//       SDUI.Commands.MainController.Shapes;
//       window.setTimeout(t, 0, e)
//     },
//     this.AddSelectedSymbol = function (r, i) {
//       try {
//         if (
//           null == GlobalData.optManager.theDrawShape &&
//           (GlobalData.optManager.theDrawShape = new ListManager.Rect({
//           })),
//           i
//         ) a = !1,
//           e = !1,
//           t = !0,
//           GlobalData.optManager.CancelObjectStamp(!0),
//           GlobalData.optManager.theMoveList = [];
//         else {
//           if (GlobalData.optManager.theMoveList) {
//             var n = Utils1.DeepCopy(GlobalData.optManager.theMoveList);
//             GlobalData.optManager.theMoveList = []
//           }
//           GlobalData.optManager.theMoveList = [],
//             t = !0,
//             Collab.AllowMessage() &&
//             Collab.BeginSecondaryEdit()
//         }
//         var o = gBaseManager.AddSymbol(r, !0, i),
//           s = GlobalData.optManager.GetObjectPtr(o, !1);
//         if (Collab.AddNewBlockToSecondary(o), i) l = {
//           x: i.Data.pt.x,
//           y: i.Data.pt.y
//         };
//         else var l = GlobalData.optManager.GetPastePosition();
//         var S = {
//           pt: {
//             x: l.x,
//             y: l.y
//           },
//           symbolID: r
//         },
//           c = SDUI.Commands.MainController.Symbols.GetLMObject(r);
//         c &&
//           c.SymbolData &&
//           c.SymbolData.IsCustomContent &&
//           c.nativeDataArrayBuffer &&
//           (
//             S.nativeDataString = Collab.BufferToString(c.nativeDataArrayBuffer),
//             S.SymbolData = Utils1.DeepCopy(c.SymbolData)
//           ),
//           Collab.IsSecondary() &&
//           Collab.CreateList.length &&
//           (
//             S.CreateList = [],
//             S.CreateList = S.CreateList.concat(Collab.CreateList)
//           ),
//           GlobalData.optManager.AddCount++,
//           GlobalData.optManager.AddCount > 25 &&
//           (GlobalData.optManager.AddCount = 0);
//         var u,
//           p,
//           d,
//           D,
//           g = [],
//           h = {},
//           m = - 1,
//           C = 0;
//         if (p = GlobalData.optManager.theMoveList ? GlobalData.optManager.theMoveList.length : 0) {
//           for (u = 0; u < p; u++) if (
//             o = GlobalData.optManager.theMoveList[u],
//             d = !1,
//             s = GlobalData.optManager.GetObjectPtr(o, !1)
//           ) {
//             if (s.IsSwimlane()) d = !0;
//             else switch (s.objecttype) {
//               case ListManager.ObjectTypes.SD_OBJT_SHAPECONTAINER:
//                 d = !0,
//                   s.hooks.length &&
//                   (D = GlobalData.optManager.GetObjectPtr(s.hooks[0].objid, !1)) &&
//                   D.objecttype === ListManager.ObjectTypes.SD_OBJT_TABLE_WITH_SHAPECONTAINER &&
//                   (d = !1);
//                 break;
//               case ListManager.ObjectTypes.SD_OBJT_TABLE_WITH_SHAPECONTAINER:
//                 d = !0
//             }
//             d &&
//               (m = o, C++),
//               0 === u ? h = Utils1.DeepCopy(s.r) : Utils2.UnionRect(h, s.r, h)
//           }
//           for (l.x = l.x - h.x, l.y = l.y - h.y, u = 0; u < p; u++) o = GlobalData.optManager.theMoveList[u],
//             (s = GlobalData.optManager.GetObjectPtr(o, !1)) &&
//             (
//               s.OffsetShape(l.x, l.y),
//               g.push(o),
//               GlobalData.optManager.AddToDirtyList(o),
//               s.hooks.length &&
//               GlobalData.optManager.SetLinkFlag(s.hooks[0].objid, ConstantData.LinkFlags.SED_L_MOVE)
//             )
//         } else {
//           if (null == s) return;
//           if (
//             s.SetShapeOrigin(l.x, l.y),
//             s.objecttype === ListManager.ObjectTypes.SD_OBJT_FRAME
//           ) {
//             var y = GlobalData.optManager.ZListPreserve(),
//               f = GlobalData.optManager.ReplaceSpecialObject(s, o, y, s.objecttype);
//             if (f) {
//               var L = [
//                 f
//               ];
//               GlobalData.optManager.DeleteObjects(L, !1),
//                 s.UpdateFrame(s.Frame)
//             }
//           } else g.push(o);
//           GlobalData.optManager.AddToDirtyList(o)
//         }
//         GlobalData.optManager.SetLinkFlagsOnFilledClosedPolylines(o),
//           Collab.AllowMessage() &&
//           Collab.BuildMessage(ConstantData.CollabMessages.AddSelectedSymbol, S, !1),
//           n &&
//           (GlobalData.optManager.theMoveList = n),
//           i &&
//           (t = !1),
//           g.length &&
//           1 === C &&
//           (g = []).push(m),
//           GlobalData.optManager.CompleteOperation(g),
//           SDUI.Commands.MainController.Shapes.ReturnToSmartPanelMode(r)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ReturnToSmartPanelMode = function (e) {
//       if (
//         SDUI.Commands.MainController.SmartPanels.GetLeftPanelMode() !== Resources.LeftPanelMode.LEFTPANELMODE_SMARTPANEL
//       ) {
//         SDUI.Commands.MainController.SmartPanels.SetLeftPanelMode(Resources.LeftPanelMode.LEFTPANELMODE_SMARTPANEL);
//         var t,
//           a,
//           r = ListManager.EssentialLibraries[e];
//         if (r) for (a = r.length, t = 0; t < a; t++) '9cdd3a7c-1eeb-4660-b726-142cf9b5d607' === r[t] &&
//           (
//             SDUI.Commands.MainController.Symbols.CurrentLibrary = null,
//             SDUI.Commands.MainController.Symbols.CurrentSymbol = null
//           ),
//           SDUI.Commands.MainController.Symbols.AddLibrary(r[t], !0)
//       }
//     },
//     this.StampOrDragDropNewSymbol = function (e, t) {
//       GlobalData.optManager.ReplaceSymbolID = null;
//       var a = GlobalData.optManager.BuildSymbolObject(e, t);
//       if (a) {
//         var r = (a.ExtraFlags & ConstantData.ExtraFlags.SEDE_NoColor) > 0;
//         t ? GlobalData.optManager.DragDropNewShape(a, !0, !0, r, null, null) : GlobalData.optManager.MouseStampNewShape(a, !0, !0, r, null, null)
//       }
//     },
//
//     this.DrawNewStyledLineShape = function (e, t, a) {
//       var r = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
//       let i = !1;
//       null == a ? e ? ConstantData.DocumentContext.StyledLineTool = e : e = ConstantData.DocumentContext.StyledLineTool : i = !0;
//       let n = Utils1.DeepCopy(r.def.style),
//         o = r.def[e];
//       n.Line.Thickness = o.Line.Thickness,
//         n.Line.Paint.Color = o.Line.Paint.Color,
//         n.Line.Paint.Opacity = o.Line.Paint.Opacity,
//         a ? attributes = Utils1.DeepCopy(a.Data.attributes) : (
//           attributes = {
//             Frame: {
//               x: 0,
//               y: 0,
//               width: 1,
//               height: 1
//             },
//             StartPoint: {
//               x: 0,
//               y: 0
//             },
//             EndPoint: {
//               x: 0,
//               y: 0
//             },
//             pointlist: [],
//             bOverrideDefaultStyleOnDraw: !0,
//             StyleRecord: n
//           },
//           attributes.pointlist.push({
//             x: 0,
//             y: 0
//           })
//         );
//       var s = new ListManager.FreehandLine(attributes);
//       if (GlobalData.optManager.DrawNewObject(s, t), i) return s
//     },
//     this.DrawNewWallShape = function (e, t) {
//       console.log('DrawNewWallShape e,t=>', e, t);
//       console.log('DrawNewWallShape i=>', i);
//       console.log('DrawNewWallShape gBusinessManager=>', GlobalData.gBusinessManager)
//       // debugger
//       var a,
//         r = t != null,
//         i = Business.GetSelectionBusinessManager();

//       if (i == null) {
//         i = GlobalData.gBusinessManager;
//       }

//       if (i && i.AddWall) {
//         GlobalData.optManager.CloseEdit();
//         i.ToggleAddingWalls(true);
//         a = i.AddWall(r, t);
//         ConstantData.DocumentContext.UsingWallTool = true;
//       }

//       if (r) {
//         console.log('DrawNewWallShape a=>', a);
//         return a;
//       }
//     },
//     this.DrawNewLine = function (e, t, a, r) {
//       console.log(' => ============DrawNewLineShape 2 e, t, a, r=>', e, t, a, r);

//       var i = GlobalData.objectStore.GetObject(GlobalData.optManager.theSEDSessionBlockID).Data,
//         n = 0 == (i.def.textflags & ConstantData.TextFlags.SED_TF_HorizText),
//         o = i.d_sarrow,
//         s = i.d_earrow,
//         l = i.d_sarrowdisp,
//         S = i.d_earrowdisp,
//         c = 0;
//       switch (t) {
//         case FileParser.LineTypes.SED_LS_Comm:
//         case FileParser.LineTypes.SED_LS_Digi:
//           c = 0.25
//       }
//       if (o > 0 != s > 0 && (0 === s && (s = o, S = l), o = 0, l = !1), r) u = Utils1.DeepCopy(r.Data.attributes);
//       else var u = {
//         Frame: {
//           x: 0,
//           y: 0,
//           width: 1,
//           height: 1
//         },
//         StartPoint: {
//           x: 0,
//           y: 0
//         },
//         EndPoint: {
//           x: 0,
//           y: 0
//         },
//         StartArrowID: o,
//         StartArrowDisp: l,
//         EndArrowID: s,
//         EndArrowDisp: S,
//         ArrowSizeIndex: i.d_arrowsize,
//         TextGrow: ConstantData.TextGrowBehavior.HORIZONTAL,
//         TextAlign: ConstantData.DocumentContext.CurrentTextAlignment,
//         TextDirection: n,
//         Dimensions: i.dimensions,
//         ShortRef: t,
//         shapeparam: c,
//         bOverrideDefaultStyleOnDraw: !0
//       };
//       var p = new ListManager.Line(u),
//         d = Utils1.DeepCopy(i.def.style);
//       if (r && r.Data && r.Data.attributes && r.Data.attributes.StyleRecord) d = Utils1.DeepCopy(r.Data.attributes.StyleRecord);
//       else {
//         var D = Resources.FindStyle(ConstantData.Defines.TextBlockStyle);
//         d.Text.Paint.Color = D.Text.Paint.Color
//       }
//       if (
//         p.StyleRecord = d,
//         i.flags & ListManager.SessionFlags.SEDS_AllowHops &&
//         (
//           p.flags = Utils2.SetFlag(p.flags, ConstantData.ObjFlags.SEDO_LineHop, !0)
//         ),
//         a
//       ) return p;
//       GlobalData.optManager.DrawNewObject(p, e)
//     },

//     this.Undo = function () {
//       try {
//         if (Collab.AllowMessage()) if (Collab.IsSecondary()) {
//           if (!Collab.AllowUndo()) return !1;
//           Collab.BuildMessage(ConstantData.CollabMessages.Undo, null, !1)
//         } else GlobalData.optManager.Undo() &&
//           Collab.BuildMessage(ConstantData.CollabMessages.Undo, null, !1);
//         else GlobalData.optManager.Undo()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },


//     this.DeleteSelectedObjects = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.DeleteSelectedObjects()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SelectAllObjects = function () {
//       try {
//         GlobalData.optManager.SelectAllObjects()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SendToBack = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.SendSelectedToBack()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.BringToFront = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.BringSelectedToFront()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },

//     this.SwitchTheme = function (e, t) {
//       console.log('SwitchTheme ShapeController 1e', e);
//       console.log('SwitchTheme ShapeController 1t', t);

//       try {
//         if (GlobalData.optManager.CloseEdit(), t && Collab.AllowMessage()) {
//           Collab.BeginSecondaryEdit();
//           var a = {
//             themeName: e
//           };
//           GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0);
//           Collab.BuildMessage(ConstantData.CollabMessages.SwitchTheme, a, !1, !1)
//         }
//         GlobalData.optManager.SetTheme(e, Resources.CurrentTheme.Styles)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeQuickStyle = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(!0, !0);
//         var t = Utils1.DeepCopy(Resources.CurrentTheme.Styles[e - 1]);
//         GlobalData.optManager.SetSelectedObjectAttributes({
//           StyleRecord: t
//         }, !1, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.FillColor = function (e, t, a) {
//       try {
//         var r;
//         GlobalData.optManager.CloseEdit(!0, !0),
//           'nofill' === e ? (
//             r = {
//               Fill: {
//                 Paint: {
//                   FillType: ConstantData.FillTypes.SDFILL_TRANSPARENT
//                 }
//               }
//             },
//             null != GlobalData.optManager.RightClickParams &&
//             GlobalData.optManager.Table_FillSwimlane(
//               GlobalData.optManager.RightClickParams.TargetID,
//               GlobalData.optManager.RightClickParams.Context,
//               r.Fill,
//               GlobalData.optManager.RightClickParams.CellIndex
//             ) ||
//             GlobalData.optManager.SetSelectedObjectAttributes({
//               StyleRecord: r
//             }, a)
//           ) : 'recent' == e ||
//             'standard' == e ||
//             'custom' == e ? (
//             r = {
//               Fill: {
//                 Paint: {
//                   Color: t
//                 }
//               }
//             },
//             null != GlobalData.optManager.RightClickParams &&
//             GlobalData.optManager.Table_FillSwimlane(
//               GlobalData.optManager.RightClickParams.TargetID,
//               GlobalData.optManager.RightClickParams.Context,
//               r.Fill,
//               GlobalData.optManager.RightClickParams.CellIndex
//             ) ||
//             GlobalData.optManager.SetSelectedObjectAttributes({
//               StyleRecord: r
//             }, a)
//           ) : 'theme' == e &&
//           (
//             r = {
//               Fill: {
//                 Paint: {
//                   Color: Resources.CurrentTheme.Colors[t]
//                 }
//               }
//             },
//             null != GlobalData.optManager.RightClickParams &&
//             GlobalData.optManager.Table_FillSwimlane(
//               GlobalData.optManager.RightClickParams.TargetID,
//               GlobalData.optManager.RightClickParams.Context,
//               r.Fill,
//               GlobalData.optManager.RightClickParams.CellIndex
//             ) ||
//             GlobalData.optManager.SetSelectedObjectAttributes({
//               StyleRecord: r
//             }, a)
//           )
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.FillHatch = function (e) {
//       try {
//         var t;
//         GlobalData.optManager.CloseEdit(!0, !0),
//           t = {
//             Fill: {
//               Hatch: e
//             }
//           },
//           GlobalData.optManager.SetSelectedObjectAttributes({
//             StyleRecord: t
//           }, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.FillTexture = function (e, t) {
//       try {
//         var a;
//         GlobalData.optManager.CloseEdit(!0, !0);
//         var r = Utils1.DeepCopy(GlobalData.optManager.TextureList.Textures[e].TextureScale);
//         t &&
//           (
//             void 0 !== t.AlignmentScalar &&
//             (r.AlignmentScalar = t.AlignmentScalar),
//             void 0 !== t.Scale &&
//             (r.Scale = t.Scale),
//             void 0 !== t.RWidth &&
//             (r.RWidth = t.RWidth),
//             void 0 !== t.Units &&
//             (r.Units = t.Units)
//           ),
//           a = {
//             Fill: {
//               Paint: {
//                 Texture: e,
//                 TextureScale: r,
//                 FillType: ConstantData.FillTypes.SDFILL_TEXTURE
//               }
//             }
//           },
//           GlobalData.optManager.SetSelectedObjectAttributes({
//             StyleRecord: a
//           }, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.LineTexture = function (e, t) {
//       try {
//         var a;
//         GlobalData.optManager.CloseEdit(!0, !0);
//         var r = Utils1.DeepCopy(GlobalData.optManager.TextureList.Textures[e].TextureScale);
//         t &&
//           (
//             void 0 !== t.AlignmentScalar &&
//             (r.AlignmentScalar = t.AlignmentScalar),
//             void 0 !== t.Scale &&
//             (r.Scale = t.Scale),
//             void 0 !== t.RWidth &&
//             (r.RWidth = t.RWidth),
//             void 0 !== t.Units &&
//             (r.Units = t.Units)
//           ),
//           a = {
//             Line: {
//               Paint: {
//                 Texture: e,
//                 TextureScale: r,
//                 FillType: ConstantData.FillTypes.SDFILL_TEXTURE
//               }
//             }
//           },
//           GlobalData.optManager.SetSelectedObjectAttributes({
//             StyleRecord: a
//           }, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.FillGradient = function (e, t, a) {
//       try {
//         var r;
//         GlobalData.optManager.CloseEdit(!0, !0),
//           r = {
//             Fill: {
//               Paint: {
//                 Color: e,
//                 EndColor: t,
//                 GradientFlags: a,
//                 FillType: ConstantData.FillTypes.SDFILL_GRADIENT
//               }
//             }
//           },
//           GlobalData.optManager.SetSelectedObjectAttributes({
//             StyleRecord: r
//           }, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ResetFillGradient = function () {
//       try {
//         GlobalData.optManager.CloseEdit(!0, !0);
//         var e = {
//           Fill: {
//             Paint: {
//               FillType: ConstantData.FillTypes.SDFILL_SOLID
//             }
//           }
//         };
//         GlobalData.optManager.SetSelectedObjectAttributes({
//           StyleRecord: e
//         }, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.LineGradient = function (e, t, a) {
//       try {
//         var r;
//         GlobalData.optManager.CloseEdit(!0, !0),
//           r = {
//             Line: {
//               Paint: {
//                 Color: e,
//                 EndColor: t,
//                 GradientFlags: a,
//                 FillType: ConstantData.FillTypes.SDFILL_GRADIENT
//               }
//             }
//           },
//           GlobalData.optManager.SetSelectedObjectAttributes({
//             StyleRecord: r
//           }, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ResetLineGradient = function () {
//       try {
//         GlobalData.optManager.CloseEdit(!0, !0);
//         var e = {
//           Line: {
//             Paint: {
//               FillType: ConstantData.FillTypes.SDFILL_SOLID
//             }
//           }
//         };
//         GlobalData.optManager.SetSelectedObjectAttributes({
//           StyleRecord: e
//         }, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SetOutsideEffect = function (e) {
//       try {
//         var t,
//           a;
//         if (e >= Resources.CurrentTheme.OutsideEffects.length) return;
//         GlobalData.optManager.CloseEdit(!0, !0),
//           t = e < 0 ? {
//             OutsideEffect: {
//               OutsideType: 0,
//               OutsideExtent_Left: 0,
//               OutsideExtent_Top: 0,
//               OutsideExtent_Right: 0,
//               OutsideExtent_Bottom: 0,
//               Color: '#000000',
//               WParam: 0,
//               LParam: 0
//             }
//           }
//             : {
//               OutsideEffect: {
//                 OutsideType: (a = Resources.CurrentTheme.OutsideEffects[e]).OutsideType,
//                 OutsideExtent_Left: a.OutsideExtent_Left,
//                 OutsideExtent_Top: a.OutsideExtent_Top,
//                 OutsideExtent_Right: a.OutsideExtent_Right,
//                 OutsideExtent_Bottom: a.OutsideExtent_Bottom,
//                 Color: a.Color,
//                 WParam: a.WParam,
//                 LParam: a.LParam
//               }
//             },
//           GlobalData.optManager.SetSelectedObjectAttributes({
//             StyleRecord: t
//           }, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SetInsideEffect = function (e) {
//       try {
//         var t,
//           a;
//         if (e >= Resources.CurrentTheme.InsideEffects.length) return;
//         GlobalData.optManager.CloseEdit(!0, !0),
//           t = e < 0 ? {
//             Fill: {
//               FillEffect: 0,
//               EffectColor: '#000000',
//               WParam: 0,
//               LParam: 0
//             }
//           }
//             : {
//               Fill: {
//                 FillEffect: (a = Resources.CurrentTheme.InsideEffects[e]).Effect,
//                 EffectColor: a.EffectColor,
//                 WParam: a.WParam,
//                 LParam: a.LParam
//               }
//             },
//           GlobalData.optManager.SetSelectedObjectAttributes({
//             StyleRecord: t
//           }, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ConnectorSetStyle = function (e, t) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.CN_SetStyle(t, e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ConnectorSetSpacing = function (e, t) {
//       try {
//         var a = Business.GetSelectionBusinessManager();
//         if (a && a.SetConnectorSpacing) {
//           GlobalData.optManager.CloseEdit();
//           var r = !1;
//           Collab.AllowMessage() &&
//             (Collab.BeginSecondaryEdit(), r = !0);
//           var i = SDJS_Business_GetModuleName(a);
//           if (null == i && (i = ''), null != i && a.SetConnectorSpacing(e, t, r), r) {
//             var n = {
//               vertical: e,
//               spacing: t,
//               SelectionManagerName: i
//             };
//             Collab.BuildMessage(ConstantData.CollabMessages.ConnectorSetSpacing, n, !0),
//               GlobalData.optManager.CompleteOperation()
//           }
//         } else {
//           Utils2.Alert(Resources.Strings.Error_NoShapeWithLine, null);
//           var o = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
//           SDUI.Commands.MainController.SmartPanels.Idle_ConnectorFormat(o, !0)
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Line_SetColor = function (e, t) {
//       var a;
//       try {
//         GlobalData.optManager.CloseEdit(!0, !0),
//           'theme' == e ? (
//             a = {
//               Line: {
//                 Paint: {
//                   Color: Resources.CurrentTheme.Colors[t]
//                 }
//               }
//             },
//             GlobalData.optManager.SetSelectedObjectAttributes({
//               StyleRecord: a
//             }, !1)
//           ) : 'custom' != e &&
//           'recent' != e &&
//           'standard' != e ||
//           (
//             a = {
//               Line: {
//                 Paint: {
//                   Color: t
//                 }
//               }
//             },
//             GlobalData.optManager.SetSelectedObjectAttributes({
//               StyleRecord: a
//             }, !1)
//           )
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.FillOpacity = function (e) {
//       try {
//         var t = e / 100;
//         GlobalData.optManager.CloseEdit(!0, !0);
//         var a = {
//           Fill: {
//             Paint: {
//               Opacity: t
//             }
//           }
//         };
//         GlobalData.optManager.SetSelectedObjectAttributes({
//           StyleRecord: a
//         }, !1, !0)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.FormatPainter = function (e) {
//       try {
//         GlobalData.optManager.SetFormatPainter(!1, e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },

//     this.Line_SetThickness = function (e, t) {
//       let a = !1;
//       !0 === t &&
//         (a = !0);
//       try {
//         GlobalData.optManager.CloseEdit(!0, !0);
//         var r = e,
//           i = 0;
//         r > ConstantData.Defines.SED_MaxJSLineThick &&
//           (i = r / 2);
//         var n = {
//           Line: {
//             Thickness: r,
//             BThick: i
//           }
//         };
//         GlobalData.optManager.SetSelectedObjectAttributes({
//           StyleRecord: n
//         }, a)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Line_SetDashPattern = function (e) {
//       try {
//         var t = e;
//         GlobalData.optManager.CloseEdit(!0, !0);
//         var a = {
//           Line: {
//             LinePattern: t
//           }
//         };
//         GlobalData.optManager.SetSelectedObjectAttributes({
//           StyleRecord: a
//         }, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Line_SetOpacity = function (e) {
//       try {
//         var t = e / 100;
//         GlobalData.optManager.CloseEdit(!0, !0);
//         var a = {
//           Line: {
//             Paint: {
//               Opacity: t
//             }
//           }
//         };
//         GlobalData.optManager.SetSelectedObjectAttributes({
//           StyleRecord: a
//         }, !1, !0)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.FreehandLine_SetOpacity = function (e, t) {
//       try {
//         var a = e / 100;
//         GlobalData.optManager.CloseEdit(!0, !0);
//         var r = {
//           Line: {
//             Paint: {
//               Opacity: a
//             }
//           }
//         };
//         GlobalData.optManager.SetSelectedObjectAttributes({
//           StyleRecord: r
//         }, !0, !0);
//         var i,
//           n = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0);
//         switch (t) {
//           case ListManager.FreehandLineTypes.Pen:
//             i = n.def.pen;
//             break;
//           case ListManager.FreehandLineTypes.Highlighter:
//             i = n.def.highlighter
//         }
//         i &&
//           (i.Line.Paint.Opacity = a)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.FreehandLine_SetThickness = function (e, t) {
//       this.Line_SetThickness(e, !0);
//       var a,
//         r = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0);
//       switch (t) {
//         case ListManager.FreehandLineTypes.Pen:
//           a = r.def.pen;
//           break;
//         case ListManager.FreehandLineTypes.Highlighter:
//           a = r.def.highlighter
//       }
//       a &&
//         (a.Line.Thickness = e)
//     },
//     this.FreehandLine_SetColor = function (e, t) {
//       try {
//         GlobalData.optManager.CloseEdit(!0, !0);
//         let i = {
//           Line: {
//             Paint: {
//               Color: e
//             }
//           }
//         };
//         GlobalData.optManager.SetSelectedObjectAttributes({
//           StyleRecord: i
//         }, !0);
//         var a,
//           r = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0);
//         switch (t) {
//           case ListManager.FreehandLineTypes.Pen:
//             a = r.def.pen;
//             break;
//           case ListManager.FreehandLineTypes.Highlighter:
//             a = r.def.highlighter
//         }
//         a &&
//           (a.Line.Paint.Color = e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Line_SetArrowhead = function (e, t) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.SetSelectedObjectAttributes(e, t)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SD_Line_ReverseDirection = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.ReverseArrowheads()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SD_Line_SelectDirection = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit();
//         var t,
//           a,
//           r,
//           i,
//           n,
//           o,
//           s,
//           l = ListManager.ActionArrow,
//           S = ListManager.HookPts;
//         s = GlobalData.optManager.RightClickParams.TargetID;
//         var c = GlobalData.optManager.GetObjectPtr(s, !1);
//         if (c) {
//           for (i = c.hooks.length, r = 0; r < i; r++) c.hooks[r].hookpt === S.SED_KTL ? n = r : c.hooks[r].hookpt === S.SED_KTR &&
//             (o = r);
//           if (null != o && null != n) {
//             switch (e) {
//               case l.RIGHT:
//                 c.StartPoint.x > c.EndPoint.x ? (t = c.hooks[n].objid, a = c.hooks[o].objid) : (t = c.hooks[o].objid, a = c.hooks[n].objid);
//                 break;
//               case l.LEFT:
//                 c.StartPoint.x > c.EndPoint.x ? (t = c.hooks[o].objid, a = c.hooks[n].objid) : (t = c.hooks[n].objid, a = c.hooks[o].objid);
//                 break;
//               case l.DOWN:
//                 c.StartPoint.y > c.EndPoint.y ? (t = c.hooks[n].objid, a = c.hooks[o].objid) : (t = c.hooks[o].objid, a = c.hooks[n].objid);
//                 break;
//               case l.UP:
//                 c.StartPoint.y > c.EndPoint.y ? (t = c.hooks[o].objid, a = c.hooks[n].objid) : (t = c.hooks[n].objid, a = c.hooks[o].objid);
//                 break;
//               default:
//                 return t = c.hooks[n].objid,
//                   a = c.hooks[o].objid,
//                   void Business.SelectConnectedLines(a, s)
//             }
//             Business.SelectConnectedShapes(a, t, s, e)
//           }
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.AddMultiplicity = function () {
//       try {
//         if (GlobalData.optManager.CloseEdit(), GlobalData.optManager.AddMultiplicity(!0)) {
//           if (Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var e = Collab.BuildMessage(ConstantData.CollabMessages.AddMultiplicity, {
//             }, !0, !0)
//           }
//           GlobalData.optManager.AddMultiplicity(!1, !0) &&
//             (
//               Collab.AllowMessage() &&
//               (
//                 Collab.IsSecondary() &&
//                 Collab.CreateList.length &&
//                 (
//                   e.Data.CreateList = [],
//                   e.Data.CreateList = e.Data.CreateList.concat(Collab.CreateList)
//                 ),
//                 Collab.SendMessage(e)
//               ),
//               GlobalData.optManager.CompleteOperation()
//             )
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Multiplicity_SwitchSides = function () {
//       try {
//         if (
//           GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.Multiplicity_SwitchSides(GlobalData.optManager.RightClickParams.TargetID, !0, !0)
//         ) {
//           if (Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var e = {
//               BlockID: GlobalData.optManager.RightClickParams.TargetID
//             },
//               t = Collab.BuildMessage(
//                 ConstantData.CollabMessages.Multiplicity_SwitchSides,
//                 e,
//                 !1,
//                 !0
//               )
//           }
//           GlobalData.optManager.Multiplicity_SwitchSides(GlobalData.optManager.RightClickParams.TargetID, !1, !0),
//             Collab.AllowMessage() &&
//             Collab.SendMessage(t),
//             GlobalData.optManager.CompleteOperation()
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.BPMN_SwitchSymbol_Callback = function (e, t) {
//       GlobalData.optManager.BPMN_SwitchSymbol(t.objecttype, t.subtype, e)
//     },
//     this.BPMN_SwitchSymbol = function (e, t) {
//       try {
//         if (Business.GetSelectionBusinessManager()) {
//           var a = GlobalData.optManager.GetTargetSelect();
//           if (a < 0) return;
//           var r = GlobalData.optManager.GetObjectPtr(a, !1),
//             i = GlobalData.gBusinessManager.GetSymbolID(r, e, t)
//         }
//         if (null == i) return;
//         GlobalData.optManager.CloseEdit();
//         var n = {
//           objecttype: e,
//           subtype: t
//         };
//         SDUI.Commands.MainController.Shapes.SD_PreLoad_Symbol(
//           i,
//           n,
//           SDUI.Commands.MainController.Shapes.BPMN_SwitchSymbol_Callback,
//           !0
//         )
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.BPMN_SwitchIcon = function (e, t, a, r, i, n) {
//       try {
//         if (GlobalData.optManager.CloseEdit(), Collab.AllowMessage()) {
//           Collab.BeginSecondaryEdit();
//           var o = {
//             objecttype: e,
//             cellindex: t,
//             iconid: a,
//             cellindex2: r,
//             iconid2: i,
//             toggle: n
//           },
//             s = Collab.BuildMessage(ConstantData.CollabMessages.BPMN_SwitchIcon, o, !0, !0)
//         }
//         var l = GlobalData.optManager.GetTargetSelect();
//         if (l >= 0) {
//           if (n) GlobalData.optManager.Table_ToggleCellIcon(e, t, a, !0);
//           else {
//             var S = null != r &&
//               null != a;
//             GlobalData.optManager.Table_SetCellIcon(e, t, a, !0),
//               S &&
//               GlobalData.optManager.Table_SetCellIcon(e, r, i, !0)
//           }
//           Collab.AllowMessage() &&
//             Collab.SendMessage(s),
//             GlobalData.optManager.AddToDirtyList(l),
//             GlobalData.optManager.CompleteOperation(null)
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.BPMN_AddRemoveParticipant = function (e, t) {
//       try {
//         if (
//           GlobalData.optManager.CloseEdit(!0),
//           !t ||
//           GlobalData.optManager.Table_BPMNChoreo_AddRemoveRow(e, t, !0, !0)
//         ) {
//           if (Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var a = {
//               objecttype: e,
//               remove: t
//             },
//               r = Collab.BuildMessage(
//                 ConstantData.CollabMessages.BPMN_AddRemoveParticipant,
//                 a,
//                 !0,
//                 !0
//               )
//           }
//           GlobalData.optManager.Table_BPMNChoreo_AddRemoveRow(e, t, !1, !0),
//             Collab.AllowMessage() &&
//             Collab.SendMessage(r),
//             GlobalData.optManager.CompleteOperation()
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Import = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.DeleteAllObjects();
//         var t = e.name.toUpperCase().indexOf('.SDT') >= 0;
//         e.name.toUpperCase().indexOf('.GLIFFY') >= 0 ? (
//           GlobalData.optManager.ShowLoading(!0),
//           SDUI.Commands.MainController.GliffyImporter.ImportFromFile(e, (function (e, t) {
//             GlobalData.optManager.ShowLoading(!1)
//           }))
//         ) : !0 === SDUI.AppSettings.UseLocalSDRStorage ? SDUI.Commands.MainController.PagedSDRController.LoadInMemorySDR(e, 'Document 1.sdr') : SDF.ReadFile(e, t)
//       } catch (e) {
//         GlobalData.optManager.ShowLoading(!1),
//           GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Export = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           SDF.WriteFile(!0, !0)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Find = function () {
//       try {
//         ConstantData.DocumentContext.CurrentRibbon !== Resources.Controls.Ribbons.Page.Id &&
//           SDUI.Commands.MainController.SwitchRibbons(Resources.Controls.Ribbons.Page.Id),
//           GlobalData.optManager.FindNext(
//             ConstantData.DocumentContext.FindTarget,
//             null,
//             ConstantData.DocumentContext.MatchCase,
//             ConstantData.DocumentContext.MatchWord
//           )
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Replace = function () {
//       try {
//         ConstantData.DocumentContext.CurrentRibbon !== Resources.Controls.Ribbons.Page.Id &&
//           SDUI.Commands.MainController.SwitchRibbons(Resources.Controls.Ribbons.Page.Id),
//           GlobalData.optManager.FindNext(
//             ConstantData.DocumentContext.FindTarget,
//             ConstantData.DocumentContext.ReplaceTarget,
//             ConstantData.DocumentContext.MatchCase,
//             ConstantData.DocumentContext.MatchWord
//           )
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ReplaceAll = function () {
//       try {
//         ConstantData.DocumentContext.CurrentRibbon !== Resources.Controls.Ribbons.Page.Id &&
//           SDUI.Commands.MainController.SwitchRibbons(Resources.Controls.Ribbons.Page.Id),
//           GlobalData.optManager.ReplaceAll(
//             ConstantData.DocumentContext.FindTarget,
//             ConstantData.DocumentContext.ReplaceTarget,
//             ConstantData.DocumentContext.MatchCase,
//             ConstantData.DocumentContext.MatchWord
//           )
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e),
//           GlobalData.optManager.NoUndo = !1
//       }
//     },
//     this.SetBackgroundColor = function (e) {
//       try {
//         var t;
//         GlobalData.optManager.CloseEdit(!0, !0),
//           Collab.AllowMessage() &&
//           Collab.BeginSecondaryEdit();
//         var a = (
//           t = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0)
//         ).background.Paint.Color;
//         t.background.Paint.FillType === ConstantData.FillTypes.SDFILL_TRANSPARENT &&
//           (a = ConstantData.Colors.Color_White);
//         var r = e;
//         if (
//           e == ConstantData.Colors.Color_Trans &&
//           (r = ConstantData.Colors.Color_White),
//           GlobalData.optManager.ChangeBackgroundTextColor(r, a),
//           e == ConstantData.Colors.Color_Trans ? (
//             t.background.Paint.FillType = ConstantData.FillTypes.SDFILL_TRANSPARENT,
//             t.background.Paint.Color = ConstantData.Colors.Color_White
//           ) : (
//             t.background.Paint.FillType = ConstantData.FillTypes.SDFILL_SOLID,
//             t.background.Paint.Color = e
//           ),
//           t.background.Paint.Opacity = 1,
//           GlobalData.optManager.SetBackgroundColor(),
//           Collab.AllowMessage()
//         ) {
//           var i = {
//             color: e
//           };
//           Collab.BuildMessage(ConstantData.CollabMessages.SetBackgroundColor, i, !1)
//         }
//         GlobalData.optManager.CompleteOperation()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ResetBackgroundGradient = function () {
//       try {
//         var e;
//         GlobalData.optManager.CloseEdit(!0, !0),
//           Collab.AllowMessage() &&
//           Collab.BeginSecondaryEdit();
//         var t = (
//           e = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0)
//         ).background.Paint.Color;
//         if (
//           t == ConstantData.Colors.Color_Trans ? (
//             e.background.Paint.FillType = ConstantData.FillTypes.SDFILL_TRANSPARENT,
//             e.background.Paint.Color = ConstantData.Colors.Color_White
//           ) : (
//             e.background.Paint.FillType = ConstantData.FillTypes.SDFILL_SOLID,
//             e.background.Paint.Color = t
//           ),
//           e.background.Paint.Opacity = 1,
//           GlobalData.optManager.SetBackgroundColor(),
//           Collab.AllowMessage()
//         ) {
//           Collab.BuildMessage(
//             ConstantData.CollabMessages.ResetBackgroundGradient,
//             {
//             },
//             !1
//           )
//         }
//         GlobalData.optManager.CompleteOperation()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SetBackgroundGradient = function (e, t, a) {
//       var r;
//       try {
//         if (
//           GlobalData.optManager.CloseEdit(!0, !0),
//           Collab.AllowMessage() &&
//           Collab.BeginSecondaryEdit(),
//           (
//             r = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0)
//           ).background.Paint.FillType = ConstantData.FillTypes.SDFILL_GRADIENT,
//           r.background.Paint.Color = e,
//           r.background.Paint.EndColor = t,
//           r.background.Paint.GradientFlags = a,
//           r.background.Paint.Opacity = 1,
//           r.background.Paint.EndOpacity = 1,
//           GlobalData.optManager.SetBackgroundColor(),
//           Collab.AllowMessage()
//         ) {
//           var i = {
//             color: e,
//             endColor: t,
//             gradientFlags: a
//           };
//           Collab.BuildMessage(ConstantData.CollabMessages.SetBackgroundGradient, i, !1)
//         }
//         GlobalData.optManager.CompleteOperation()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SetBackgroundTexture = function (e, t) {
//       var a;
//       try {
//         GlobalData.optManager.CloseEdit(!0, !0),
//           Collab.AllowMessage() &&
//           Collab.BeginSecondaryEdit();
//         var r = Utils1.DeepCopy(GlobalData.optManager.TextureList.Textures[e].TextureScale);
//         if (
//           t &&
//           (
//             void 0 !== t.AlignmentScalar &&
//             (r.AlignmentScalar = t.AlignmentScalar),
//             void 0 !== t.Scale &&
//             (r.Scale = t.Scale),
//             void 0 !== t.RWidth &&
//             (r.RWidth = t.RWidth),
//             void 0 !== t.Units &&
//             (r.Units = t.Units)
//           ),
//           (
//             a = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0)
//           ).background.Paint.FillType = ConstantData.FillTypes.SDFILL_TEXTURE,
//           a.background.Paint.Texture = e,
//           a.background.Paint.TextureScale = r,
//           GlobalData.optManager.SetBackgroundColor(),
//           Collab.AllowMessage()
//         ) {
//           var i = {
//             textureIndex: e,
//             textureScale: t
//           };
//           Collab.BuildMessage(ConstantData.CollabMessages.SetBackgroundTexture, i, !1)
//         }
//         GlobalData.optManager.CompleteOperation()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SetBackgroundImage = function (e, t) {
//       try {
//         GlobalData.optManager.CloseEdit(!0, !0),
//           t ? GlobalData.optManager.ImportBackgroundLayerImage(e) : GlobalData.optManager.SetBackgroundImage(e, 0)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ClearImage = function () {
//       try {
//         if (
//           GlobalData.optManager.CloseEdit(!0),
//           GlobalData.optManager.ClearImage(GlobalData.optManager.RightClickParams.TargetID, !0, !1, !0, null)
//         ) {
//           if (Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var e = {
//               BlockID: GlobalData.optManager.RightClickParams.TargetID
//             },
//               t = Collab.BuildMessage(ConstantData.CollabMessages.ClearImage, e, !1, !0)
//           }
//           GlobalData.optManager.ClearImage(GlobalData.optManager.RightClickParams.TargetID, !0, !1, !1, t)
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Lock = function (e) {
//       try {
//         var t;
//         t = e ? GlobalData.optManager.RightClickParams.TargetID : GlobalData.optManager.GetTargetSelect(),
//           GlobalData.optManager.CloseEdit(!0),
//           GlobalData.optManager.Lock(t)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },


//     this.HandleKeyPress = function (e, t) {
//       try {
//         return GlobalData.optManager.HandleKeyPress(e, t)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },

//     this.PolyLineSetSegmentType = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(!1, GlobalData.optManager.RightClickParams.TargetID),
//           GlobalData.optManager.PolyLSetSegmentType(
//             GlobalData.optManager.RightClickParams.TargetID,
//             GlobalData.optManager.RightClickParams.segment,
//             e
//           )
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Wall_EditCorners = function () {
//       try {
//         GlobalData.optManager.CloseEdit(!1, GlobalData.optManager.RightClickParams.TargetID),
//           GlobalData.optManager.Wall_EditCorners(GlobalData.optManager.RightClickParams.TargetID)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.PolyLineSplit = function () {
//       try {
//         GlobalData.optManager.CloseEdit(!1, GlobalData.optManager.RightClickParams.TargetID),
//           GlobalData.optManager.PolyLSplit(
//             GlobalData.optManager.RightClickParams.TargetID,
//             GlobalData.optManager.RightClickParams.segment
//           )
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.PolyLineRemoveNodes = function () {
//       try {
//         GlobalData.optManager.CloseEdit(!1, GlobalData.optManager.RightClickParams.TargetID),
//           GlobalData.optManager.PolyLRemoveNodes(
//             GlobalData.optManager.RightClickParams.TargetID,
//             GlobalData.optManager.RightClickParams.segment
//           )
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.PolyLineAddNode = function () {
//       try {
//         GlobalData.optManager.CloseEdit(!1, GlobalData.optManager.RightClickParams.TargetID),
//           GlobalData.optManager.PolyLAddNode(
//             GlobalData.optManager.RightClickParams.TargetID,
//             GlobalData.optManager.RightClickParams.segment,
//             GlobalData.optManager.RightClickParams.HitPt,
//             !0
//           )
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.EditShapeOutline = function () {
//       try {
//         GlobalData.optManager.EditShapeOutline()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeToSymbol = function () {
//       try {
//         SymbolID = SDUI.Commands.MainController.Symbols.GetSelectedButton(),
//           SymbolID &&
//           SDUI.Commands.MainController.Shapes.SD_PreLoad_Symbol(SymbolID, null, GlobalData.optManager.ChangeToSymbol, !0)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeFont = function (e) {
//       try {
//         GlobalData.optManager.ChangeFont(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeFontSize = function (e) {
//       try {
//         GlobalData.optManager.ChangeFontSize(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeFontStyle = function (e) {
//       try {
//         GlobalData.optManager.ChangeFontStyle(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeTextAlign = function (e) {
//       try {
//         GlobalData.optManager.ChangeTextAlign(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeTextBullet = function (e) {
//       try {
//         GlobalData.optManager.ChangeTextBullet(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeTextSpacing = function (e) {
//       try {
//         GlobalData.optManager.ChangeTextSpacing(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeTextDirection = function (e) {
//       try {
//         var t = 'along' == e;
//         t !== ConstantData.DocumentContext.CurrentTextDirection &&
//           GlobalData.optManager.ChangeTextDirection(t)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeFontColor = function (e, t) {
//       try {
//         var a;
//         'recent' == e ||
//           'standard' == e ||
//           'custom' == e ? (Resources.CurrentTheme, a = t) : 'theme' == e &&
//         (a = Resources.CurrentTheme.Colors[t]),
//           a &&
//           GlobalData.optManager.ChangeFontColor(a)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeFontOpacity = function (e) {
//       try {
//         var t = e / 100;
//         GlobalData.optManager.ChangeFontOpacity(t)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },

//     this.CancelDragOperation = function () {
//       GlobalData.optManager.StampTimeout &&
//         (
//           window.clearTimeout(GlobalData.optManager.StampTimeout),
//           GlobalData.optManager.StampTimeout = null
//         ),
//         GlobalData.optManager.UnbindDragDropOrStamp(),
//         a = !1
//     },



//     this.ChangeLineType = function (e, t, a, r) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.ChangeLineType(e, t, a, r)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeShape = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.ChangeShape(parseInt(e, 10))
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.InsertShape = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalDatagBusinessController.InsertShape(parseInt(e, 10), GlobalData.optManager.LineDrawID)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.InsertFrameContainer = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.InsertFrameContainer(GlobalData.optManager.RightClickParams.TargetID, !1, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.InsertGraph = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.InsertGraph(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.EditGraph = function () {
//       try {
//         GlobalData.optManager.EditGraph()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.InsertGauge = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.InsertGauge(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.EditGauge = function () {
//       try {
//         GlobalData.optManager.EditGauge()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.CacheWidthChange = function (e) {
//       GlobalData.optManager.cachedWidth = e
//     },
//     this.CacheHeightChange = function (e) {
//       GlobalData.optManager.cachedHeight = e
//     },
//     this.ChangeWidth = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.ChangeWidth(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ChangeHeight = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.ChangeHeight(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SetLeft = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.SetTopLeft(e, !0)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SetTop = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.SetTopLeft(e, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.EditCoordinates = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit();
//         Resources.Controls.WorkArea.LeftValue.GetControl();
//         var t = Resources.Controls.WorkArea.LeftEdit.GetControl(),
//           a = (
//             Resources.Controls.WorkArea.TopValue.GetControl(),
//             Resources.Controls.WorkArea.TopEdit.GetControl()
//           ),
//           r = (
//             Resources.Controls.WorkArea.HeightValue.GetControl(),
//             Resources.Controls.WorkArea.HeightEdit.GetControl()
//           ),
//           i = (
//             Resources.Controls.WorkArea.WidthValue.GetControl(),
//             Resources.Controls.WorkArea.WidthEdit.GetControl()
//           );
//         switch (e) {
//           case 'left':
//             t.focus(),
//               t.select();
//             break;
//           case 'top':
//             a.focus(),
//               a.select();
//             break;
//           case 'height':
//             r.focus(),
//               r.select();
//             break;
//           case 'width':
//             i.focus(),
//               i.select()
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.FreezeProperties = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.FreezeProperties()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },

//     this.SpaceEvenly = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.SpaceEvenly(parseInt(e, 10))
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SD_ChartsNew = function (e) {
//       var t = 0,
//         a = 0;
//       switch (e) {
//         case Resources.Controls.DD_ChartsNew.Bar.Id:
//           t = ListManager.Graph.GraphType.SDGRAPH_TYPE_BAR;
//           break;
//         case Resources.Controls.DD_ChartsNew.Pie.Id:
//           t = ListManager.Graph.GraphType.SDGRAPH_TYPE_PIE;
//           break;
//         case Resources.Controls.DD_ChartsNew.StackedBar.Id:
//           t = ListManager.Graph.GraphType.SDGRAPH_TYPE_STACKEDBAR;
//           break;
//         case Resources.Controls.DD_ChartsNew.Line.Id:
//           t = ListManager.Graph.GraphType.SDGRAPH_TYPE_LINE;
//           break;
//         case Resources.Controls.DD_ChartsNew.RelativeValue.Id:
//           t = ListManager.Graph.GraphType.SDGRAPH_TYPE_LINEARPIE;
//           break;
//         case Resources.Controls.DD_ChartsNew.Area.Id:
//           t = ListManager.Graph.GraphType.SDGRAPH_TYPE_STACKEDLINE,
//             a = ListManager.Graph.GraphSubType.SDGRAPH_SUBTYPE_AREA;
//           break;
//         case Resources.Controls.DD_ChartsNew.LayeredArea.Id:
//         case Resources.Controls.DD_ChartsNew.ThreeD.Id:
//           t = ListManager.Graph.GraphType.SDGRAPH_TYPE_LINE,
//             a = ListManager.Graph.GraphSubType.SDGRAPH_SUBTYPE_AREA
//       }
//       GlobalData.optManager.GraphAddNew(t, a),
//         GlobalData.optManager.RenderDirtySVGObjects()
//     },
//     this.Graph_SetDataLabel = function (e) {
//       var t = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (t >= 0) {
//         var a = GlobalData.optManager.GetObjectPtr(t, !0),
//           r = a.GetGraph(!0);
//         if (r) {
//           switch (e) {
//             case Resources.Controls.DD_ChartsData.HideDataLabels.Id:
//               r.pointflags = Utils2.SetFlag(
//                 r.pointflags,
//                 ListManager.Graph.PointFlags.SDAX_VALUELABELS,
//                 !1
//               );
//               break;
//             case Resources.Controls.DD_ChartsData.OutsideLabels.Id:
//               r.pointflags = Utils2.SetFlag(
//                 r.pointflags,
//                 ListManager.Graph.PointFlags.SDAX_VALUELABELS,
//                 !0
//               ),
//                 r.pointflags = Utils2.SetFlag(
//                   r.pointflags,
//                   ListManager.Graph.PointFlags.SDAX_VALUELABELS_EXTERNAL,
//                   !0
//                 ),
//                 r.pointflags = Utils2.SetFlag(
//                   r.pointflags,
//                   ListManager.Graph.PointFlags.SDAX_VALUELABELS_EXTERNAL_LEADERS,
//                   !1
//                 ),
//                 r.pointflags = Utils2.SetFlag(
//                   r.pointflags,
//                   ListManager.Graph.PointFlags.SDAX_VALUELABELS_ANGLED,
//                   !1
//                 );
//               break;
//             case Resources.Controls.DD_ChartsData.OutsideAngle.Id:
//               r.pointflags = Utils2.SetFlag(
//                 r.pointflags,
//                 ListManager.Graph.PointFlags.SDAX_VALUELABELS,
//                 !0
//               ),
//                 r.pointflags = Utils2.SetFlag(
//                   r.pointflags,
//                   ListManager.Graph.PointFlags.SDAX_VALUELABELS_EXTERNAL,
//                   !0
//                 ),
//                 r.pointflags = Utils2.SetFlag(
//                   r.pointflags,
//                   ListManager.Graph.PointFlags.SDAX_VALUELABELS_EXTERNAL_LEADERS,
//                   !1
//                 ),
//                 r.pointflags = Utils2.SetFlag(
//                   r.pointflags,
//                   ListManager.Graph.PointFlags.SDAX_VALUELABELS_ANGLED,
//                   !0
//                 );
//               break;
//             case Resources.Controls.DD_ChartsData.OutsideAngledLeader.Id:
//               r.pointflags = Utils2.SetFlag(
//                 r.pointflags,
//                 ListManager.Graph.PointFlags.SDAX_VALUELABELS,
//                 !0
//               ),
//                 r.pointflags = Utils2.SetFlag(
//                   r.pointflags,
//                   ListManager.Graph.PointFlags.SDAX_VALUELABELS_EXTERNAL,
//                   !1
//                 ),
//                 r.pointflags = Utils2.SetFlag(
//                   r.pointflags,
//                   ListManager.Graph.PointFlags.SDAX_VALUELABELS_EXTERNAL_LEADERS,
//                   !0
//                 ),
//                 r.pointflags = Utils2.SetFlag(
//                   r.pointflags,
//                   ListManager.Graph.PointFlags.SDAX_VALUELABELS_ANGLED,
//                   !0
//                 )
//           }
//         }
//       }
//       GlobalData.optManager.GraphFormat(a, r, a.Frame, !0),
//         GlobalData.optManager.AddToDirtyList(t),
//         GlobalData.optManager.RenderDirtySVGObjects(),
//         GlobalData.optManager.GraphSetDefaultsFromGraph(r)
//     },
//     this.Graph_SetAxisOptions = function (e, t) {
//       var a = !1,
//         r = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (r >= 0) {
//         var i = GlobalData.optManager.GetObjectPtr(r, !0),
//           n = i.GetGraph(!0);
//         if (n) switch (t) {
//           case Resources.Controls.DD_HorizontalAxis.ShowHorizontalAxisLabels.Id:
//           case Resources.Controls.DD_VerticalAxis.ShowHorizontalAxisLabels.Id:
//             n.axes[e].flags = Utils2.SetFlag(
//               n.axes[e].flags,
//               ListManager.Graph.AxisFlags.SDAX_HIDE_LABELS,
//               !1
//             );
//             break;
//           case Resources.Controls.DD_HorizontalAxis.NoHorizontalAxisLabels.Id:
//           case Resources.Controls.DD_VerticalAxis.NoHorizontalAxisLabels.Id:
//             n.axes[e].flags = Utils2.SetFlag(
//               n.axes[e].flags,
//               ListManager.Graph.AxisFlags.SDAX_HIDE_LABELS,
//               !0
//             );
//             break;
//           case Resources.Controls.DD_HorizontalAxis.AngleHorizontalAxisLabels.Id:
//           case Resources.Controls.DD_VerticalAxis.AngleVerticalAxisLabels.Id:
//             n.axes[e].flags = Utils2.SetFlag(
//               n.axes[e].flags,
//               ListManager.Graph.AxisFlags.SDAX_HIDE_LABELS,
//               !1
//             ),
//               a = n.axes[e].flags & ListManager.Graph.AxisFlags.SDAX_LABELS_ANGLED,
//               n.axes[e].flags = Utils2.SetFlag(
//                 n.axes[e].flags,
//                 ListManager.Graph.AxisFlags.SDAX_LABELS_ANGLED,
//                 !a
//               );
//             break;
//           case Resources.Controls.DD_HorizontalAxis.ShowMinorTickMarks.Id:
//           case Resources.Controls.DD_VerticalAxis.ShowMinorTickMarks.Id:
//             n.axes[e].flags = Utils2.SetFlag(
//               n.axes[e].flags,
//               ListManager.Graph.AxisFlags.SDAX_HIDE_LABELS,
//               !1
//             ),
//               a = n.axes[e].flags & ListManager.Graph.AxisFlags.SDAX_HIDE_MINOR_TICKS,
//               n.axes[e].flags = Utils2.SetFlag(
//                 n.axes[e].flags,
//                 ListManager.Graph.AxisFlags.SDAX_HIDE_MINOR_TICKS,
//                 !a
//               );
//             break;
//           case Resources.Controls.DD_HorizontalAxis.ShowMajorTickMarks.Id:
//           case Resources.Controls.DD_VerticalAxis.ShowMajorTickMarks.Id:
//             n.axes[e].flags = Utils2.SetFlag(
//               n.axes[e].flags,
//               ListManager.Graph.AxisFlags.SDAX_HIDE_LABELS,
//               !1
//             ),
//               a = n.axes[e].flags & ListManager.Graph.AxisFlags.SDAX_HIDE_MAJOR_TICKS,
//               n.axes[e].flags = Utils2.SetFlag(
//                 n.axes[e].flags,
//                 ListManager.Graph.AxisFlags.SDAX_HIDE_MAJOR_TICKS,
//                 !a
//               );
//             break;
//           case Resources.Controls.DD_HorizontalAxis.ShowHorizontalAxisTitle.Id:
//           case Resources.Controls.DD_VerticalAxis.ShowHorizontalAxisTitle.Id:
//             n.axes[e].flags = Utils2.SetFlag(
//               n.axes[e].flags,
//               ListManager.Graph.AxisFlags.SDAX_HIDE_LABELS,
//               !1
//             ),
//               a = !(
//                 n.axes[e].flags & ListManager.Graph.AxisFlags.SDAX_HIDE_TITLE
//               ),
//               n.axes[e].flags = Utils2.SetFlag(
//                 n.axes[e].flags,
//                 ListManager.Graph.AxisFlags.SDAX_HIDE_TITLE,
//                 !a
//               )
//         }
//       }
//       GlobalData.optManager.GraphFormat(i, n, i.Frame, !0),
//         GlobalData.optManager.AddToDirtyList(r),
//         GlobalData.optManager.RenderDirtySVGObjects(),
//         GlobalData.optManager.GraphSetDefaultsFromGraph(n)
//     },
//     this.Graph_SetGrid = function (e) {
//       var t = 0,
//         a = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (a >= 0) {
//         var r = GlobalData.optManager.GetObjectPtr(a, !0),
//           i = r.GetGraph(!0);
//         switch (e) {
//           case Resources.Controls.DD_ChartsGrid.HorizontalNone.Id:
//           case Resources.Controls.DD_ChartsGrid.HorizontalMinorGridlines.Id:
//           case Resources.Controls.DD_ChartsGrid.HorizontalMajorGridlines.Id:
//           case Resources.Controls.DD_ChartsGrid.HorizontalMajorandMinorGridlines.Id:
//             t = ListManager.Graph.Defines.SDAX_VERT;
//             break;
//           case Resources.Controls.DD_ChartsGrid.VerticalNone.Id:
//           case Resources.Controls.DD_ChartsGrid.VerticalMinorGridlines.Id:
//           case Resources.Controls.DD_ChartsGrid.VerticalMajorGridlines.Id:
//           case Resources.Controls.DD_ChartsGrid.VerticalMajorandMinorGridlines.Id:
//             t = ListManager.Graph.Defines.SDAX_HORIZ
//         }
//         if (i) switch (e) {
//           case Resources.Controls.DD_ChartsGrid.HorizontalNone.Id:
//           case Resources.Controls.DD_ChartsGrid.VerticalNone.Id:
//             i.axes[t].flags = Utils2.SetFlag(
//               i.axes[t].flags,
//               ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MINOR,
//               !1
//             ),
//               i.axes[t].flags = Utils2.SetFlag(
//                 i.axes[t].flags,
//                 ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MAJOR,
//                 !1
//               );
//             break;
//           case Resources.Controls.DD_ChartsGrid.HorizontalMinorGridlines.Id:
//           case Resources.Controls.DD_ChartsGrid.VerticalMinorGridlines.Id:
//             i.axes[t].flags = Utils2.SetFlag(
//               i.axes[t].flags,
//               ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MINOR,
//               !0
//             ),
//               i.axes[t].flags = Utils2.SetFlag(
//                 i.axes[t].flags,
//                 ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MAJOR,
//                 !1
//               );
//             break;
//           case Resources.Controls.DD_ChartsGrid.HorizontalMajorGridlines.Id:
//           case Resources.Controls.DD_ChartsGrid.VerticalMajorGridlines.Id:
//             i.axes[t].flags = Utils2.SetFlag(
//               i.axes[t].flags,
//               ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MINOR,
//               !1
//             ),
//               i.axes[t].flags = Utils2.SetFlag(
//                 i.axes[t].flags,
//                 ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MAJOR,
//                 !0
//               );
//             break;
//           case Resources.Controls.DD_ChartsGrid.HorizontalMajorandMinorGridlines.Id:
//           case Resources.Controls.DD_ChartsGrid.VerticalMajorandMinorGridlines.Id:
//             i.axes[t].flags = Utils2.SetFlag(
//               i.axes[t].flags,
//               ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MINOR,
//               !0
//             ),
//               i.axes[t].flags = Utils2.SetFlag(
//                 i.axes[t].flags,
//                 ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MAJOR,
//                 !0
//               )
//         }
//       }
//       GlobalData.optManager.GraphFormat(r, i, r.Frame, !0),
//         GlobalData.optManager.AddToDirtyList(a),
//         GlobalData.optManager.RenderDirtySVGObjects(),
//         GlobalData.optManager.GraphSetDefaultsFromGraph(i)
//     },
//     this.SD_ChartAxes = function (e) {
//       var t = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (t >= 0) {
//         var a = GlobalData.optManager.GetObjectPtr(t, !0),
//           r = a.GetGraph(!0);
//         if (r) switch (e) {
//           case Resources.Controls.DD_ChartAxes.ShowNone:
//             r.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags = Utils2.SetFlag(
//               r.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags,
//               ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE,
//               !0
//             ),
//               r.axes[ListManager.Graph.Defines.SDAX_VERT].flags = Utils2.SetFlag(
//                 r.axes[ListManager.Graph.Defines.SDAX_VERT].flags,
//                 ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE,
//                 !0
//               );
//             break;
//           case Resources.Controls.DD_ChartAxes.ShowBoth:
//             r.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags = Utils2.SetFlag(
//               r.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags,
//               ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE,
//               !1
//             ),
//               r.axes[ListManager.Graph.Defines.SDAX_VERT].flags = Utils2.SetFlag(
//                 r.axes[ListManager.Graph.Defines.SDAX_VERT].flags,
//                 ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE,
//                 !1
//               );
//             break;
//           case Resources.Controls.DD_ChartAxes.ShowHorizontal:
//             r.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags = Utils2.SetFlag(
//               r.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags,
//               ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE,
//               !1
//             ),
//               r.axes[ListManager.Graph.Defines.SDAX_VERT].flags = Utils2.SetFlag(
//                 r.axes[ListManager.Graph.Defines.SDAX_VERT].flags,
//                 ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE,
//                 !0
//               );
//             break;
//           case Resources.Controls.DD_ChartAxes.ShowVertical:
//             r.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags = Utils2.SetFlag(
//               r.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags,
//               ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE,
//               !0
//             ),
//               r.axes[ListManager.Graph.Defines.SDAX_VERT].flags = Utils2.SetFlag(
//                 r.axes[ListManager.Graph.Defines.SDAX_VERT].flags,
//                 ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE,
//                 !1
//               )
//         }
//       }
//       GlobalData.optManager.GraphFormat(a, r, a.Frame, !0),
//         GlobalData.optManager.AddToDirtyList(t),
//         GlobalData.optManager.RenderDirtySVGObjects(),
//         GlobalData.optManager.GraphSetDefaultsFromGraph(r)
//     },
//     this.SD_ChartRotate = function (e) {
//       var t = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (t >= 0) {
//         var a = GlobalData.optManager.GetObjectPtr(t, !0),
//           r = a.GetGraph(!0);
//         if (r) switch (e) {
//           case Resources.Controls.DD_ChartRotate.Quadrant1.Id:
//             GlobalData.optManager.GraphSetQuadrant(a, r, 0),
//               r.quadrant = 0;
//             break;
//           case Resources.Controls.DD_ChartRotate.Quadrant2.Id:
//             GlobalData.optManager.GraphSetQuadrant(a, r, 1);
//             break;
//           case Resources.Controls.DD_ChartRotate.Quadrant3.Id:
//             GlobalData.optManager.GraphSetQuadrant(a, r, 2);
//             break;
//           case Resources.Controls.DD_ChartRotate.Quadrant4.Id:
//             GlobalData.optManager.GraphSetQuadrant(a, r, 3)
//         }
//       }
//       GlobalData.optManager.GraphFormat(a, r, a.Frame, !0),
//         GlobalData.optManager.AddToDirtyList(t),
//         GlobalData.optManager.RenderDirtySVGObjects(),
//         GlobalData.optManager.GraphSetDefaultsFromGraph(r)
//     },
//     this.SD_QuickLayout = function (e) {
//       var t = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (t >= 0) {
//         var a = GlobalData.optManager.GetObjectPtr(t, !0),
//           r = a.GetGraph(!0);
//         if (r) {
//           var i = 'dd-chartsQuickLayout-layout';
//           if (0 != e.indexOf(i)) return;
//           var n = parseInt(e.substr(27));
//           if (isNaN(n)) return;
//           GlobalData.optManager.GraphSetGalleryOptions(a, r, n)
//         }
//       }
//       GlobalData.optManager.GraphFormat(a, r, a.Frame, !0),
//         GlobalData.optManager.AddToDirtyList(t),
//         GlobalData.optManager.RenderDirtySVGObjects(),
//         GlobalData.optManager.GraphSetDefaultsFromGraph(r)
//     },
//     this.SD_ChartType = function (e) {
//       var t = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (t >= 0) {
//         var a = GlobalData.optManager.GetObjectPtr(t, !0),
//           r = a.GetGraph(!0);
//         if (r) {
//           switch (e) {
//             case Resources.Controls.DD_ChartType.Bar.Id:
//               GlobalData.optManager.SetToDefaultBarChart(a, r);
//               break;
//             case Resources.Controls.DD_ChartType.Pie.Id:
//               GlobalData.optManager.SetToDefaultPieChart(a, r);
//               break;
//             case Resources.Controls.DD_ChartType.StackedBar.Id:
//               GlobalData.optManager.SetToDefaultStackedBarChart(a, r);
//               break;
//             case Resources.Controls.DD_ChartType.Line.Id:
//               GlobalData.optManager.SetToDefaultLineChart(a, r);
//               break;
//             case Resources.Controls.DD_ChartType.RelativeValue.Id:
//               GlobalData.optManager.SetToDefaultRelativeValueChart(a, r);
//               break;
//             case Resources.Controls.DD_ChartType.Area.Id:
//               GlobalData.optManager.SetToDefaultAreaChart(a, r);
//               break;
//             case Resources.Controls.DD_ChartType.LayeredArea.Id:
//               GlobalData.optManager.SetToDefaultLayeredAreaChart(a, r)
//           }
//           GlobalData.optManager.GraphFormat(a, r, a.Frame, !0),
//             GlobalData.optManager.AddToDirtyList(t),
//             GlobalData.optManager.RenderDirtySVGObjects()
//         }
//       }
//     },
//     this.SD_PieData = function (e) {
//       var t = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (t >= 0) {
//         var a = GlobalData.optManager.GetObjectPtr(t, !0),
//           r = a.GetGraph(!0);
//         if (r) {
//           var i = 'dd-pieData-category';
//           if (0 != e.indexOf(i)) return;
//           var n = parseInt(e.substr(19)) - 1;
//           if (isNaN(n)) return;
//           GlobalData.optManager.GraphSetPieTarget(a, r, n)
//         }
//       }
//       GlobalData.optManager.GraphFormat(a, r, a.Frame, !0),
//         GlobalData.optManager.AddToDirtyList(t),
//         GlobalData.optManager.RenderDirtySVGObjects(),
//         GlobalData.optManager.GraphSetDefaultsFromGraph(r)
//     },
//     this.SD_SwapCategories = function () {
//       var e = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (e >= 0) {
//         var t = GlobalData.optManager.GetObjectPtr(e, !0),
//           a = t.GetGraph(!0);
//         a &&
//           GlobalData.optManager.GraphSwapSeriesAndCategories(t, a)
//       }
//       GlobalData.optManager.GraphFormat(t, a, t.Frame, !0),
//         GlobalData.optManager.AddToDirtyList(e),
//         GlobalData.optManager.RenderDirtySVGObjects(),
//         GlobalData.optManager.GraphSetDefaultsFromGraph(a)
//     },
//     this.SD_AddCategory = function () {
//       var e = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (e >= 0) {
//         var t = GlobalData.optManager.GetObjectPtr(e, !0),
//           a = t.GetGraph(!0);
//         a &&
//           GlobalData.optManager.GraphAddCategoryCmd(t, a)
//       }
//       GlobalData.optManager.GraphFormat(t, a, t.Frame, !0),
//         GlobalData.optManager.AddToDirtyList(e),
//         GlobalData.optManager.RenderDirtySVGObjects(),
//         GlobalData.optManager.GraphSetDefaultsFromGraph(a)
//     },
//     this.SD_AddSeries = function () {
//       var e = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (e >= 0) {
//         var t = GlobalData.optManager.GetObjectPtr(e, !0),
//           a = t.GetGraph(!0);
//         a &&
//           GlobalData.optManager.GraphAddSeriesCmd(t, a)
//       }
//       GlobalData.optManager.GraphFormat(t, a, t.Frame, !0),
//         GlobalData.optManager.AddToDirtyList(e),
//         GlobalData.optManager.RenderDirtySVGObjects(),
//         GlobalData.optManager.GraphSetDefaultsFromGraph(a)
//     },
//     this.Table_Join = function () {
//       try {
//         if (GlobalData.optManager.Table_JoinCells(!0)) {
//           if (Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var e = Collab.BuildMessage(ConstantData.CollabMessages.Table_JoinCells, {
//             }, !0, !0)
//           }
//           GlobalData.optManager.Table_JoinCells(!1, !0) &&
//             (
//               Collab.AllowMessage() &&
//               Collab.SendMessage(e),
//               GlobalData.optManager.CompleteOperation(null)
//             )
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_Split = function () {
//       try {
//         if (GlobalData.optManager.Table_SplitCells(!0)) {
//           if (Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var e = Collab.BuildMessage(ConstantData.CollabMessages.Table_SplitCells, {
//             }, !0, !0)
//           }
//           GlobalData.optManager.Table_SplitCells(!1, !0) &&
//             (
//               Collab.AllowMessage() &&
//               Collab.SendMessage(e),
//               GlobalData.optManager.CompleteOperation(null)
//             )
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_InsertRows = function (e) {
//       try {
//         if (GlobalData.optManager.Table_InsertRows(e, null, !1, !0)) {
//           if (Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var t = {
//               above: e,
//               addrowheader: !1
//             },
//               a = Collab.BuildMessage(ConstantData.CollabMessages.Table_InsertRows, t, !0, !0)
//           }
//           GlobalData.optManager.Table_InsertRows(e, null, !1, !1, !0),
//             Collab.AllowMessage() &&
//             Collab.SendMessage(a),
//             GlobalData.optManager.CompleteOperation(null)
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_InsertDeleteGroupRows = function (e, t) {
//       try {
//         var a,
//           r = !1;
//         if (
//           GlobalData.optManager.RightClickParams &&
//             GlobalData.optManager.RightClickParams.TargetID >= 0 ? (
//             a = GlobalData.optManager.RightClickParams.TargetID,
//             GlobalData.optManager.RightClickParams.TargetID = - 1
//           ) : a = GlobalData.optManager.GetTargetSelect(),
//           a >= 0
//         ) {
//           var i = gContainerManager.AllowTableOperation(a);
//           r = t ? i.insertrow : i.deleterow,
//             null != i.BlockID &&
//             (a = i.BlockID)
//         }
//         if (r && GlobalData.optManager.Table_InsertDeleteGroupRows(e, a, t, !0)) {
//           if (Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var n = {
//               above: e,
//               insert: t,
//               BlockID: a
//             },
//               o = Collab.BuildMessage(
//                 ConstantData.CollabMessages.Table_InsertDeleteGroupRows,
//                 n,
//                 !0,
//                 !0
//               )
//           }
//           GlobalData.optManager.Table_InsertDeleteGroupRows(e, a, t, !1, !0),
//             Collab.AllowMessage() &&
//             (
//               Collab.IsSecondary() &&
//               Collab.CreateList.length &&
//               (
//                 o.Data.CreateList = [],
//                 o.Data.CreateList = o.Data.CreateList.concat(Collab.CreateList)
//               ),
//               Collab.SendMessage(o)
//             ),
//             GlobalData.optManager.CompleteOperation()
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_InsertDeleteGroupCols = function (e, t) {
//       try {
//         var a,
//           r = !1;
//         if (
//           GlobalData.optManager.RightClickParams &&
//             GlobalData.optManager.RightClickParams.TargetID >= 0 ? (
//             a = GlobalData.optManager.RightClickParams.TargetID,
//             GlobalData.optManager.RightClickParams.TargetID = - 1
//           ) : a = GlobalData.optManager.GetTargetSelect(),
//           a >= 0
//         ) {
//           var i = gContainerManager.AllowTableOperation(a);
//           r = t ? i.insertcol : i.deletecol,
//             null != i.BlockID &&
//             (a = i.BlockID)
//         }
//         if (r && GlobalData.optManager.Table_InsertDeleteGroupCols(e, a, t, !0)) {
//           if (GlobalData.optManager.CloseEdit(!0), Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var n = {
//               left: e,
//               insert: t,
//               BlockID: a
//             },
//               o = Collab.BuildMessage(
//                 ConstantData.CollabMessages.Table_InsertDeleteGroupCols,
//                 n,
//                 !0,
//                 !0
//               )
//           }
//           GlobalData.optManager.Table_InsertDeleteGroupCols(e, a, t, !1, !0),
//             Collab.AllowMessage() &&
//             (
//               Collab.IsSecondary() &&
//               Collab.CreateList.length &&
//               (
//                 o.Data.CreateList = [],
//                 o.Data.CreateList = o.Data.CreateList.concat(Collab.CreateList)
//               ),
//               Collab.SendMessage(o)
//             ),
//             GlobalData.optManager.CompleteOperation()
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_DeleteRows = function () {
//       try {
//         if (GlobalData.optManager.Table_DeleteRows(null, !0)) {
//           if (Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var e = Collab.BuildMessage(ConstantData.CollabMessages.Table_DeleteRows, {
//             }, !0, !0)
//           }
//           GlobalData.optManager.Table_DeleteRows(null, !1, !0),
//             Collab.AllowMessage() &&
//             Collab.SendMessage(e),
//             GlobalData.optManager.CompleteOperation()
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_InsertCols = function (e) {
//       try {
//         if (GlobalData.optManager.Table_InsertColumns(e, null, !1, !0)) {
//           if (Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var t = {
//               left: e,
//               addcolheader: !1
//             },
//               a = Collab.BuildMessage(ConstantData.CollabMessages.Table_InsertColumns, t, !0, !0)
//           }
//           GlobalData.optManager.Table_InsertColumns(e, null, !1, !1, !0),
//             Collab.AllowMessage() &&
//             Collab.SendMessage(a),
//             GlobalData.optManager.CompleteOperation()
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_DeleteCols = function () {
//       try {
//         if (GlobalData.optManager.Table_DeleteColumns(null, !0)) {
//           if (Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var e = Collab.BuildMessage(ConstantData.CollabMessages.Table_DeleteColumns, {
//             }, !0, !0)
//           }
//           GlobalData.optManager.Table_DeleteColumns(null, !1, !0),
//             Collab.AllowMessage() &&
//             Collab.SendMessage(e),
//             GlobalData.optManager.CompleteOperation()
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_DeleteContent = function (e) {
//       try {
//         GlobalData.optManager.Table_DeleteCellContent(null, e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.TableSetRowCols = function (e, t) {
//       try {
//         GlobalData.optManager.SetTableProperties(!1, e, t)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.TableInsert = function (e, t) {
//       try {
//         GlobalData.optManager.InsertTable(!1, e, t)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.TableSetTextEditing = function (e) {
//       try {
//         if (GlobalData.optManager.CloseEdit(!0), Collab.AllowMessage()) {
//           Collab.BeginSecondaryEdit();
//           var t = {
//             flag: ListManager.Table.CellFlags.SDT_F_NoText,
//             on: e
//           },
//             a = Collab.BuildMessage(ConstantData.CollabMessages.Table_SetCellFlags, t, !0, !0)
//         }
//         GlobalData.optManager.Table_SetCellFlags(ListManager.Table.CellFlags.SDT_F_NoText, e, !0),
//           Collab.AllowMessage() &&
//           Collab.SendMessage(a),
//           GlobalData.optManager.CompleteOperation()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.TableInsertContainer = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(!0),
//           GlobalData.optManager.AddContainerToCell((e & ConstantData.ContainerListFlags.Sparse) > 0)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.TableConvertToText = function () {
//       try {
//         GlobalData.optManager.RemoveTables()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.TableSpaceRowCol = function (e) {
//       try {
//         if (GlobalData.optManager.Table_DistributeRowandCols(e, !0)) {
//           if (Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var t = {
//               dorow: e
//             },
//               a = Collab.BuildMessage(
//                 ConstantData.CollabMessages.Table_DistributeRowandCols,
//                 t,
//                 !0,
//                 !0
//               )
//           }
//           GlobalData.optManager.Table_DistributeRowandCols(e, !1, !0),
//             Collab.AllowMessage() &&
//             Collab.SendMessage(a),
//             GlobalData.optManager.CompleteOperation()
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_NavDown = function () {
//       try {
//         GlobalData.optManager.Table_Navigate(- 1, Resources.Keys.Down_Arrow, !1, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_ShiftNavDown = function () {
//       try {
//         GlobalData.optManager.Table_Navigate(- 1, Resources.Keys.Down_Arrow, !0, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_NavUp = function () {
//       try {
//         GlobalData.optManager.Table_Navigate(- 1, Resources.Keys.Up_Arrow, !1, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_ShiftNavUp = function () {
//       try {
//         GlobalData.optManager.Table_Navigate(- 1, Resources.Keys.Up_Arrow, !0, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_NavLeft = function () {
//       try {
//         GlobalData.optManager.Table_Navigate(- 1, Resources.Keys.Left_Arrow, !1, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_ShiftNavLeft = function () {
//       try {
//         GlobalData.optManager.Table_Navigate(- 1, Resources.Keys.Left_Arrow, !0, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_NavRight = function () {
//       try {
//         GlobalData.optManager.Table_Navigate(- 1, Resources.Keys.Right_Arrow, !1, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_ShiftNavRight = function () {
//       try {
//         GlobalData.optManager.Table_Navigate(- 1, Resources.Keys.Right_Arrow, !0, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Table_NavEnter = function () {
//       try {
//         return !GlobalData.optManager.Table_Navigate(- 1, Resources.Keys.Enter, !1, !1)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.OrgChangeStyle = function (e) {
//       try {
//         var t = Business.GetSelectionBusinessManager();
//         null == t &&
//           (t = gBusinessManager),
//           t.SetBranchStyle ? (GlobalData.optManager.CloseEdit(), t.SetBranchStyle(e)) : Utils2.Alert(Resources.Strings.OrgChart_NoSelect, null)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.OrgSetDirection = function (e) {
//       GlobalDatagBusinessController.SetDirection(e, null, null)
//     },
//     this.OrgSetTable = function (e) {
//       try {
//         if (gOrgChartManager.SetTable && gOrgChartManager.SetTable(e, !0)) {
//           if (GlobalData.optManager.CloseEdit(), Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var t = {
//               name: e
//             },
//               a = Collab.BuildMessage(ConstantData.CollabMessages.OrgSetTable, t, !0, !0)
//           }
//           gOrgChartManager.SetTable(e, !1, !0),
//             Collab.AllowMessage() &&
//             Collab.SendMessage(a),
//             GlobalData.optManager.CompleteOperation()
//         } else Utils2.Alert(Resources.Strings.OrgChart_NoSelect, null)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.MindMapSetTable = function (e) {
//       try {
//         if (gTaskMapManager.SetTable && gTaskMapManager.SetTable(e, !0)) {
//           if (GlobalData.optManager.CloseEdit(), Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var t = {
//               name: e
//             },
//               a = Collab.BuildMessage(ConstantData.CollabMessages.MindMapSetTable, t, !0, !0)
//           }
//           gTaskMapManager.SetTable(e, !1, !0),
//             Collab.AllowMessage() &&
//             Collab.SendMessage(a),
//             GlobalData.optManager.CompleteOperation()
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.MindMapAddIcon = function (e) {
//       try {
//         var t = Business.GetSelectionBusinessManager();
//         if (null == t && (t = gBusinessManager), t.AddIcon && t.AddIcon(e, !0)) {
//           if (GlobalData.optManager.CloseEdit(), Collab.AllowMessage()) {
//             Collab.BeginSecondaryEdit();
//             var a = {
//               iconid: e,
//               SelectionManagerName: SDJS_Business_GetModuleName(t)
//             },
//               r = Collab.BuildMessage(ConstantData.CollabMessages.MindMapAddIcon, a, !0, !0)
//           }
//           t.AddIcon(e, !1, !0),
//             Collab.AllowMessage() &&
//             Collab.SendMessage(r),
//             GlobalData.optManager.CompleteOperation()
//         }
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Set_SDPFlag = function (e, t) {
//       try {
//         gBaseManager.SetSDPFlag &&
//           (
//             GlobalData.optManager.CloseEdit(),
//             Collab.AllowMessage() &&
//             Collab.BeginSecondaryEdit(),
//             gBaseManager.SetSDPFlag(e, t)
//           )
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.Set_SDPMoreFlag = function (e, t) {
//       try {
//         gBaseManager.SetSDPMoreFlag &&
//           (
//             GlobalData.optManager.CloseEdit(),
//             Collab.AllowMessage() &&
//             Collab.BeginSecondaryEdit(),
//             gBaseManager.SetSDPMoreFlag(e, t)
//           )
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.MakeUniformSize = function () {
//       try {
//         var e = Business.GetSelectionBusinessManager();
//         null == e &&
//           (e = gBusinessManager),
//           e.MakeUniformSize ? (GlobalData.optManager.CloseEdit(), e.MakeUniformSize()) : Utils2.Alert(Resources.Strings.OrgChart_NoSelect, null)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ImportSVGSymbol = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.ImportSVGSymbol(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.CenterOnPage = function (e) {
//       try {
//         if (0 === GlobalData.optManager.ActiveLayerZList().length) return;
//         if (
//           Collab.AllowMessage() &&
//           !e &&
//           Collab.BeginSecondaryEdit(),
//           GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.CenterOnPage(null, null, !0),
//           Collab.AllowMessage() &&
//           !e
//         ) {
//           Collab.BuildMessage(ConstantData.CollabMessages.CenterOnPage, {
//           }, !1)
//         }
//         e ||
//           GlobalData.optManager.CompleteOperation()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.GeneratePreviewViaChrome = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.GeneratePreviewViaChrome()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.GeneratePreviewViaWebService = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.GeneratePreviewViaWebService()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.GeneratePreviewToFile = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.GeneratePreviewToFile()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.AddNewLayer = function (e, t, a) {
//       try {
//         GlobalData.optManager.AddNewLayer(e, t, a)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.RotateLayerStack = function () {
//       try {
//         GlobalData.optManager.RotateLayerStack()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SwitchToPreviousLayer = function () {
//       try {
//         GlobalData.optManager.SwitchToPreviousLayer()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SwitchToNextLayer = function () {
//       try {
//         GlobalData.optManager.SwitchToNextLayer()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ToggleCurrentLayerVisible = function () {
//       try {
//         GlobalData.optManager.ToggleCurrentLayerVisible()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ToggleCurrentLayerClickable = function () {
//       try {
//         GlobalData.optManager.ToggleCurrentLayerClickable()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },


//     this.SendToBackOfTargetLayer = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.SendToBackOfTargetLayer()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.BringToFrontOfTargetLayer = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.BringToFrontOfTargetLayer()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SendToBackOfTargetLayer = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.SendToBackOfTargetLayer()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.BringToFrontOfAllLayers = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.BringToFrontOfAllLayers()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SendToBackOfAllLayers = function () {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.SendToBackOfAllLayers()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.MoveObjectsToLayer = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.MoveObjectsToLayer(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SetCornerRadius = function (e, t) {
//       try {
//         GlobalData.optManager.CloseEdit();
//         var a = {
//           rrectfixed: !0,
//           hasrrectselected: !0,
//           rrectparam: e / ConstantData.Defines.RRectFixedDim
//         };
//         GlobalData.optManager.SetShapeProperties(a, null, t)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SetLineCornerRadius = function (e) {
//       try {
//         GlobalData.optManager.CloseEdit();
//         var t = {};
//         t.curveparam = e;
//         var a = {};
//         a.curveparam = e;
//         var r = {
//           segl: t,
//           arraylist: a
//         };
//         GlobalData.optManager.SetSelectedObjectAttributes(r)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.SetLineCornerRadiusAll = function (e) {
//       try {
//         GlobalData.optManager.SetLineCornerRadiusAll(e)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.ShowAllLayers = function () {
//       try {
//         GlobalData.optManager.ShowAllLayers()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.AddNote = function () {
//       try {
//         GlobalData.optManager.EditNote()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.AddComment = function () {
//       try {
//         ConstantData.DocumentContext.HTMLFocusControl &&
//           ConstantData.DocumentContext.HTMLFocusControl.blur &&
//           ConstantData.DocumentContext.HTMLFocusControl.blur(),
//           GlobalData.optManager.CloseEdit(),
//           GlobalData.optManager.EditComments()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.CommentClick = function (e) {
//       GlobalData.optManager.CommentClick(e)
//     },
//     this.PanelCommentClick = function (e) {
//       try {
//         GlobalData.optManager.PanelCommentSelect(parseInt(e))
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.CommentDelete = function (e) {
//       try {
//         SDUI.Commands.MainController.Dropdowns.HideDropdown(Resources.Controls.Dropdowns.ConfirmCommentDelete.Id),
//           GlobalData.optManager.CommentDelete()
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.CancelCommentDelete = function () {
//       SDUI.Commands.MainController.Dropdowns.HideDropdown(Resources.Controls.Dropdowns.ConfirmCommentDelete.Id)
//     },
//     this.SD_CommentEnter = function (e, t) {
//       try {
//         GlobalData.optManager.CommentEnter(e, t)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.AddHyperlink = function () {
//       try {
//         GlobalData.optManager.GetTargetSelect() >= 0 ? SDUI.Commands.MainController.ShowModal(Resources.Controls.Modals.Hyperlink.Id) : Utils2.Alert(Resources.Strings.NoShape, null)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.IdleLayersDropdown = function () {
//       var e = GlobalData.optManager.GetFrontBackLayersForSelected(),
//         t = Resources.Controls.DD_Layers.BringToFrontName.GetControl();
//       $(t).text(e.frontmostname);
//       var a = Resources.Controls.DD_Layers.SendToBackName.GetControl();
//       $(a).text(e.backmostname);
//       var r = Resources.Controls.DD_Layers.ShowAllLayers.GetControl(),
//         i = Resources.Controls.DD_Layers.BringToFront.GetControl(),
//         n = Resources.Controls.DD_Layers.SendToBack.GetControl(),
//         o = Resources.Controls.DD_Layers.MoveObjectToLayer.GetControl(),
//         s = GlobalData.optManager.GetLayerCount();
//       GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1).moreflags & ConstantData.SessionMoreFlags.SEDSM_HideLayerTabs &&
//         (s = 1);
//       var l = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theLayersManagerBlockID, !1);
//       if (
//         l.layers[l.activelayer].layertype === ConstantData.LayerTypes.SD_LAYERT_BACKGROUND &&
//         (s = 1),
//         1 == s
//       ) return r.addClass(Constants.Css_Disabled),
//         r.removeClass(Constants.Css_Enabled),
//         r.attr('disabled', !0),
//         i.addClass(Constants.Css_Disabled),
//         i.removeClass(Constants.Css_Enabled),
//         i.attr('disabled', !0),
//         n.addClass(Constants.Css_Disabled),
//         n.removeClass(Constants.Css_Enabled),
//         n.attr('disabled', !0),
//         o.addClass(Constants.Css_Disabled),
//         o.removeClass(Constants.Css_Enabled),
//         void o.attr('disabled', !0);
//       GlobalData.optManager.AreAllLayersVisible() ? (
//         r.addClass(Constants.Css_Disabled),
//         r.removeClass(Constants.Css_Enabled),
//         r.attr('disabled', !0)
//       ) : (
//         r.addClass(Constants.Css_Enabled),
//         r.removeClass(Constants.Css_Disabled),
//         r.attr('disabled', !1)
//       ),
//         e.result ? (
//           i.addClass(Constants.Css_Enabled),
//           i.removeClass(Constants.Css_Disabled),
//           i.attr('disabled', !1),
//           n.addClass(Constants.Css_Enabled),
//           n.removeClass(Constants.Css_Disabled),
//           n.attr('disabled', !1),
//           o.addClass(Constants.Css_Enabled),
//           o.removeClass(Constants.Css_Disabled),
//           o.attr('disabled', !1)
//         ) : (
//           i.addClass(Constants.Css_Disabled),
//           i.removeClass(Constants.Css_Enabled),
//           i.attr('disabled', !0),
//           n.addClass(Constants.Css_Disabled),
//           n.removeClass(Constants.Css_Enabled),
//           n.attr('disabled', !0),
//           o.addClass(Constants.Css_Disabled),
//           o.removeClass(Constants.Css_Enabled),
//           o.attr('disabled', !0)
//         )
//     },
//     this.IdleMoveToLayersDropdown = function () {
//       var e,
//         t,
//         a = GlobalData.optManager.GetLayerNames(),
//         r = GlobalData.optManager.GetLayerCount(),
//         i = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theLayersManagerBlockID, !1),
//         n = Resources.Controls.Dropdowns.MoveObjectToLayer.GetControl();
//       n.empty();
//       var o = GlobalData.optManager.GetActiveLayerIndex();
//       for (e = 0; e < r; ++e) i.layers[e].layertype !== ConstantData.LayerTypes.SD_LAYERT_BACKGROUND &&
//         (
//           t = e == o ? '<li id="dd-moveObjectToLayer-default" class="docLayer" onclick="SD_Click(event, \'SD_MoveObjectsToLayer\') " layerID=' + e + '><a href="#"><i class="icon-ok"></i>&nbsp;' + a[e] + '</a></li>' : '<li id="dd-moveObjectToLayer-default" class="docLayer" onclick="SD_Click(event, \'SD_MoveObjectsToLayer\') " layerID=' + e + '><a href="#">&nbsp;' + a[e] + '</a></li>',
//           n.append(t)
//         )
//     },
//     this.IdleFieldDataDropdown = function () {
//       GlobalData.optManager.BuildFieldedDataTooltip()
//     },
//     this.HandleEditDataDropdownChange = function (e, t, a, r) {
//       GlobalData.optManager.UpdateFieldedDataTooltipItem(e, t, a, r)
//     },
//     this.HandleEditDataDropdownEndFocus = function (e) {
//       GlobalData.optManager.HandleDataFieldEndFocus(e)
//     },
//     this.InsertSymbolViaKeypress = function (e) {
//       var t = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theTEDSessionBlockID, !1).theActiveTextEditObjectID;
//       if (!(t < 0)) try {
//         var a = $.Event('keydown', {
//           which: e,
//           keyCode: e
//         });
//         GlobalData.optManager.HandleKeyPress(a, e, 0),
//           GlobalData.optManager.TextAutoScroll(t),
//           GlobalData.optManager.TextResizeCommon(t)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.InsertSymbolViaRunInsert = function (e, t) {
//       var a = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theTEDSessionBlockID, !1).theActiveTextEditObjectID;
//       if (!(a < 0)) try {
//         GlobalData.optManager.RegisterLastTEOp(ListManager.TELastOp.PASTE),
//           GlobalData.optManager.InsertSymbolRun(String.fromCharCode(e), t),
//           GlobalData.optManager.TextAutoScroll(a),
//           GlobalData.optManager.TextResizeCommon(a),
//           GlobalData.optManager.RegisterLastTEOp(ListManager.TELastOp.TIMEOUT)
//       } catch (e) {
//         GlobalData.optManager.ExceptionCleanup(e)
//       }
//     },
//     this.BoldText = function () {
//       SDUI.Commands.MainController.ChangeFontStyle('bold')
//     },
//     this.ItalicText = function () {
//       SDUI.Commands.MainController.ChangeFontStyle('italic')
//     },
//     this.UnderlineText = function () {
//       SDUI.Commands.MainController.ChangeFontStyle('underline')
//     }
// }


// export default ShapeController
