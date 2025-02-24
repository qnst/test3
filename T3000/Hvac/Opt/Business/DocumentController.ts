
import Globals from "../../Data/Globals";
import Resources from '../../Data/Resources';
import GlobalData from '../../Data/GlobalData';
import $ from 'jquery'

import ConstantData from '../../Data/ConstantData'


class DocumentController {

  public documentConfig: any;
  public StandardRulers: any;

  constructor() {
    this.documentConfig = {
      showRulers: Globals.DocumentToolbarOptions[0].value,
      showGrid: Globals.DocumentToolbarOptions[1].value,
      enableSnap: Globals.DocumentToolbarOptions[2].value,
      centerSnap: Globals.DocumentToolbarOptions[3].value,
      zoom: Globals.DocumentToolbarOptions[4].value,
      zoomLevels: Globals.DocumentToolbarOptions[5].value,
      scale: Globals.DocumentToolbarOptions[6].value,
      showPageDivider: Globals.DocumentToolbarOptions[7].value,
      spellCheck: Globals.DocumentToolbarOptions[8].value,
      spellDict: Globals.DocumentToolbarOptions[9].value,
      spellFlags: Globals.DocumentToolbarOptions[10].value,
      printAllPages: !1,
      includeLinks: !1,
      snapToShapes: !1
    };

    // this.StandardRulers = [
    //   {
    //     useInches: !0,
    //     majorScale: 1,
    //     units: Resources.RulerUnits.SED_Inches,
    //     nTics: 12,
    //     nGrid: 12,
    //     nMid: 1,
    //     dp: 2
    //   },
    //   {
    //     useInches: !0,
    //     majorScale: 4,
    //     units: Resources.RulerUnits.SED_Feet,
    //     nTics: 12,
    //     nGrid: 12,
    //     nMid: 1,
    //     dp: 2
    //   },
    //   {
    //     useInches: !1,
    //     majorScale: 1,
    //     units: Resources.RulerUnits.SED_Cm,
    //     nTics: 5,
    //     nGrid: 5,
    //     nMid: 0,
    //     dp: 1
    //   },
    //   {
    //     useInches: !1,
    //     majorScale: 0.5,
    //     units: Resources.RulerUnits.SED_M,
    //     nTics: 5,
    //     nGrid: 5,
    //     nMid: 0,
    //     dp: 2
    //   },
    //   {
    //     useInches: !0,
    //     majorScale: 8,
    //     units: Resources.RulerUnits.SED_Feet,
    //     nTics: 12,
    //     nGrid: 12,
    //     nMid: 1,
    //     dp: 2
    //   },
    //   {
    //     useInches: !1,
    //     majorScale: 1,
    //     units: Resources.RulerUnits.SED_M,
    //     nTics: 5,
    //     nGrid: 5,
    //     nMid: 0,
    //     dp: 2
    //   },
    //   {
    //     useInches: !0,
    //     majorScale: 2,
    //     units: Resources.RulerUnits.SED_Feet,
    //     nTics: 12,
    //     nGrid: 12,
    //     nMid: 1,
    //     dp: 2
    //   },
    //   {
    //     useInches: !1,
    //     majorScale: 25,
    //     units: Resources.RulerUnits.SED_Cm,
    //     nTics: 5,
    //     nGrid: 5,
    //     nMid: 0,
    //     dp: 1
    //   }
    // ];
  }

  ZoomInandOut = function (e, t) {
    var a,
      r = 0.25,
      i = GlobalData.docHandler.GetZoomFactor();
    if (e) {
      if (i >= 4) return;
      (a = Math.ceil(i / r) * r) === i &&
        (a = i + 0.25),
        a > 4 &&
        (a = 4)
    } else {
      if (i <= 0.25) return;
      (a = Math.floor(i / r) * r) === i &&
        (a = i - 0.25),
        a < 0.25 &&
        (a = 0.25)
    }
    this.SetZoomLevel(100 * a, t)
  }

  SetZoomLevel = function (e, t) {
    e <= 0 ||
      this.inZoomIdle ||
      GlobalData.optManager &&
      GlobalData.optManager.SetDocumentScale(e / 100, t)
  }

  SetZoomLevelByIndex = function (e) {
    e < 0 ||
      e >= this.documentConfig.zoomLevels.length ||
      (
        this.documentConfig.zoom = e,
        GlobalData.optManager &&
        GlobalData.optManager.SetDocumentScale(this.documentConfig.zoomLevels[e] / 100)
      )
  }

  IdleZoomControls = function () {
    var e = $('#' + Resources.Controls.WA_DocumentToolbar.Zoom.Id),
      t = Math.round(100 * GlobalData.docHandler.GetZoomFactor());
    GlobalData.docHandler.GetSizeToFit();
    this.inZoomIdle = !0,
      e.val(t).change(),
      this.inZoomIdle = !1
  }

}

// console.log('DocumentController', Resources);


export default DocumentController

// var e = null;



// this.ArchitecturalRulers = [
//   {
//     useInches: !0,
//     majorScale: 8,
//     major: 75,
//     units: Resources.RulerUnits.SED_Feet,
//     nTics: 12,
//     nGrid: 12,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 8,
//     major: 100,
//     units: Resources.RulerUnits.SED_Feet,
//     nTics: 12,
//     nGrid: 12,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 4,
//     major: 75,
//     units: Resources.RulerUnits.SED_Feet,
//     nTics: 12,
//     nGrid: 12,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 4,
//     major: 100,
//     units: Resources.RulerUnits.SED_Feet,
//     nTics: 12,
//     nGrid: 12,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 2,
//     major: 75,
//     units: Resources.RulerUnits.SED_Feet,
//     nTics: 12,
//     nGrid: 12,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 2,
//     major: 100,
//     units: Resources.RulerUnits.SED_Feet,
//     nTics: 12,
//     nGrid: 12,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 1,
//     major: 75,
//     units: Resources.RulerUnits.SED_Feet,
//     nTics: 12,
//     nGrid: 12,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 1,
//     major: 100,
//     units: Resources.RulerUnits.SED_Feet,
//     nTics: 12,
//     nGrid: 12,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 1,
//     major: 150,
//     units: Resources.RulerUnits.SED_Feet,
//     nTics: 12,
//     nGrid: 12,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 1,
//     major: 300,
//     units: Resources.RulerUnits.SED_Feet,
//     nTics: 12,
//     nGrid: 12,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 1,
//     major: 1200,
//     units: Resources.RulerUnits.SED_Feet,
//     nTics: 12,
//     nGrid: 12,
//     nMid: 1,
//     dp: 2
//   }
// ]

// this.MetricRulers = [
//   {
//     useInches: !1,
//     majorScale: 1,
//     major: 100,
//     units: Resources.RulerUnits.SED_M,
//     nTics: 5,
//     nGrid: 5,
//     nMid: 0,
//     dp: 2
//   },
//   {
//     useInches: !1,
//     majorScale: 1,
//     major: 200,
//     units: Resources.RulerUnits.SED_M,
//     nTics: 10,
//     nGrid: 10,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !1,
//     majorScale: 1,
//     major: 500,
//     units: Resources.RulerUnits.SED_M,
//     nTics: 20,
//     nGrid: 20,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !1,
//     majorScale: 0.1,
//     major: 100,
//     units: Resources.RulerUnits.SED_M,
//     nTics: 10,
//     nGrid: 10,
//     nMid: 1,
//     dp: 3
//   },
//   {
//     useInches: !1,
//     majorScale: 5,
//     major: 100,
//     units: Resources.RulerUnits.SED_Cm,
//     nTics: 5,
//     nGrid: 5,
//     nMid: 0,
//     dp: 2
//   },
//   {
//     useInches: !1,
//     majorScale: 2,
//     major: 100,
//     units: Resources.RulerUnits.SED_Cm,
//     nTics: 5,
//     nGrid: 5,
//     nMid: 0,
//     dp: 2
//   },
//   {
//     useInches: !1,
//     majorScale: 1,
//     major: 100,
//     units: Resources.RulerUnits.SED_Cm,
//     nTics: 5,
//     nGrid: 5,
//     nMid: 0,
//     dp: 1
//   },
//   {
//     useInches: !1,
//     majorScale: 1,
//     major: 200,
//     units: Resources.RulerUnits.SED_Cm,
//     nTics: 10,
//     nGrid: 10,
//     nMid: 1,
//     dp: 1
//   },
//   {
//     useInches: !1,
//     majorScale: 10,
//     major: 100,
//     units: Resources.RulerUnits.SED_Mm,
//     nTics: 5,
//     nGrid: 5,
//     nMid: 0,
//     dp: 0
//   }
// ]

// this.MechEngRulers = [
//   {
//     useInches: !0,
//     majorScale: 32,
//     major: 100,
//     units: Resources.RulerUnits.SED_Inches,
//     nTics: 16,
//     nGrid: 16,
//     nMid: 1,
//     dp: 1
//   },
//   {
//     useInches: !0,
//     majorScale: 16,
//     major: 100,
//     units: Resources.RulerUnits.SED_Inches,
//     nTics: 16,
//     nGrid: 16,
//     nMid: 1,
//     dp: 1
//   },
//   {
//     useInches: !0,
//     majorScale: 8,
//     major: 100,
//     units: Resources.RulerUnits.SED_Inches,
//     nTics: 16,
//     nGrid: 16,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 4,
//     major: 100,
//     units: Resources.RulerUnits.SED_Inches,
//     nTics: 16,
//     nGrid: 16,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 2,
//     major: 100,
//     units: Resources.RulerUnits.SED_Inches,
//     nTics: 16,
//     nGrid: 16,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 1,
//     major: 100,
//     units: Resources.RulerUnits.SED_Inches,
//     nTics: 16,
//     nGrid: 16,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 1,
//     major: 200,
//     units: Resources.RulerUnits.SED_Inches,
//     nTics: 16,
//     nGrid: 16,
//     nMid: 1,
//     dp: 2
//   },
//   {
//     useInches: !0,
//     majorScale: 0.5,
//     major: 200,
//     units: Resources.RulerUnits.SED_Inches,
//     nTics: 16,
//     nGrid: 16,
//     nMid: 1,
//     dp: 3
//   },
//   {
//     useInches: !0,
//     majorScale: 0.25,
//     major: 200,
//     units: Resources.RulerUnits.SED_Inches,
//     nTics: 16,
//     nGrid: 16,
//     nMid: 1,
//     dp: 3
//   },
//   {
//     useInches: !0,
//     majorScale: 0.1,
//     major: 100,
//     units: Resources.RulerUnits.SED_Inches,
//     nTics: 10,
//     nGrid: 10,
//     nMid: 1,
//     dp: 3
//   }
// ]
// this.inZoomIdle = !1,
//   this.LayerMenuContainer = null,
//   this.UpdateDocumentConfig = function () {
//     GlobalData.docHandler &&
//       GlobalData.docHandler.UpdateConfig(this.documentConfig)
//   },
//   this.SetRulerVisibility = function (e) {
//     this.documentConfig.showRulers = null != e ? e : !this.documentConfig.showRulers,
//       this.UpdateDocumentConfig(),
//       SDUI.Commands.MainController.UpdatePageRibbon()
//   },
//   this.SetGridVisibility = function (e, t) {
//     if (
//       null != e ? this.documentConfig.showGrid = e : (
//         this.documentConfig.showGrid = !this.documentConfig.showGrid,
//         e = this.documentConfig.showGrid
//       ),
//       this.UpdateDocumentConfig(),
//       SDUI.Commands.MainController.UpdatePageRibbon(),
//       !0 === t
//     ) {
//       var a = SDUI.FileSource.ParamGenerator.MakeUpdateUserSettingParameters(SDUI.AppSettings.FileSource, 'ShowGrid', e);
//       a.Callback = function (e) {
//         SDUI.Utils.LogOpResult(e)
//       },
//         SDUI.FileSource.UpdateUserSetting(a)
//     }
//   },
//   this.SetPageDividerVisibility = function (e) {
//     this.documentConfig.showPageDivider = null != e ? e : !this.documentConfig.showPageDivider,
//       this.UpdateDocumentConfig(),
//       SDUI.Commands.MainController.UpdatePageRibbon()
//   },
//   this.SetDecimalPrecision = function (e, t) {
//     var a = {}, sdp, //Double ====
//       r = GlobalData.docHandler.rulerSettings;
//     t &&
//       (r = t.Data.rulerSettings),
//       r.dp !== e &&
//       (
//         Collab.AllowMessage() &&
//         (
//           Collab.BeginSecondaryEdit(),
//           a.rulerSettings = Utils1.DeepCopy(GlobalData.docHandler.rulerSettings),
//           a.precision = e
//         ),
//         GlobalData.docHandler.rulerSettings.dp = e,
//         sdp = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0),
//         sdp.rulerSettings = Utils1.DeepCopy(GlobalData.docHandler.rulerSettings),
//         GlobalData.optManager.RenderAllSVGObjects(),
//         Collab.AllowMessage() &&
//         Collab.BuildMessage(ConstantData.CollabMessages.SetDecimalPrecision, a, !1),
//         GlobalData.optManager.CompleteOperation()
//       )
//   },
//   this.SetFractionalPrecision = function (e, t) {
//     var a = {}, sdp,//Double ===
//       r = GlobalData.docHandler.rulerSettings;
//     t &&
//       (r = t.Data.rulerSettings),
//       r.fractionaldenominator !== e &&
//       (
//         Collab.AllowMessage() &&
//         (
//           Collab.BeginSecondaryEdit(),
//           a.rulerSettings = Utils1.DeepCopy(GlobalData.docHandler.rulerSettings),
//           a.precision = e
//         ),
//         GlobalData.docHandler.rulerSettings.fractionaldenominator = e,
//         sdp = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0),
//         sdp.rulerSettings = Utils1.DeepCopy(GlobalData.docHandler.rulerSettings),
//         GlobalData.optManager.RenderAllSVGObjects(),
//         Collab.AllowMessage() &&
//         Collab.BuildMessage(ConstantData.CollabMessages.SetFractionalPrecision, a, !1),
//         GlobalData.optManager.CompleteOperation()
//       )
//   },
//   this.SetScalePreset = function (e, t, a, r) {
//     var i,
//       n,
//       o;
//     switch (null == t && (t = 4), e) {
//       case 1:
//         i = this.ArchitecturalRulers[t];
//         break;
//       case 2:
//         i = this.MechEngRulers[t];
//         break;
//       case 3:
//         i = this.MetricRulers[t];
//         break;
//       default:
//         (i = Utils1.DeepCopy(this.StandardRulers[t - 1])).major = ConstantData.Defines.DefaultRulerMajor
//     }
//     if (
//       n = r ? Utils1.DeepCopy(r.Data.rulerSettings) : Utils1.DeepCopy(GlobalData.docHandler.rulerSettings),
//       GlobalData.docHandler.RulersNotEqual(n, i)
//     ) {
//       if (a && Collab.AllowMessage()) {
//         var s = {
//           scaletype: e,
//           preset: t
//         };
//         s.rulerSettings = Utils1.DeepCopy(GlobalData.docHandler.rulerSettings),
//           Collab.BeginSecondaryEdit()
//       }
//       if (GlobalData.docHandler.SetRulers(i), a) {
//         GlobalData.optManager.ScaleDrawing(n, i);
//         Collab.AllowMessage() &&
//           Collab.BuildMessage(ConstantData.CollabMessages.SetScalePreset, s, !1),
//           o = !i.useInches,
//           ConstantData.DocumentContext.UserSettings.Metric = o,
//           GlobalData.docHandler.ShowCoordinates(!0);
//         var l = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSelectedListBlockID, !1);
//         GlobalData.optManager.UpdateSelectionAttributes(l);
//         var S = SDUI.FileSource.ParamGenerator.MakeUpdateUserSettingParameters(SDUI.AppSettings.FileSource, 'Metric', o);
//         S.Callback = function (e) {
//           SDUI.Utils.LogOpResult(e)
//         },
//           SDUI.FileSource.UpdateUserSetting(S)
//       }
//     }
//   },
//   this.RulersEqual = function (e, t) {
//     return e.useInches == t.useInches &&
//       e.units == t.units &&
//       e.major == t.major &&
//       e.majorScale == t.majorScale &&
//       e.nTics == t.nTics &&
//       e.nMid == t.nMid &&
//       e.nGrid == t.nGrid
//   },
//   this.MenuScaleSelected = function () {
//     var e,
//       t,
//       a = GlobalData.docHandler.rulerSettings;
//     if (a.useInches) {
//       if (a.units === Resources.RulerUnits.SED_Feet) {
//         for (t = this.ArchitecturalRulers.length, e = 0; e < t; e++) if (this.RulersEqual(a, this.ArchitecturalRulers[e])) return {
//           scale: 0,
//           index: e
//         }
//       } else for (t = this.MechEngRulers.length, e = 0; e < t; e++) if (this.RulersEqual(a, this.MechEngRulers[e])) return {
//         scale: 2,
//         index: e
//       }
//     } else for (t = this.MetricRulers.length, e = 0; e < t; e++) if (this.RulersEqual(a, this.MetricRulers[e])) return {
//       scale: 1,
//       index: e
//     };
//     return null
//   },
//   this.IsStandardScale = function (e) {
//     var t,
//       a,
//       r = this.StandardRulers.length;
//     if ((a = e || GlobalData.docHandler.rulerSettings).showpixels) return - 1;
//     for (t = 0; t < r; t++) if (
//       a.useInches == this.StandardRulers[t].useInches &&
//       a.units === this.StandardRulers[t].units &&
//       a.majorScale === this.StandardRulers[t].majorScale &&
//       a.nTics === this.StandardRulers[t].nTics &&
//       a.nGrid === this.StandardRulers[t].nGrid
//     ) return t + 1;
//     return - 1
//   },
//   this.GetMetricScale = function (e) {
//     var t;
//     switch (this.IsStandardScale(e)) {
//       case 1:
//         t = this.StandardRulers[2];
//         break;
//       case 2:
//         t = this.MetricRulers[1];
//         break;
//       case 5:
//         t = this.StandardRulers[5];
//         break;
//       case 7:
//         t = this.StandardRulers[7]
//     }
//     return t &&
//       (
//         e.useInches = t.useInches,
//         e.units = t.units,
//         e.majorScale = t.majorScale,
//         e.nTics = t.nTics,
//         e.nGrid = t.nGrid,
//         e.nMid = t.nMid,
//         e.major = t.major
//       ),
//       e
//   },
//   this.IsScaledDrawing = function (e) {
//     switch (this.IsStandardScale(e)) {
//       case 2:
//       case 5:
//       case 7:
//         return !0
//     }
//     return !1
//   },
//   this.SetSnapEnable = function (e) {
//     this.documentConfig.enableSnap = null != e ? e : !this.documentConfig.enableSnap,
//       this.UpdateDocumentConfig(),
//       SDUI.Commands.MainController.SmartPanels.IdleSmartPanel()
//   },
//   this.ForceCenterSnapEnable = function (e) {
//     this.documentConfig.centerSnap = e,
//       this.UpdateDocumentConfig()
//   },
//   this.ToggleSnapToShape = function (e) {
//     this.documentConfig.snapToShapes = null != e ? e : !this.documentConfig.snapToShapes,
//       this.UpdateDocumentConfig()
//   },
//   this.SetSnaps = function (e, t) {
//     this.documentConfig.enableSnap = e,
//       this.documentConfig.centerSnap = t,
//       this.UpdateDocumentConfig(),
//       SDUI.Commands.MainController.UpdatePageRibbon(),
//       SDUI.Commands.MainController.SmartPanels.IdleSmartPanel()
//   },
//   this.SetSpellCheck = function (e, t, a) {
//     var r,
//       i = this.documentConfig.spellCheck,
//       n = !1;
//     if (
//       this.documentConfig.spellCheck = null != e ? e : !this.documentConfig.spellCheck,
//       GlobalData.optManager.theContentHeader.flags = Utils2.SetFlag(
//         GlobalData.optManager.theContentHeader.flags,
//         ConstantData.ContentHeaderFlags.CT_AutoSpell,
//         this.documentConfig.spellCheck
//       ),
//       GlobalData.docHandler.svgDoc.GetSpellCheck().SetActive(this.documentConfig.spellCheck),
//       SDUI.Commands.MainController.UpdateOptionsRibbon(),
//       t &&
//       (i != this.documentConfig.spellCheck || a)
//     ) {
//       GlobalData.optManager.CloseEdit(),
//         Collab.AllowMessage() &&
//         (Collab.BeginSecondaryEdit(), n = !0),
//         (
//           r = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0)
//         ).EnableSpellCheck = this.documentConfig.spellCheck;
//       var o = SDUI.FileSource.ParamGenerator.MakeUpdateUserSettingParameters(SDUI.AppSettings.FileSource, 'SpellCheck', e);
//       o.Callback = function (e) {
//         SDUI.Utils.LogOpResult(e)
//       },
//         SDUI.FileSource.UpdateUserSetting(o),
//         ConstantData.DocumentContext.UserSettings.SpellCheck = e,
//         GlobalData.docHandler.svgDoc.GetSpellCheck().CheckAllSpelling(
//           (
//             function () {
//               if (n) {
//                 var t = {
//                   bEnable: e
//                 };
//                 Collab.BuildMessage(ConstantData.CollabMessages.SetSpellCheck, t, !1)
//               }
//               GlobalData.optManager.CompleteOperation()
//             }
//           )
//         )
//     } else t ||
//       (
//         r = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1)
//       ) &&
//       (r.EnableSpellCheck = this.documentConfig.spellCheck)
//   },
//   this.SetSpellDictionary = function (e, t) {
//     if (e) {
//       if (
//         GlobalData.docHandler.svgDoc.GetSpellCheck().SetCurrentDictionary(e),
//         this.documentConfig.spellDict = GlobalData.docHandler.svgDoc.GetSpellCheck().GetCurrentDictionary(),
//         SDUI.Commands.MainController.UpdateOptionsRibbon(),
//         t
//       ) {
//         GlobalData.optManager.CloseEdit();
//         var a = SDUI.FileSource.ParamGenerator.MakeUpdateUserSettingParameters(SDUI.AppSettings.FileSource, 'SpellDict', e);
//         a.Callback = function (e) {
//           SDUI.Utils.LogOpResult(e)
//         },
//           SDUI.FileSource.UpdateUserSetting(a),
//           ConstantData.DocumentContext.UserSettings.SpellDict = e,
//           GlobalData.docHandler.svgDoc.GetSpellCheck().CheckAllSpelling((function () {
//             GlobalData.optManager.CompleteOperation()
//           }))
//       }
//     }
//   },
//   this.SetSpellFlags = function (e, t) {
//     if (
//       this.documentConfig.spellFlags = e,
//       GlobalData.docHandler.svgDoc.GetSpellCheck().SetSpellFlags(e),
//       t
//     ) {
//       GlobalData.optManager.CloseEdit();
//       var a = SDUI.FileSource.ParamGenerator.MakeUpdateUserSettingParameters(SDUI.AppSettings.FileSource, 'SpellFlags', e);
//       a.Callback = function (e) {
//         SDUI.Utils.LogOpResult(e)
//       },
//         SDUI.FileSource.UpdateUserSetting(a),
//         ConstantData.DocumentContext.UserSettings.SpellFlags = e,
//         GlobalData.docHandler.svgDoc.GetSpellCheck().CheckAllSpelling((function () {
//           GlobalData.optManager.CompleteOperation()
//         }))
//     }
//   },
//   this.UpdateSpellFlag = function (e, t) {
//     null === t &&
//       (t = !(0 != (this.documentConfig.spellFlags & e)));
//     var a = this.documentConfig.spellFlags;
//     t ? a |= e : a &= ~e,
//       this.SetSpellFlags(a, !0)
//   },
//   this.ClearUserDict = function (e) {
//     GlobalData.docHandler.svgDoc.GetSpellCheck().ClearUserDict(),
//       e &&
//       (
//         GlobalData.optManager.CloseEdit(),
//         GlobalData.docHandler.svgDoc.GetSpellCheck().CheckAllSpelling((function () {
//           GlobalData.optManager.CompleteOperation()
//         }))
//       )
//   },
//   this.IdleSpellSuggestMenu = function () {
//     var e = GlobalData.docHandler.svgDoc.GetSpellCheck().GetMenuSuggestions() ||
//       [],
//       t = Resources.Controls.DD_SpellingSuggest.SuggestList.GetControl(),
//       a = Resources.Controls.DD_SpellingSuggest.SuggestNone.GetControl();
//     if (t.empty(), e.length > 0) {
//       a.hide();
//       var r,
//         i,
//         n = new SDUI.Appender,
//         o = SDUI.Commands.MainController.GetHTMLTemplate('../../../../Views/Partials/SpellingSuggestionItem.html');
//       for (r = 0; r < e.length; r++) i = {
//         ItemId: r,
//         ContentTitle: e[r]
//       },
//         n.Append(t, o, i)
//     } else a.show()
//   },
//   this.HandleSpellAdd = function () {
//     GlobalData.docHandler.svgDoc.GetSpellCheck().HandleMenu_Add(),
//       GlobalData.optManager.CloseEdit(),
//       GlobalData.docHandler.svgDoc.GetSpellCheck().CheckAllSpelling((function () {
//         GlobalData.optManager.CompleteOperation()
//       }))
//   },
//   this.HandleSpellIgnore = function () {
//     GlobalData.docHandler.svgDoc.GetSpellCheck().HandleMenu_Ignore(),
//       GlobalData.optManager.CloseEdit(),
//       GlobalData.docHandler.svgDoc.GetSpellCheck().CheckAllSpelling((function () {
//         GlobalData.optManager.CompleteOperation()
//       }))
//   },
//   this.HandleSpellCorrect = function (e) {
//     GlobalData.optManager.RegisterLastTEOp(ListManager.TELastOp.PASTE),
//       GlobalData.docHandler.svgDoc.GetSpellCheck().HandleMenu_Suggest(e),
//       GlobalData.optManager.RegisterLastTEOp(ListManager.TELastOp.TIMEOUT)
//   },
//   this.SetCtrlArrowDisable = function (e) {
//     GlobalData.optManager.CloseEdit();
//     var t = SDUI.FileSource.ParamGenerator.MakeUpdateUserSettingParameters(SDUI.AppSettings.FileSource, 'DisableCtrlArrowShapeInsert', e);
//     t.Callback = function (e) {
//       SDUI.Utils.LogOpResult(e)
//     },
//       SDUI.FileSource.UpdateUserSetting(t),
//       ConstantData.DocumentContext.UserSettings.DisableCtrlArrowShapeInsert = e
//   },



//   this.SetScaleToFit = function (e) {
//     GlobalData.optManager &&
//       (
//         void 0 === e &&
//         (e = !GlobalData.docHandler.GetSizeToFit()),
//         GlobalData.optManager.SetDocumentScaleToFit(e)
//       )
//   },
//   this.SetScaleToPage = function (e) {
//     GlobalData.optManager &&
//       (
//         void 0 === e &&
//         (e = !GlobalData.docHandler.GetSizeToPage()),
//         GlobalData.optManager.SetDocumentScaleToPage(e)
//       )
//   },

//   this.LayerTabInfo = {
//     nLayers: 1,
//     tabOffset: 0,
//     layerNames: []
//   },
//   this.LayerTabClick = function (e, t) {
//     try {
//       GlobalData.optManager.GetLayerCount();
//       GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1).moreflags & ConstantData.SessionMoreFlags.SEDSM_HideLayerTabs &&
//         1;
//       var a = GlobalData.optManager.GetActiveLayerIndex();
//       if (t) var r = t.Data.newLayerIndex;
//       else r = e + this.LayerTabInfo.tabOffset - 1;
//       if (a == r) return;
//       var i = GlobalData.optManager.GetLayerInfoByIndex(r),
//         n = GlobalData.optManager.GetLayerInfoByIndex(a),
//         o = n.flags & ConstantData.LayerFlags.SDLF_Visible,
//         s = n.flags & ConstantData.LayerFlags.SDLF_Active,
//         l = i.flags & ConstantData.LayerFlags.SDLF_Visible,
//         S = i.flags & ConstantData.LayerFlags.SDLF_Active;
//       if (
//         Collab.AllowMessage() &&
//         Collab.BeginSecondaryEdit(),
//         GlobalData.optManager.MakeLayerActiveByIndex(r),
//         o &&
//         l &&
//         s &&
//         S
//       ) this.IdleLayersTabs();
//       else {
//         if (
//           o ? s ||
//             GlobalData.optManager.DirtyObjectsOnLayer(a, n) : GlobalData.optManager.RemoveObjectsOnLayer(a, n),
//           l &&
//           S ||
//           GlobalData.optManager.DirtyObjectsOnLayer(r, i),
//           Collab.AllowMessage()
//         ) {
//           o &&
//             s ||
//             (c = {
//               scope: Utils1.DeepCopy(n.zList)
//             });
//           var c = {
//             newLayerIndex: r
//           };
//           switch (i.layertype) {
//             case ConstantData.LayerTypes.SD_LAYERT_GANTT:
//             case ConstantData.LayerTypes.SD_LAYERT_MINDMAP:
//               Collab.CreateList.length &&
//                 (
//                   c.CreateList = [],
//                   c.CreateList = c.CreateList.concat(Collab.CreateList)
//                 )
//           }
//           Collab.BuildMessage(ConstantData.CollabMessages.LayerTabClick, c, !1)
//         }
//         GlobalData.optManager.CompleteOperation()
//       }
//     } catch (e) {
//       GlobalData.optManager.ExceptionCleanup(e)
//     }
//   },
//   this.IdleLayersTabs = function () {
//     if (GlobalData.optManager) {
//       var t,
//         a,
//         r,
//         n = Resources.Controls.GetWorkAreaControls(Resources.Controls.WorkArea.LayerButton.Id, !1),
//         o = Resources.Controls.GetWorkAreaControls(Resources.Controls.WorkArea.LayerButtonLabel.Id, !1),
//         s = n.GetControl(),
//         l = o.GetControl(),
//         S = GlobalData.optManager.GetLayerCount(),
//         c = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
//       if (
//         null == e &&
//         (
//           e = SDUI.Commands.MainController.GetHTMLTemplate('../../../../Views/Partials/LayerMenuItem.html')
//         ),
//         s
//       ) {
//         if (
//           c.moreflags & ConstantData.SessionMoreFlags.SEDSM_HideLayerTabs
//         ) return S = 1,
//           void s.addClass('hide');
//         if (S <= 1 && !gBusinessManager.AlwaysShowLayers()) return void s.addClass('hide');
//         s.removeClass('hide')
//       }
//       if (
//         t = Resources.Controls.DD_LayerDropdownList.Manage.GetControl(),
//         a = Resources.Controls.DD_LayerDropdownList.New.GetControl(),
//         r = Resources.Controls.DD_LayerDropdownList.Divider.GetControl(),
//         t &&
//         a &&
//         r &&
//         (
//           ConstantData.DocumentContext.AllowLayers ? (
//             S <= 1 ? (t.addClass('hide'), r.addClass('hide')) : (t.removeClass('hide'), r.removeClass('hide')),
//             a.removeClass('hide')
//           ) : (t.addClass('hide'), a.addClass('hide'), r.addClass('hide'))
//         ),
//         null == this.LayerMenuContainer &&
//         (
//           this.LayerMenuContainer = Resources.Controls.DD_LayerDropdownList.LayerList.GetControl()
//         ),
//         this.LayerMenuContainer
//       ) {
//         this.LayerTabInfo.nLayers = S,
//           this.LayerTabInfo.layerNames = GlobalData.optManager.GetLayerNames();
//         var u = GlobalData.optManager.GetLayers(),
//           p = ConstantData.LayerTypes,
//           d = GlobalData.optManager.GetActiveLayerIndex();
//         if (
//           this.LayerMenuContainer.empty(),
//           l &&
//           (l[0].innerText = this.LayerTabInfo.layerNames[d]),
//           S > 1
//         ) {
//           var D,
//             g,
//             h = new SDUI.Appender;
//           for (i = 0; i < S; ++i) u[i].layertype !== p.SD_LAYERT_TIMELINE &&
//             u[i].layertype !== p.SD_LAYERT_MEETING &&
//             (
//               D = {
//                 Layer_Num: i + 1,
//                 Layer_Name: this.LayerTabInfo.layerNames[i]
//               },
//               g = h.Append(this.LayerMenuContainer, e, D),
//               i == d ? g[0].Node.addClass(Constants.Css_Selected) : g[0].Node.removeClass(Constants.Css_Selected)
//             )
//         }
//       }
//     }
//   },
//   this.SetLayerTabsOffset = function (e) {
//     this.LayerTabInfo.tabOffset = 0,
//       this.IdleLayersTabs()
//   }



