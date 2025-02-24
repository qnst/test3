

import GlobalData from '../../Data/GlobalData'

import Resources from '../../Data/Resources'
import Commands from './Commands'
import ConstantData from '../../Data/ConstantData'

class ActiveSelection {

  SetFormatPainterHighlight(e) {
    // var t = Resources.Controls.Ribbon_Home;
    // e ? this.HighlightControl(t.FormatPainter.Id) : this.UnHighlightControl(t.FormatPainter.Id)
  }

  SetSelectionTool(e, t) {

    // GlobalData.optManager.RenderAllSVGSelectionStates()

    // console.log('SetSelectionTool 1', e, t);
    var a = ConstantData.DocumentContext.SelectionTool === Resources.Tools.Tool_Wall;
    ConstantData.DocumentContext.SelectionTool = e,
      ConstantData.DocumentContext.SelectionToolSticky = t,
      ConstantData.DocumentContext.SelectionToolMultiple = !1,
      e !== Resources.Tools.Tool_Wall &&
      (
        ConstantData.DocumentContext.UsingWallTool = !1,
        a &&
        GlobalData.optManager.RenderAllSVGSelectionStates()
      );
    // var r = Resources.Controls.SmartPanel_Common;
    // e === Resources.Tools.Tool_Select ? this.HighlightControl(r.Select.Id) : this.UnHighlightControl(r.Select.Id),
    //   e === Resources.Tools.Tool_Line ? this.HighlightControl(r.LineTool.Id) : this.UnHighlightControl(r.LineTool.Id),
    //   e === Resources.Tools.Tool_Shape ? this.HighlightControl(r.ShapeTool.Id) : this.UnHighlightControl(r.ShapeTool.Id),
    //   e === Resources.Tools.Tool_Text ? this.HighlightControl(r.Text.Id) : this.UnHighlightControl(r.Text.Id),
    //   e === Resources.Tools.Tool_Wall ? this.HighlightControl(r.WallTool.Id) : this.UnHighlightControl(r.WallTool.Id)
  }

  GetSelectionContext() {
    return Commands.MainController.Shapes.GetSelectionContext()
  }
}

export default ActiveSelection



// SDUI.ActiveSelection = function () {
//   var e = null,
//     t = null,
//     a = null,
//     r = !0,
//     i = !0,
//     n = !0,
//     o = !0,
//     s = !0,
//     l = !0,
//     S = !0,
//     c = null,
//     u = - 1,
//     p = - 1,
//     d = - 1,
//     D = - 1,
//     g = new Resources.QuickStyle,
//     h = null,
//     m = - 1,
//     C = - 1;
//   this.GetStyleInUse = function (e, t) {
//     return g = GlobalData.optManager.GetSelectedStyle(e, t),
//       t &&
//       (h = $.extend(!0, {
//       }, t)),
//       g
//   },
//     this.SetLastStyleInUse = function (e) {
//       g = e
//     },
//     this.GetLastStyleInUse = function () {
//       return g
//     },
//     this.GetLastArrowheadsInUse = function () {
//       return h
//     },
//     this.GetBackgroundFill = function () {
//       return GlobalData.optManager.GetBackgroundFill()
//     },
//     this.GetVisibleControlSet = function () {
//       var e = Resources.Controls.GetRibbonControls(ConstantData.DocumentContext.CurrentRibbon, !0);
//       null == e &&
//         (e = []);
//       var t = Resources.Controls.GetSmartPanelControls(ConstantData.DocumentContext.CurrentSmartPanel, !0);
//       if (null != t) for (var a = t.length, r = 0; r < a; r++) e.push(t[r]);
//       return e
//     },
//     this.HighlightTextControls = function (e) {
//       var t,
//         a,
//         r = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
//       if (null == e && null == c) return !1;
//       if (
//         null == e &&
//         null != c &&
//         (e = c),
//         c = e,
//         ConstantData.DocumentContext.CurrentRibbon === Resources.Controls.Ribbons.Home.Id ||
//         ConstantData.DocumentContext.CurrentRibbon === Resources.Controls.Ribbons.Design.Id
//       ) {
//         var i = Resources.Controls.Ribbon_Home,
//           n = Resources.Controls.Ribbon_Design,
//           o = [],
//           s = [];
//         o.push({
//           Item: i.Bold,
//           Highlight: e.bold
//         }),
//           o.push({
//             Item: i.Italic,
//             Highlight: e.italic
//           }),
//           o.push({
//             Item: i.Underline,
//             Highlight: e.underline
//           }),
//           o.push({
//             Item: i.Subscript,
//             Highlight: e.subscript
//           }),
//           o.push({
//             Item: i.Superscript,
//             Highlight: e.superscript
//           }),
//           s.push({
//             Item: i.Paste,
//             Highlight: e.paste != ConstantData.ClipboardType.None ||
//               !0
//           }),
//           s.push({
//             Item: i.Copy,
//             Highlight: e.allowcopy
//           }),
//           s.push({
//             Item: i.Cut,
//             Highlight: e.allowcopy
//           }),
//           a = GlobalData.optManager.currentModalOperation === ListManager.ModalOperations.FORMATPAINTER,
//           s.push({
//             Item: i.FormatPainter,
//             Highlight: e.allowcopy ||
//               a
//           }),
//           s.push({
//             Item: i.Undo,
//             Highlight: e.undo
//           }),
//           s.push({
//             Item: i.ReDo,
//             Highlight: e.redo
//           });
//         var l = 'FLOORPLAN' == GlobalData.optManager.theContentHeader.BusinessModule ||
//           'LINEDRAW_BPMN' == GlobalData.optManager.theContentHeader.BusinessModule ||
//           GlobalData.optManager.theContentHeader.BusinessModule.indexOf('LINEDRAW_BPMN') >= 0;
//         s.push({
//           Item: i.QuickStyle,
//           Highlight: !l
//         }),
//           s.push({
//             Item: i.Theme,
//             Highlight: !l
//           });
//         var S = - 1 != GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theTEDSessionBlockID, !1).theActiveTextEditObjectID;
//         s.push({
//           Item: i.Subscript,
//           Highlight: S
//         }),
//           s.push({
//             Item: i.Superscript,
//             Highlight: S
//           }),
//           s.push({
//             Item: i.InsertSymbol,
//             Highlight: S
//           });
//         var u,
//           p = 0 === e.npolylinecontainerselected &&
//             e.nshapeselected > 0 &&
//             r.RecentSymbols.length > 0;
//         for (s.push({
//           Item: n.ChangeShape,
//           Highlight: p
//         }), u = 0; u < o.length; u++) !0 === (t = o[u]).Highlight ? this.HighlightControl(t.Item.Id) : this.UnHighlightControl(t.Item.Id);
//         for (u = 0; u < s.length; u++) !0 === (t = s[u]).Highlight ? this.EnableControl(t.Item.Id) : this.DisableControl(t.Item.Id)
//       } else if (
//         ConstantData.DocumentContext.CurrentRibbon === Resources.Controls.Ribbons.Design.Id
//       ) n = Resources.Controls.Ribbon_Design;
//       else if (
//         ConstantData.DocumentContext.CurrentRibbon === Resources.Controls.Ribbons.Table.Id
//       ) {
//         var d,
//           D,
//           g,
//           h,
//           m,
//           C = Resources.Controls.GetRibbonControls(ConstantData.DocumentContext.CurrentRibbon, !0),
//           y = C.length;
//         for (
//           h = (g = Resources.Controls.Ribbon_Tablekey).TableNew,
//           m = g.TableTextEditing,
//           g.TableTextEditingLabel,
//           m &&
//           this.CheckControl(m.Id, !1 === ConstantData.DocumentContext.TableCellNoText),
//           this.Table_SetRowCol(e.NTableRows, e.NTableCols),
//           d = 0;
//           d < y;
//           d++
//         ) D = C[d],
//           e.ncells_selected >= D.MinSelectedItems ? this.EnableControl(D.Id) : this.DisableControl(D.Id),
//           (e.projectTableSelected || e.lockedTableSelected) &&
//           this.DisableControl(D.Id);
//         D = g.TableConvertText,
//           e.ntablesselected >= D.MinSelectedItems &&
//             !e.projectTableSelected &&
//             !e.lockedTableSelected &&
//             !e.isJiraCard ? this.EnableControl(D.Id) : this.DisableControl(D.Id),
//           h &&
//           (
//             ConstantData.DocumentContext.IsTargetTable ? this.DisableControl(h.Id) : this.EnableControl(h.Id)
//           )
//       } else if (
//         ConstantData.DocumentContext.CurrentRibbon === Resources.Controls.Ribbons.Page.Id
//       ) SDUI.Commands.MainController.UpdatePageRibbon();
//       else if (
//         ConstantData.DocumentContext.CurrentRibbon === Resources.Controls.Ribbons.Options.Id
//       ) SDUI.Commands.MainController.UpdateOptionsRibbon();
//       else if (
//         ConstantData.DocumentContext.CurrentRibbon === Resources.Controls.Ribbons.Design.Id
//       ) {
//         var f;
//         f = Resources.Controls.Ribbon_Design.ChangeLineShape,
//           e.nconnectorselected >= e.nlineselected &&
//           this.DisableControl(f.Id)
//       }
//     },
//     this.IdleSelectDirection = function () {
//       var e = ConstantData.Defines.SED_CDim,
//         t = !1,
//         a = !1,
//         r = !1,
//         i = !1,
//         n = 1000,
//         o = function (o) {
//           Utils2.IsEqual(o.x, e, n) ? t = !0 : Utils2.IsEqual(o.x, 0, n) &&
//             (a = !0),
//             Utils2.IsEqual(o.y, e, n) ? r = !0 : Utils2.IsEqual(o.y, 0, n) &&
//               (i = !0)
//         },
//         s = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.RightClickParams.TargetID, !1);
//       s &&
//         2 === s.hooks.length &&
//         (o(s.hooks[0].connect), o(s.hooks[1].connect)),
//         this.HideShowControl(Resources.Controls.DD_SelChart.Left.Id, t),
//         this.HideShowControl(Resources.Controls.DD_SelChart.Right.Id, a),
//         this.HideShowControl(Resources.Controls.DD_SelChart.Up.Id, r),
//         this.HideShowControl(Resources.Controls.DD_SelChart.Down.Id, i)
//     },
//     this.IsChildOfShapeContainer = function (e) {
//       var t = GlobalData.optManager.GetObjectPtr(e, !1);
//       if (t && 1 === t.hooks.length) {
//         var a = GlobalData.optManager.GetObjectPtr(t.hooks[0].objid, !1);
//         if (a && a instanceof ListManager.ShapeContainer) return !0
//       }
//       return !1
//     },
//     this.EnableDisableButtons = function (e) {
//       switch (e) {
//         case Resources.Controls.Dropdowns.LineThickness.Id:
//           c.nlineselected > 0 ? this.DisableControl(Resources.Controls.DD_LineThickness.Thick0.Id) : this.EnableControl(Resources.Controls.DD_LineThickness.Thick0.Id);
//           break;
//         case Resources.Controls.Dropdowns.AddPage.Id:
//           var t = null;
//           (
//             t = !0 === SDUI.AppSettings.PagedSDR2 ? !0 === SDUI.AppSettings.UseBackplane ? SDUI.BackplaneEditorMainController.BackplanePages.Manifest : SDUI.Commands.MainController.PagedSDRController.GetManifest2() : SDUI.Commands.MainController.PagedSDRController.GetManifest()
//           ) &&
//             t.TabOrder.length > 1 ? this.EnableControl(Resources.Controls.DD_AddPage.Manage.Id) : this.DisableControl(Resources.Controls.DD_AddPage.Manage.Id);
//           break;
//         case Resources.Controls.Dropdowns.SelChart.Id:
//           this.IdleSelectDirection();
//           break;
//         case Resources.Controls.ContextMenus.Swimlane.Id:
//           this.IdleCXTSwimlane();
//           break;
//         case Resources.Controls.ContextMenus.Frame.Id:
//           this.IdleCXTFrame();
//           break;
//         case Resources.Controls.ContextMenus.RectContextMenu.Id:
//           var a = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
//           switch (
//           c.nimageselected < 1 ? this.DisableControl(Resources.Controls.CXT_Rect.ClearImage.Id) : this.EnableControl(Resources.Controls.CXT_Rect.ClearImage.Id),
//           (r = Resources.Controls.CXT_Rect.ChangeShape.GetControl()) &&
//           (
//             a.RecentSymbols.length ? r.removeClass('hide') : r.addClass('hide')
//           ),
//           GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//             Resources.Controls.CXT_Rect.Lock.Id,
//             Resources.Strings.UnlockIdle
//           ) : this.SetControlText(
//             Resources.Controls.CXT_Rect.Lock.Id,
//             Resources.Strings.LockIdle
//           ),
//           ConstantData.DocumentContext.CurrentObjType
//           ) {
//             case ConstantData.ObjectTypes.SD_OBJT_SHAPECONTAINER:
//             case ConstantData.ObjectTypes.SD_OBJT_TABLE_WITH_SHAPECONTAINER:
//               SDUI.Commands.MainController.Selection.HideShowControl(Resources.Controls.CXT_Rect.Frame.Id, !1);
//               break;
//             default:
//               this.IsChildOfShapeContainer(GlobalData.optManager.RightClickParams.TargetID) ? SDUI.Commands.MainController.Selection.HideShowControl(Resources.Controls.CXT_Rect.Frame.Id, !1) : SDUI.Commands.MainController.Selection.HideShowControl(Resources.Controls.CXT_Rect.Frame.Id, !0)
//           }
//           this.IsJiraCardsAvailable() &&
//             c.ngroupsselected <= 0 ? (
//             SDUI.Commands.MainController.Selection.HideShowControl(
//               Resources.Controls.CXT_Rect.ConvertToJiraCard.Id,
//               !c.isJiraCard
//             ),
//             SDUI.Commands.MainController.Selection.HideShowControl(
//               Resources.Controls.CXT_Rect.UpdateJiraIssue.Id,
//               c.isJiraCard
//             )
//           ) : (
//             SDUI.Commands.MainController.Selection.HideShowControl(Resources.Controls.CXT_Rect.ConvertToJiraCard.Id, !1),
//             SDUI.Commands.MainController.Selection.HideShowControl(Resources.Controls.CXT_Rect.UpdateJiraIssue.Id, !1)
//           );
//           break;
//         case Resources.Controls.ContextMenus.Default.Id:
//           var r;
//           a = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
//           c.nimageselected < 1 ? this.DisableControl(Resources.Controls.CXT_Default.ClearImage.Id) : this.EnableControl(Resources.Controls.CXT_Default.ClearImage.Id),
//             (
//               r = Resources.Controls.CXT_Default.ChangeShape.GetControl()
//             ) &&
//             (
//               a.RecentSymbols.length ? r.removeClass('hide') : r.addClass('hide')
//             ),
//             GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//               Resources.Controls.CXT_Default.Lock.Id,
//               Resources.Strings.UnlockIdle
//             ) : this.SetControlText(
//               Resources.Controls.CXT_Default.Lock.Id,
//               Resources.Strings.LockIdle
//             ),
//             this.IsJiraCardsAvailable() &&
//               c.ngroupsselected <= 0 ? (
//               SDUI.Commands.MainController.Selection.HideShowControl(
//                 Resources.Controls.CXT_Default.ConvertToJiraCard.Id,
//                 !c.isJiraCard
//               ),
//               SDUI.Commands.MainController.Selection.HideShowControl(
//                 Resources.Controls.CXT_Default.UpdateJiraIssue.Id,
//                 c.isJiraCard
//               )
//             ) : (
//               SDUI.Commands.MainController.Selection.HideShowControl(Resources.Controls.CXT_Default.ConvertToJiraCard.Id, !1),
//               SDUI.Commands.MainController.Selection.HideShowControl(Resources.Controls.CXT_Default.UpdateJiraIssue.Id, !1)
//             );
//           break;
//         case Resources.Controls.ContextMenus.Table.Id:
//           ConstantData.DocumentContext.TableCellNoText ? this.SetControlText(
//             Resources.Controls.CXT_Table.AllowTextEditing.Id,
//             Resources.Strings.AllowTextEditing
//           ) : this.SetControlText(
//             Resources.Controls.CXT_Table.AllowTextEditing.Id,
//             Resources.Strings.NoTextEditing
//           ),
//             c.projectTableSelected ? (
//               this.DisableControl(Resources.Controls.CXT_Table.DeleteRow.Id),
//               this.DisableControl(Resources.Controls.CXT_Table.DeleteColumn.Id),
//               this.DisableControl(Resources.Controls.CXT_Table.Join.Id),
//               this.DisableControl(Resources.Controls.CXT_Table.Split.Id),
//               this.DisableControl(Resources.Controls.CXT_Table.InsertRowAbove.Id),
//               this.DisableControl(Resources.Controls.CXT_Table.InsertRowBelow.Id),
//               this.DisableControl(Resources.Controls.CXT_Table.InsertColLeft.Id),
//               this.DisableControl(Resources.Controls.CXT_Table.InsertColRight.Id),
//               this.DisableControl(Resources.Controls.CXT_Table.AllowTextEditing.Id)
//             ) : (
//               this.EnableControl(Resources.Controls.CXT_Table.DeleteRow.Id),
//               this.EnableControl(Resources.Controls.CXT_Table.DeleteColumn.Id),
//               this.EnableControl(Resources.Controls.CXT_Table.Join.Id),
//               this.EnableControl(Resources.Controls.CXT_Table.Split.Id),
//               this.EnableControl(Resources.Controls.CXT_Table.InsertRowAbove.Id),
//               this.EnableControl(Resources.Controls.CXT_Table.InsertRowBelow.Id),
//               this.EnableControl(Resources.Controls.CXT_Table.InsertColLeft.Id),
//               this.EnableControl(Resources.Controls.CXT_Table.InsertColRight.Id),
//               this.EnableControl(Resources.Controls.CXT_Table.AllowTextEditing.Id)
//             );
//           break;
//         case Resources.Controls.ContextMenus.LineSubMenu.Id.toLowerCase():
//           (
//             D = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.RightClickParams.TargetID, !1)
//           ) &&
//             SDUI.Commands.MainController.Selection.HideShowControl(
//               Resources.Controls.CXT_LineSubMenu.SelChart.Id,
//               2 === D.hooks.length
//             ),
//             GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//               Resources.Controls.CXT_LineSubMenu.Lock.Id,
//               Resources.Strings.UnlockIdle
//             ) : this.SetControlText(
//               Resources.Controls.CXT_LineSubMenu.Lock.Id,
//               Resources.Strings.LockIdle
//             );
//           break;
//         case Resources.Controls.ContextMenus.LineSubMenuSingleWall.Id.toLowerCase():
//           GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//             Resources.Controls.CXT_LineSubMenu.LockSingleWall.Id,
//             Resources.Strings.UnlockIdle
//           ) : this.SetControlText(
//             Resources.Controls.CXT_LineSubMenu.LockSingleWall.Id,
//             Resources.Strings.LockIdle
//           );
//           break;
//         case Resources.Controls.ContextMenus.LineSubMenuUML.Id.toLowerCase():
//           GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//             Resources.Controls.CXT_LineSubMenu.LockUML.Id,
//             Resources.Strings.UnlockIdle
//           ) : this.SetControlText(
//             Resources.Controls.CXT_LineSubMenu.LockUML.Id,
//             Resources.Strings.LockIdle
//           ),
//             - 2 != ConstantData.DocumentContext.CurrentLineCornerRadius ? this.EnableControl(Resources.Controls.CXT_LineSubMenu.CurveUML.Id) : this.DisableControl(Resources.Controls.CXT_LineSubMenu.CurveUML.Id);
//           break;
//         case Resources.Controls.ContextMenus.LineSubMenuUMLClass.Id.toLowerCase():
//           GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//             Resources.Controls.CXT_LineSubMenu.LockUMLClass.Id,
//             Resources.Strings.UnlockIdle
//           ) : this.SetControlText(
//             Resources.Controls.CXT_LineSubMenu.LockUMLClass.Id,
//             Resources.Strings.LockIdle
//           ),
//             - 2 != ConstantData.DocumentContext.CurrentLineCornerRadius ? this.EnableControl(Resources.Controls.CXT_LineSubMenu.CurveUMLClass.Id) : this.DisableControl(Resources.Controls.CXT_LineSubMenu.CurveUMLClass.Id);
//           break;
//         case Resources.Controls.ContextMenus.LineSubMenuUMLComponent.Id.toLowerCase():
//           GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//             Resources.Controls.CXT_LineSubMenu.LockUMLComponent.Id,
//             Resources.Strings.UnlockIdle
//           ) : this.SetControlText(
//             Resources.Controls.CXT_LineSubMenu.LockUMLComponent.Id,
//             Resources.Strings.LockIdle
//           ),
//             - 2 != ConstantData.DocumentContext.CurrentLineCornerRadius ? this.EnableControl(Resources.Controls.CXT_LineSubMenu.CurveUMLComponent.Id) : this.DisableControl(Resources.Controls.CXT_LineSubMenu.CurveUMLComponent.Id);
//           break;
//         case Resources.Controls.ContextMenus.LineSubMenuERD.Id.toLowerCase():
//           GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//             Resources.Controls.CXT_LineSubMenu.LockERD.Id,
//             Resources.Strings.UnlockIdle
//           ) : this.SetControlText(
//             Resources.Controls.CXT_LineSubMenu.LockERD.Id,
//             Resources.Strings.LockIdle
//           ),
//             - 2 != ConstantData.DocumentContext.CurrentLineCornerRadius ? this.EnableControl(Resources.Controls.CXT_LineSubMenu.CurveERD.Id) : this.DisableControl(Resources.Controls.CXT_LineSubMenu.CurveERD.Id);
//           break;
//         case Resources.Controls.ContextMenus.LineSubMenuBPMN.Id.toLowerCase():
//           GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//             Resources.Controls.CXT_LineSubMenu.LockBPMN.Id,
//             Resources.Strings.UnlockIdle
//           ) : this.SetControlText(
//             Resources.Controls.CXT_LineSubMenu.LockBPMN.Id,
//             Resources.Strings.LockIdle
//           ),
//             - 2 != ConstantData.DocumentContext.CurrentLineCornerRadius ? this.EnableControl(Resources.Controls.CXT_LineSubMenu.CurveBPMN.Id) : this.DisableControl(Resources.Controls.CXT_LineSubMenu.CurveBPMN.Id);
//           break;
//         case Resources.Controls.ContextMenus.LineSubMenuCurve.Id.toLowerCase():
//           (
//             D = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.RightClickParams.TargetID, !1)
//           ) &&
//             SDUI.Commands.MainController.Selection.HideShowControl(
//               Resources.Controls.CXT_LineSubMenu.SelChartCurve.Id,
//               2 === D.hooks.length
//             ),
//             GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//               Resources.Controls.CXT_LineSubMenu.LockCurve.Id,
//               Resources.Strings.UnlockIdle
//             ) : this.SetControlText(
//               Resources.Controls.CXT_LineSubMenu.LockCurve.Id,
//               Resources.Strings.LockIdle
//             );
//           break;
//         case Resources.Controls.ContextMenus.Connector.Id:
//           GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//             Resources.Controls.CXT_Connector.Lock.Id,
//             Resources.Strings.UnlockIdle
//           ) : this.SetControlText(
//             Resources.Controls.CXT_Connector.Lock.Id,
//             Resources.Strings.LockIdle
//           ),
//             ConstantData.DocumentContext.CurrentConnectorCanHaveCurve ? SDUI.Commands.MainController.Selection.HideShowControl(
//               Resources.Controls.CXT_Connector.Connector_SetCornerRadius.Id,
//               !0
//             ) : SDUI.Commands.MainController.Selection.HideShowControl(
//               Resources.Controls.CXT_Connector.Connector_SetCornerRadius.Id,
//               !1
//             );
//           break;
//         case Resources.Controls.ContextMenus.Graph.Id:
//           GlobalData.optManager.RightClickParams &&
//             GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//               Resources.Controls.CXT_Graph.Lock.Id,
//               Resources.Strings.UnlockIdle
//             ) : this.SetControlText(
//               Resources.Controls.CXT_Graph.Lock.Id,
//               Resources.Strings.LockIdle
//             );
//           break;
//         case Resources.Controls.ContextMenus.Gauge.Id:
//           GlobalData.optManager.RightClickParams &&
//             GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//               Resources.Controls.CXT_Gauge.Lock.Id,
//               Resources.Strings.UnlockIdle
//             ) : this.SetControlText(
//               Resources.Controls.CXT_Gauge.Lock.Id,
//               Resources.Strings.LockIdle
//             );
//           break;
//         case Resources.Controls.ContextMenus.BPMN_Choreo.Id:
//           GlobalData.optManager.Table_BPMNChoreo_AddRemoveRow(ConstantData.ObjectTypes.SD_OBJT_BPMN_CHOREOGRAPHY, !0, !0) ? this.EnableControl(Resources.Controls.CXT_BPMN_Choreo.RemoveParticipant.Id) : this.DisableControl(Resources.Controls.CXT_BPMN_Choreo.RemoveParticipant.Id),
//             GlobalData.optManager.RightClickParams &&
//               GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//                 Resources.Controls.CXT_BPMN_Choreo.Lock.Id,
//                 Resources.Strings.UnlockIdle
//               ) : this.SetControlText(
//                 Resources.Controls.CXT_BPMN_Choreo.Lock.Id,
//                 Resources.Strings.LockIdle
//               );
//           break;
//         case Resources.Controls.ContextMenus.BPMN_Activity.Id:
//           GlobalData.optManager.RightClickParams &&
//             GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//               Resources.Controls.CXT_BPMN_Activity.Lock.Id,
//               Resources.Strings.UnlockIdle
//             ) : this.SetControlText(
//               Resources.Controls.CXT_BPMN_Activity.Lock.Id,
//               Resources.Strings.LockIdle
//             );
//           break;
//         case Resources.Controls.ContextMenus.BPMN_Data.Id:
//           GlobalData.optManager.RightClickParams &&
//             GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//               Resources.Controls.CXT_BPMN_Data.Lock.Id,
//               Resources.Strings.UnlockIdle
//             ) : this.SetControlText(
//               Resources.Controls.CXT_BPMN_Data.Lock.Id,
//               Resources.Strings.LockIdle
//             );
//           break;
//         case Resources.Controls.ContextMenus.BPMN_Event.Id:
//           GlobalData.optManager.RightClickParams &&
//             GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//               Resources.Controls.CXT_BPMN_Event.Lock.Id,
//               Resources.Strings.UnlockIdle
//             ) : this.SetControlText(
//               Resources.Controls.CXT_BPMN_Event.Lock.Id,
//               Resources.Strings.LockIdle
//             );
//           break;
//         case Resources.Controls.ContextMenus.BPMN_Gateway.Id:
//           GlobalData.optManager.RightClickParams &&
//             GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//               Resources.Controls.CXT_BPMN_Gateway.Lock.Id,
//               Resources.Strings.UnlockIdle
//             ) : this.SetControlText(
//               Resources.Controls.CXT_BPMN_Gateway.Lock.Id,
//               Resources.Strings.LockIdle
//             );
//           break;
//         case Resources.Controls.ContextMenus.BPMN_Pool.Id:
//           GlobalData.optManager.Table_AllowRemoveColumn() ? this.EnableControl(Resources.Controls.CXT_BPMN_Pool.RemoveLane.Id) : this.DisableControl(Resources.Controls.CXT_BPMN_Pool.RemoveLane.Id),
//             GlobalData.optManager.RightClickParams &&
//               GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//                 Resources.Controls.CXT_BPMN_Pool.Lock.Id,
//                 Resources.Strings.UnlockIdle
//               ) : this.SetControlText(
//                 Resources.Controls.CXT_BPMN_Pool.Lock.Id,
//                 Resources.Strings.LockIdle
//               );
//           break;
//         case Resources.Controls.Dropdowns.Group.Id:
//           c.ngroupsselected < 1 ? this.DisableControl(Resources.Controls.DD_Group.Ungroup.Id) : this.EnableControl(Resources.Controls.DD_Group.Ungroup.Id),
//             c.nselect < 2 ? this.DisableControl(Resources.Controls.DD_Group.Group.Id) : this.EnableControl(Resources.Controls.DD_Group.Group.Id);
//           break;
//         case Resources.Controls.ContextMenus.Gantt.Id:
//           if (
//             ConstantData.DocumentContext.CurrentElemID >= 0 &&
//             GlobalData.optManager.IsPlanningDocument()
//           ) SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.CXT_Gantt.Trello.Id),
//             SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.CXT_Gantt.Trello.Id),
//             ListManager.Trello.IsLinkedToTrelloCard(ConstantData.DocumentContext.CurrentElemID) ? this.SetControlText(
//               Resources.Controls.CXT_Gantt.Trello.Id,
//               Resources.Strings.UnlinkTrelloCardMenu
//             ) : this.SetControlText(
//               Resources.Controls.CXT_Gantt.Trello.Id,
//               Resources.Strings.CreateTrelloCardMenu
//             );
//           else SDUI.Commands.MainController.Selection.DisableControl(Resources.Controls.CXT_Gantt.Trello.Id);
//           break;
//         case Resources.Controls.ContextMenus.Wireframe.Id:
//           var i = ListManager.ObjectSubTypes,
//             n = !1,
//             o = !1,
//             s = !1,
//             l = !1;
//           if (
//             ConstantData.DocumentContext.CurrentObjType === ConstantData.ObjectTypes.SD_OBJT_UIELEMENT
//           ) switch (ConstantData.DocumentContext.CurrentSubType) {
//             case i.SD_SUBT_UI_MENU:
//             case i.SD_SUBT_UI_RMENU:
//             case i.SD_SUBT_UI_MMENU:
//             case i.SD_SUBT_UI_VLIST:
//               o = !0
//           } else ConstantData.DocumentContext.TableCellSelected &&
//             (o = !0);
//           switch (ConstantData.DocumentContext.CurrentSubType) {
//             case i.SD_SUBT_UI_HTABBED:
//             case i.SD_SUBT_UI_VTABBED:
//               ConstantData.DocumentContext.TableCellFlags & ListManager.Table.CellFlags.SDT_F_ToggleIcon ? n = !0 : o = !1;
//               break;
//             case i.SD_SUBT_UI_HRADIO:
//             case i.SD_SUBT_UI_VRADIO:
//             case i.SD_SUBT_UI_HCHECKBOX:
//             case i.SD_SUBT_UI_VCHECKBOX:
//             case i.SD_SUBT_UI_ACCORDION:
//               n = !0;
//               break;
//             case i.SD_SUBT_UI_MENU:
//               n = !0,
//                 ConstantData.DocumentContext.TableCellSelected &&
//                 (l = !0, s = !0);
//               break;
//             case i.SD_SUBT_UI_RMENU:
//             case i.SD_SUBT_UI_MMENU:
//               n = !0,
//                 ConstantData.DocumentContext.TableCellSelected &&
//                 (l = !0);
//               break;
//             case i.SD_SUBT_UI_HLIST:
//             case i.SD_SUBT_UI_VLIST:
//               n = !0
//           }
//           n ? (
//             SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.CXT_Wireframe.Insert.Id),
//             SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.CXT_Wireframe.Remove.Id)
//           ) : (
//             SDUI.Commands.MainController.Selection.DisableControl(Resources.Controls.CXT_Wireframe.Insert.Id),
//             SDUI.Commands.MainController.Selection.DisableControl(Resources.Controls.CXT_Wireframe.Remove.Id)
//           ),
//             o ? SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.CXT_Wireframe.AddIcon.Id) : SDUI.Commands.MainController.Selection.DisableControl(Resources.Controls.CXT_Wireframe.AddIcon.Id),
//             s ? SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.CXT_Wireframe.ToggleEnable.Id) : SDUI.Commands.MainController.Selection.DisableControl(Resources.Controls.CXT_Wireframe.ToggleEnable.Id),
//             l ? SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.CXT_Wireframe.AddSeparator.Id) : SDUI.Commands.MainController.Selection.DisableControl(Resources.Controls.CXT_Wireframe.AddSeparator.Id);
//           break;
//         case Resources.Controls.ContextMenus.PolyLine.Id:
//         case Resources.Controls.ContextMenus.PolyWall.Id:
//           var S = !1,
//             u = !1,
//             p = !1;
//           GlobalData.optManager.RightClickParams &&
//             (
//               (
//                 GlobalData.optManager.RightClickParams.segment < 0 ||
//                 GlobalData.optManager.RightClickParams.segment >= c.nsegs
//               ) &&
//               (S = !0),
//               u = c.nsegs >= ConstantData.Defines.SED_MaxPolySegs,
//               p = c.nsegs < 3
//             ),
//             e === Resources.Controls.ContextMenus.PolyLine.Id ? (
//               S ||
//                 p ? (
//                 SDUI.Commands.MainController.Selection.DisableControl(Resources.Controls.CXT_PolyLine.PolyLine_Split.Id),
//                 SDUI.Commands.MainController.Selection.DisableControl(Resources.Controls.CXT_PolyLine.PolyLine_RemoveNodes.Id)
//               ) : (
//                 SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.CXT_PolyLine.PolyLine_Split.Id),
//                 SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.CXT_PolyLine.PolyLine_RemoveNodes.Id)
//               ),
//               S ||
//                 u ||
//                 c.npolylinecontainerselected > 0 ? SDUI.Commands.MainController.Selection.DisableControl(Resources.Controls.CXT_PolyLine.PolyLine_AddNode.Id) : SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.CXT_PolyLine.PolyLine_AddNode.Id),
//               GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//                 Resources.Controls.CXT_PolyLine.Lock.Id,
//                 Resources.Strings.UnlockIdle
//               ) : this.SetControlText(
//                 Resources.Controls.CXT_PolyLine.Lock.Id,
//                 Resources.Strings.LockIdle
//               )
//             ) : (
//               c.polyclosed ||
//                 c.nsegs <= 2 ||
//                 GlobalData.optManager.RightClickParams.segment > 0 &&
//                 GlobalData.optManager.RightClickParams.segment + 2 < c.nsegs ? SDUI.Commands.MainController.Selection.HideShowControl(Resources.Controls.CXT_PolyWall.RemoveLineSegment.Id, !1) : SDUI.Commands.MainController.Selection.HideShowControl(Resources.Controls.CXT_PolyWall.RemoveLineSegment.Id, !0),
//               2 === c.nsegs ? SDUI.Commands.MainController.Selection.HideShowControl(Resources.Controls.CXT_PolyWall.Split.Id, !1) : SDUI.Commands.MainController.Selection.HideShowControl(Resources.Controls.CXT_PolyWall.Split.Id, !0),
//               GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(
//                 Resources.Controls.CXT_PolyWall.Lock.Id,
//                 Resources.Strings.UnlockIdle
//               ) : this.SetControlText(
//                 Resources.Controls.CXT_PolyWall.Lock.Id,
//                 Resources.Strings.LockIdle
//               )
//             );
//           break;
//         case Resources.Controls.Dropdowns.PieData.Id:
//           var d = GlobalData.optManager.Graph_GetActiveID(!0);
//           if (d >= 0) {
//             var D,
//               g = (D = GlobalData.optManager.GetObjectPtr(d, !0)).GetGraph(!0);
//             if (g) {
//               var h = GlobalData.optManager.GraphGetCategoryList(g),
//                 m = 0;
//               for (var C in Resources.Controls.DD_PieData) if (Resources.Controls.DD_PieData.hasOwnProperty(C)) {
//                 var y = Resources.Controls.DD_PieData[C];
//                 y.GetControl(),
//                   null != y.Control &&
//                   (
//                     m < h.length ? (
//                       y.Control.removeClass('hide'),
//                       y.Control[0].innerHTML = GlobalData.optManager.GraphGetCategoryName(g, h[m].categoryid)
//                     ) : y.Control.addClass('hide'),
//                     m++
//                   )
//               }
//             }
//           }
//           break;
//         case Resources.Controls.Dropdowns.GanttScroll.Id:
//           this.PlanningTableToolBarIdleSlider();
//           break;
//         case Resources.Controls.Dropdowns.Themes.Id:
//           const f = SDUI.Commands.MainController.Theme &&
//             SDUI.Commands.MainController.Theme.CanUseCustomThemes() &&
//             SDUI.Commands.MainController.Theme.CanEditCustomThemes(),
//             L = Resources.Controls.DD_Themes.CustomThemes.GetControl();
//           f ? L.removeClass('hide') : L.addClass('hide')
//       }
//     },
//     this.Table_SetRowCol = function (e, t) {
//       var a = Resources.Controls.Ribbon_Tablekey;
//       null != t &&
//         (a.TableNumColumns.Control[0].value = t);
//       null != e &&
//         (a.TableNumRows.Control[0].value = e)
//     },
//     this.Table_GetNRows = function () {
//       var e = Resources.Controls.Ribbon_Tablekey.TableNumRows.Control[0];
//       return parseInt(e.value, 10)
//     },
//     this.Table_GetNCols = function () {
//       var e = Resources.Controls.Ribbon_Tablekey.TableNumColumns.Control[0];
//       return parseInt(e.value, 10)
//     },
//     this.Table_FocusRowCol = function (e) {
//       var t = Resources.Controls.Ribbon_Tablekey;
//       if (e) {
//         var a = t.TableNumRows.Control[0];
//         a.focus(),
//           a.select()
//       } else {
//         var r = t.TableNumColumns.Control[0];
//         r.focus(),
//           r.select()
//       }
//     },
//     this.HighlightSizingControls = function () {
//       var e = !0;
//       ConstantData.DocumentContext.Colorfilter & FileParser.SDRColorFilters.SD_NOCOLOR_RESIZE &&
//         (e = !1);
//       var t = Resources.Controls.WorkArea,
//         a = t.WidthEdit,
//         r = t.HeightEdit;
//       a &&
//         r &&
//         (
//           e ? (this.EnableControl(a.Id), this.EnableControl(r.Id)) : (this.DisableControl(a.Id), this.DisableControl(r.Id))
//         )
//     },
//     this.HighlightRealTimeButtons = function (e, t) {
//       if (null == e) return !1;
//       if (null == t && null == c) return !1;
//       null == t &&
//         null != c &&
//         (t = c),
//         c = t;
//       var a,
//         r = e.length,
//         i = !0;
//       this.HighlightSizingControls();
//       for (var n = 0; n < r; n++) {
//         var o = e[n];
//         a = !o.HasTextOnly ||
//           t.selectionhastext;
//         var s = !(o.NoPolyLineContainer && t.npolylinecontainerselected > 0);
//         switch (i = !0, o.Id) {
//           case Resources.Controls.Ribbon_Design.SetWidth.Id:
//           case Resources.Controls.Ribbon_Design.SetHeight.Id:
//             ConstantData.DocumentContext.Colorfilter & FileParser.SDRColorFilters.SD_NOCOLOR_RESIZE &&
//               (i = !1)
//         }
//         t.bInNoteEdit &&
//           o.NotesEditEnable ||
//           t.nselect >= o.MinSelectedItems &&
//           t.nlineselected >= o.MinSelectedLines &&
//           t.nshapeselected >= o.MinSelectedShapes &&
//           a &&
//           s &&
//           i ? this.EnableControl(o.Id) : this.DisableControl(o.Id)
//       }
//       return !0
//     },
//     this.EnableControlGroup = function (e) {
//       var t = Resources.Controls.GetControls(e, !0);
//       if (null == t) return !1;
//       for (var a = t.length, r = 0; r < a; r++) {
//         var i = t[r];
//         i.GetControl(),
//           null != i.Control &&
//           (
//             i.Control.removeClass(Constants.Css_Disabled),
//             i.Control.addClass(Constants.Css_Enabled)
//           )
//       }
//       return !0
//     },
//     this.DisableControlGroup = function (e) {
//       var t = Resources.Controls.GetControls(e, !0);
//       if (null == t) return !1;
//       for (var a = t.length, r = 0; r < a; r++) {
//         var i = t[r];
//         i.GetControl(),
//           null != i.Control &&
//           (
//             i.Control.addClass(Constants.Css_Disabled),
//             i.Control.removeClass(Constants.Css_Enabled)
//           )
//       }
//       return !0
//     },
//     this.EnableControl = function (e) {
//       if (null == e) return !1;
//       var t = Resources.Controls.GetControl(e);
//       if (null == t) return !1;
//       if (t.GetControl(), null == t.Control) return !1;
//       t.Control.addClass(Constants.Css_Enabled),
//         t.Control.removeClass(Constants.Css_Disabled),
//         t.Control.attr('disabled', !1);
//       var a = $('i', t.Control);
//       return a.length > 0 &&
//         (a[0].onclick = null),
//         !0
//     },
//     this.DisableControl = function (e) {
//       if (null == e) return !1;
//       var t = Resources.Controls.GetControl(e);
//       if (null == t) return !1;
//       if (t.GetControl(), null == t.Control) return !1;
//       t.Control.addClass(Constants.Css_Disabled),
//         t.Control.removeClass(Constants.Css_Enabled),
//         t.Control.attr('disabled', !0);
//       var a = $('i', t.Control);
//       return a.length > 0 &&
//         (
//           a[0].onclick = function (e) {
//             e.preventDefault(),
//               e.stopImmediatePropagation()
//           }
//         ),
//         !0
//     },
//     this.HideShowControl = function (e, t) {
//       if (null == e) return !1;
//       var a = Resources.Controls.GetControl(e);
//       if (null == a) return !1;
//       if (a.GetControl(), null == a.Control) return !1;
//       t ? a.Control.removeClass(Constants.Css_HideUI) : a.Control.addClass(Constants.Css_HideUI);
//       var r = $('i', a.Control);
//       return r.length > 0 &&
//         (
//           r[0].onclick = function (e) {
//             e.preventDefault(),
//               e.stopImmediatePropagation()
//           }
//         ),
//         !0
//     },
//     this.HighlightControl = function (e) {
//       if (null == e) return !1;
//       var t = Resources.Controls.GetControl(e);
//       return null != t &&
//         (
//           t.GetControl(),
//           null != t.Control &&
//           (t.Control.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.SetControlValue = function (e, t) {
//       if (null == e) return !1;
//       var a = Resources.Controls.GetControl(e);
//       if (null == a) return !1;
//       if (a.GetControl(), null == a.Control) return !1;
//       var r = a.Control[0].onchange;
//       return a.Control[0].onchange = null,
//         a.Control.val(t).change(),
//         a.Control[0].onchange = r,
//         !0
//     },
//     this.SetControlText = function (e, t) {
//       if (null == e) return !1;
//       var a = Resources.Controls.GetControl(e);
//       return null != a &&
//         (
//           a.GetControl(),
//           null != a.Control &&
//           (a.Control[0].innerHTML = t, !0)
//         )
//     },
//     this.CheckControl = function (e, t) {
//       if (null == e) return !1;
//       var a = Resources.Controls.GetControl(e);
//       return null != a &&
//         (
//           a.GetControl(),
//           null != a.Control &&
//           (a.Control[0].checked = 1 == t, !0)
//         )
//     },
//     this.UnHighlightControl = function (e) {
//       if (null == e) return !1;
//       var t = Resources.Controls.GetControl(e);
//       return null != t &&
//         (
//           t.GetControl(),
//           null != t.Control &&
//           (t.Control.removeClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.GetSelectionContext = function () {
//       return SDUI.Commands.MainController.Shapes.GetSelectionContext()
//     },
//     this.ShowTools = function (e) {
//       var t = Resources.Controls.SmartPanel_Common.Tools.GetControl(!0);
//       if (null != t) {
//         var a = Resources.Controls.SmartPanel_Common.ToolsLabel.GetControl(!0);
//         null == e &&
//           (e = t.hasClass('collapsed')),
//           t &&
//           (
//             e ? (
//               t.removeClass('collapsed'),
//               a.removeClass('toolsCollapsed'),
//               ConstantData.DocumentContext.CollapseTools = !1,
//               SDF.ChangeHeader(FileParser.SDROpCodesByName.SDF_C_HEAD_UIINFO, !1)
//             ) : (
//               t.addClass('collapsed'),
//               a.addClass('toolsCollapsed'),
//               ConstantData.DocumentContext.CollapseTools = !0,
//               SDF.ChangeHeader(FileParser.SDROpCodesByName.SDF_C_HEAD_UIINFO, !1)
//             )
//           )
//       }
//     },
//     this.SetLineTool = function (e) {

//       // Highlight the line tool selection

//       return !0 === y(e, Resources.LineToolTypes) &&
//         (
//           ConstantData.DocumentContext.LineTool = e,
//           this.HighlightLineToolSelection(),
//           !0
//         )
//     },
//     this.SetShapeTool = function (e) {
//       return !0 === y(e, FileParser.SDRShapeTypes) &&
//         (
//           ConstantData.DocumentContext.ShapeTool = e,
//           this.HighlightShapeToolSelection(),
//           !0
//         )
//     },

//     ,
//     this.SetPasteEnable = function (e) {
//       var t = Resources.Controls.Ribbon_Home;
//       e ? this.EnableControl(t.Paste.Id) : this.DisableControl(t.Paste.Id)
//     };
//   var y = function (e, t) {
//     for (var a in t) {
//       if (t[a] === e) return !0
//     }
//     return !1
//   };
//   this.AddRecentColor = function (e) {
//     if ('string' != typeof e) return !1;
//     e = e.toLowerCase();
//     var t = ConstantData.DocumentContext.RecentColors,
//       a = t.indexOf(e);
//     a >= 0 &&
//       t.splice(a, 1),
//       t.splice(0, 0, e),
//       t.length > 10 &&
//       t.splice(9, t.length - 10),
//       r = !0,
//       i = !0,
//       n = !0,
//       o = !0,
//       l = !0,
//       S = !0;
//     for (var s = '', c = t.length, u = 0; u < c; u++) {
//       var p = t[u];
//       '' !== p &&
//         null != p &&
//         (s += p + ',')
//     }
//     t = s.substring(0, s.length - 1);
//     var d = SDUI.FileSource.ParamGenerator.MakeUpdateUserSettingParameters(SDUI.AppSettings.FileSource, 'RecentColors', s);
//     return d.Callback = function (e) {
//       SDUI.Utils.LogOpResult(e)
//     },
//       SDUI.FileSource.UpdateUserSetting(d),
//       !0
//   },
//     this.AddCustomFreehandColor = function (e, t) {
//       let a = Resources.Controls.DD_FreehandLine.ColorEntry.GetControl(!0).map(
//         (
//           function () {
//             return $(this).attr(Constants.Attr_ColorIndex).toUpperCase()
//           }
//         )
//       ).get(),
//         r = ConstantData.DocumentContext.RecentFreehandColors;
//       e = e.toUpperCase();
//       let i = r.indexOf(e);
//       if (i > - 1) r.splice(i, 1),
//         r.unshift(e),
//         s = !0;
//       else if (!a.includes(e)) {
//         r.unshift(e) > 5 &&
//           r.pop(),
//           s = !0
//       }
//     },
//     this.AddRecentFont = function (e) {
//       if (null == e) return !1;
//       for (
//         var t = ConstantData.DocumentContext.RecentFonts,
//         a = t.length,
//         r = 0;
//         r < a;
//         r++
//       ) {
//         if (t[r].Id === e.Id) {
//           t.splice(r, 1);
//           break
//         }
//       }
//       return t.splice(0, 0, e),
//         t.length > 3 &&
//         t.splice(3, t.length - 3),
//         !0
//     },
//     this.HighlightDropdownSelection = function (e) {
//       if (null == e) return null;
//       var t,
//         a = e.toLowerCase(),
//         r = null,
//         i = null,
//         n = null,
//         o = Resources.Controls;
//       switch (e) {
//         case o.Dropdowns.TextBullets.Id:
//         case o.Dropdowns.TextAlign.Id:
//         case o.Dropdowns.TextSpacing.Id:
//           i = new SDGraphics.Text.ParagraphFormat,
//             t = this.GetStyleInUse(i, n),
//             i &&
//             (
//               ConstantData.DocumentContext.CurrentTextBullet = i.bullet,
//               ConstantData.DocumentContext.CurrentTextSpacing = i.spacing,
//               ConstantData.DocumentContext.CurrentTextAlignment = i.just
//             );
//           break;
//         case o.Dropdowns.Lines.Id:
//         case o.Dropdowns.LineFill.Id:
//         case o.Dropdowns.Borders.Id:
//         case o.Dropdowns.LineThickness.Id:
//         case o.ContextMenus.LineSubMenu.Id.toLowerCase():
//         case o.ContextMenus.LineSubMenuCurve.Id.toLowerCase():
//         case o.ContextMenus.Connector.Id.toLowerCase():
//         case o.Dropdowns.ArrowheadsERD.Id:
//           n = new ListManager.ArrowheadRecord;
//         case o.Dropdowns.Fill.Id:
//         case o.Dropdowns.Background.Id:
//         case o.Dropdowns.TextColor.Id:
//         case o.Dropdowns.Quickstyles.Id:
//         case o.Dropdowns.Effects.Id:
//           t = this.GetStyleInUse(i, n)
//       }
//       if (
//         a === Resources.Controls.Dropdowns.LineTool.Id.toLowerCase()
//       ) return this.HighlightLineToolSelection();
//       if (
//         a === Resources.Controls.Dropdowns.LineToolSwimlanes.Id.toLowerCase()
//       ) return this.HighlightSwimLaneLineToolSelection();
//       if (
//         a === Resources.Controls.Dropdowns.SwimlaneFormat.Id.toLowerCase()
//       ) return this.HighlightSwimLaneFormat();
//       if (
//         a === Resources.Controls.Dropdowns.SwimlaneOptions.Id.toLowerCase()
//       ) return this.HighlightSwimLaneOptions();
//       if (
//         a === Resources.Controls.Dropdowns.SwimlaneAddLanes.Id.toLowerCase()
//       ) return this.HighlightSwimLaneAddLanes();
//       if (
//         a === Resources.Controls.Dropdowns.FrameOptions.Id.toLowerCase()
//       ) return this.HighlightFrameOptions();
//       if (
//         a === Resources.Controls.Dropdowns.LineToolEngineering.Id.toLowerCase()
//       ) return this.HighlightEngineeringLineToolSelection();
//       if (
//         a === Resources.Controls.Dropdowns.Quickstyles.Id.toLowerCase()
//       ) {
//         if (!(c.nselect > 0 && null != g)) return this.HighlightStyleSelection();
//         g.Name &&
//           (r = g.Name.toLowerCase());
//         for (var s = Resources.CurrentTheme.Styles.length, l = 0; l < s; l++) if (Resources.CurrentTheme.Styles[l].Name.toLowerCase() === r) return this.HighlightStyleSelection(l + 1)
//       } else if (a === Resources.Controls.Dropdowns.Fill.Id.toLowerCase()) this.HighlightActiveColorOptions(
//         o.DD_Fill,
//         o.Dropdowns.Fill.GetControl(),
//         t.Fill.Paint,
//         Resources.Controls.DD_Fill.FillOpacitySlider.Id,
//         t.Fill.Hatch
//       );
//       else if (a === Resources.Controls.Dropdowns.Lines.Id.toLowerCase()) this.HighlightActiveColorOptions(
//         o.DD_Lines,
//         o.Dropdowns.Lines.GetControl(),
//         t.Line.Paint,
//         Resources.Controls.DD_Lines.TransparencySlider.Id,
//         t.Line.Hatch
//       );
//       else if (
//         a === Resources.Controls.Dropdowns.FreehandLines.Id.toLowerCase()
//       ) {
//         let e = o.Dropdowns.FreehandLines.GetControl(!0).attr(Constants.Attr_ContextId);
//         e = parseInt(e);
//         let t,
//           a = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !0);
//         switch (e) {
//           case ListManager.FreehandLineTypes.Pen:
//             t = a.def.pen;
//             break;
//           case ListManager.FreehandLineTypes.Highlighter:
//             t = a.def.highlighter
//         }
//         this.HighlightActiveFreehandOptions(
//           o.DD_FreehandLine,
//           o.Dropdowns.FreehandLines.GetControl(!0),
//           t.Line,
//           Resources.Controls.DD_FreehandLine.TransparencySlider.Id
//         )
//       } else if (
//         a === Resources.Controls.Dropdowns.LineFill.Id.toLowerCase()
//       ) this.HighlightActiveColorOptions(
//         o.DD_LineFill,
//         o.Dropdowns.LineFill.GetControl(),
//         t.Line.Paint,
//         Resources.Controls.DD_LineFill.TransparencySlider.Id,
//         t.Line.Hatch
//       );
//       else if (
//         a === Resources.Controls.Dropdowns.Borders.Id.toLowerCase()
//       ) this.HighlightActiveColorOptions(
//         o.DD_Borders,
//         o.Dropdowns.Borders.GetControl(),
//         t.Line.Paint,
//         Resources.Controls.DD_Borders.TransparencySlider.Id,
//         t.Line.Hatch
//       );
//       else if (
//         a === Resources.Controls.Dropdowns.TextColor.Id.toLowerCase()
//       ) this.HighlightActiveColorOptions(
//         o.DD_textColor,
//         o.Dropdowns.TextColor.GetControl(),
//         t.Text.Paint,
//         Resources.Controls.DD_textColor.FillOpacitySlider.Id,
//         0
//       );
//       else if (
//         a === Resources.Controls.Dropdowns.Background.Id.toLowerCase()
//       ) {
//         var S = this.GetBackgroundFill();
//         this.HighlightActiveColorOptions(
//           o.DD_Background,
//           o.Dropdowns.Background.GetControl(),
//           S.Paint,
//           null,
//           0
//         )
//       } else if (a === o.Dropdowns.Arrowheads.Id.toLowerCase()) n = this.GetLastArrowheadsInUse(),
//         this.HiliteArrowheadMenu(n);
//       else if (a === o.Dropdowns.ArrowheadsERD.Id.toLowerCase()) this.HiliteArrowheadERDMenu(n);
//       else {
//         if (
//           a === Resources.Controls.Dropdowns.Themes.Id.toLowerCase()
//         ) return this.HightThemeSelection();
//         if (
//           a === Resources.Controls.Dropdowns.ShapeBasic.Id.toLowerCase()
//         ) return this.HighlightShapeToolSelection();
//         if (
//           a === Resources.Controls.Dropdowns.TextDirection.Id.toLowerCase()
//         ) return this.HighlightTextDirectionSelection();
//         if (
//           a === Resources.Controls.Dropdowns.TextAlign.Id.toLowerCase()
//         ) return this.HighlightTextAlignSelection();
//         if (
//           a === Resources.Controls.Dropdowns.TextBullets.Id.toLowerCase()
//         ) return this.HighlightBulletSelection();
//         if (
//           a === Resources.Controls.Dropdowns.TextSpacing.Id.toLowerCase()
//         ) return this.HighlightTextSpacingSelection();
//         if (
//           a === Resources.Controls.Dropdowns.LineThickness.Id.toLowerCase()
//         ) return this.HighlightLineThickness();
//         if (
//           a === Resources.Controls.Dropdowns.LineStyle.Id.toLowerCase()
//         ) return this.HighlightLinePattern();
//         if (
//           a === Resources.Controls.Dropdowns.CustomThemeLineThickness.Id.toLowerCase()
//         ) return this.HighlightCustomThemeLineThickness();
//         if (
//           a === Resources.Controls.Dropdowns.CustomThemeLineStyle.Id.toLowerCase()
//         ) return this.HighlightCustomThemeLinePattern();
//         if (
//           a === Resources.Controls.Dropdowns.Effects.Id.toLowerCase()
//         ) return this.HighlightEffects();
//         if (
//           a === Resources.Controls.Dropdowns.GlowInner.Id.toLowerCase()
//         ) return this.HighlightInsideEffectMenu(
//           FileParser.FillEffect.SDFILL_EFFECT_INGLOW,
//           Resources.Controls.Dropdowns.GlowInner,
//           Resources.Controls.DD_InsideGlow
//         );
//         if (a === Resources.Controls.Dropdowns.Gloss.Id.toLowerCase()) return this.HighlightInsideEffectMenu(
//           FileParser.FillEffect.SDFILL_EFFECT_GLOSS,
//           Resources.Controls.Dropdowns.Gloss,
//           Resources.Controls.DD_GlossEffects
//         );
//         if (a === Resources.Controls.Dropdowns.Bevel.Id.toLowerCase()) return this.HighlightInsideEffectMenu(
//           FileParser.FillEffect.SDFILL_EFFECT_BEVEL,
//           Resources.Controls.Dropdowns.Bevel,
//           Resources.Controls.DD_BevelEffects
//         );
//         if (
//           a === Resources.Controls.Dropdowns.ShadowsInner.Id.toLowerCase()
//         ) return this.HighlightInsideEffectMenu(
//           FileParser.FillEffect.SDFILL_EFFECT_INSHADOW,
//           Resources.Controls.Dropdowns.ShadowsInner,
//           Resources.Controls.DD_InsideShadow
//         );
//         if (
//           a === Resources.Controls.Dropdowns.Shadows.Id.toLowerCase()
//         ) return this.HighlightOutsideEffectMenu(
//           FileParser.OutEffect.SDOUT_EFFECT_DROP,
//           Resources.Controls.Dropdowns.Shadows,
//           Resources.Controls.DD_ShadowEffects
//         );
//         if (a === Resources.Controls.Dropdowns.Glow.Id.toLowerCase()) return this.HighlightOutsideEffectMenu(
//           FileParser.OutEffect.SDOUT_EFFECT_GLOW,
//           Resources.Controls.Dropdowns.Glow,
//           Resources.Controls.DD_Glow
//         );
//         if (
//           a === Resources.Controls.Dropdowns.ShadowsCast.Id.toLowerCase()
//         ) return this.HighlightOutsideEffectMenu(
//           FileParser.OutEffect.SDOUT_EFFECT_CAST,
//           Resources.Controls.Dropdowns.ShadowsCast,
//           Resources.Controls.DD_CastShadowEffects
//         );
//         if (
//           a === Resources.Controls.Dropdowns.Reflection.Id.toLowerCase()
//         ) return this.HighlightOutsideEffectMenu(
//           FileParser.OutEffect.SDOUT_EFFECT_REFL,
//           Resources.Controls.Dropdowns.Reflection,
//           Resources.Controls.DD_ReflectionEffects
//         );
//         if (
//           a === Resources.Controls.Dropdowns.SetScale.Id.toLowerCase()
//         ) return this.HighlightSetScaleSelection();
//         if (
//           a === Resources.Controls.Dropdowns.SetScaleArchitecture.Id.toLowerCase()
//         ) return this.HighlightSubScaleSelection();
//         if (
//           a === Resources.Controls.Dropdowns.SetScaleMetric.Id.toLowerCase()
//         ) return this.HighlightSubScaleSelection();
//         if (
//           a === Resources.Controls.Dropdowns.SetScaleMechEng.Id.toLowerCase()
//         ) return this.HighlightSubScaleSelection();
//         if (
//           a === Resources.Controls.Dropdowns.PrecisionDecimal.Id.toLowerCase()
//         ) return this.HighlightPrecision(
//           Resources.Controls.DD_DecimalPrecision,
//           gDocumentHandler.rulerSettings.dp
//         );
//         if (
//           a === Resources.Controls.Dropdowns.PrecisionFraction.Id.toLowerCase()
//         ) return this.HighlightPrecision(
//           Resources.Controls.DD_FractionalPrecision,
//           gDocumentHandler.rulerSettings.fractionaldenominator
//         );
//         if (
//           a === Resources.Controls.Dropdowns.WallThickness.Id.toLowerCase()
//         ) return this.HighlightWallThickness();
//         if (
//           a === Resources.Controls.Dropdowns.SetSnaps.Id.toLowerCase()
//         ) return this.HighlightSetSnapsSelection();
//         if (
//           a === Resources.Controls.Dropdowns.Orientation.Id.toLowerCase()
//         ) return this.HighlightPrintOrientationSelection();
//         if (
//           a === Resources.Controls.Dropdowns.Margins.Id.toLowerCase()
//         ) return this.HighlightMarginSelection();
//         if (
//           a === Resources.Controls.Dropdowns.SpellOptionsDD.Id.toLowerCase()
//         ) return this.HighlightSpellOptionSelection();
//         if (
//           a === Resources.Controls.Dropdowns.ChartsData.Id.toLowerCase()
//         ) return this.HighlightChartsDataSelection();
//         if (
//           a === Resources.Controls.Dropdowns.HorizontalAxis.Id.toLowerCase()
//         ) return this.HighlightAxisMenuSelection(a);
//         if (
//           a === Resources.Controls.Dropdowns.VerticalAxis.Id.toLowerCase()
//         ) return this.HighlightAxisMenuSelection(a);
//         if (
//           a === Resources.Controls.Dropdowns.ChartsGrid.Id.toLowerCase()
//         ) return this.HighlightGridMenuSelection();
//         if (
//           a === Resources.Controls.Dropdowns.ChartAxes.Id.toLowerCase()
//         ) return this.HighlightChartsAxesSelection();
//         if (
//           a === Resources.Controls.Dropdowns.ChartRotate.Id.toLowerCase()
//         ) return this.HighlightChartRotateMenuSelection();
//         if (
//           a === Resources.Controls.Dropdowns.TimeMeasure.Id.toLowerCase()
//         ) return this.HighlightTimeMeasureMenuSelection();
//         if (
//           a === Resources.Controls.Dropdowns.Holidays.Id.toLowerCase()
//         ) return this.HighlightHolidayCountryMenuSelection();
//         if (
//           a === Resources.Controls.Dropdowns.GanttScroll.Id.toLowerCase()
//         ) return this.GanttTimeMeasureIdleMenuButtonText();
//         if (
//           a === Resources.Controls.Dropdowns.BPMNTaskType.Id.toLowerCase()
//         ) return this.HighlightBPMNIconSelection(Resources.Controls.DD_BPMNTaskTypes);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNActivityType.Id.toLowerCase()
//         ) return this.HighlightBPMNSubtypeSelection(Resources.Controls.DD_BPMNActivityTypes);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNDataType.Id.toLowerCase()
//         ) return this.HighlightBPMNIconSelection(Resources.Controls.DD_BPMNDataTypes);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNActivityMarker.Id.toLowerCase()
//         ) return this.HighlightBPMNIconSelection(Resources.Controls.DD_BPMNMarkers);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNChoreoMarker.Id.toLowerCase()
//         ) return this.HighlightBPMNIconSelection(Resources.Controls.DD_BPMNChoreoMarkers);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNChoreoType.Id.toLowerCase()
//         ) return this.HighlightBPMNLineThicknessSelection(Resources.Controls.DD_BPMNChoreoTypes);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNGatewayType.Id.toLowerCase()
//         ) return this.HighlightBPMNSubtypeSelection(Resources.Controls.DD_BPMNGatewayTypes);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNEventTriggerStart.Id.toLowerCase()
//         ) return this.HighlightBPMNSubtypeSelection(Resources.Controls.DD_BPMNEventTriggersS);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNEventTriggerStartNI.Id.toLowerCase()
//         ) return this.HighlightBPMNSubtypeSelection(Resources.Controls.DD_BPMNEventTriggersSNI);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNEventTriggerIntermediate.Id.toLowerCase()
//         ) return this.HighlightBPMNSubtypeSelection(Resources.Controls.DD_BPMNEventTriggersINT);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNEventTriggerIntermediateNI.Id.toLowerCase()
//         ) return this.HighlightBPMNSubtypeSelection(Resources.Controls.DD_BPMNEventTriggersINTNI);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNEventTriggerIntermediateThrow.Id.toLowerCase()
//         ) return this.HighlightBPMNSubtypeSelection(Resources.Controls.DD_BPMNEventTriggersINTTH);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNEventTriggerEnd.Id.toLowerCase()
//         ) return this.HighlightBPMNSubtypeSelection(Resources.Controls.DD_BPMNEventTriggersE);
//         if (
//           a === Resources.Controls.Dropdowns.BPMNEventType.Id.toLowerCase()
//         ) return this.HighlightBPMNObjecttypeSelection(Resources.Controls.DD_BPMNEventTypes);
//         if (
//           a === Resources.Controls.Dropdowns.ArrowClass.Id.toLowerCase()
//         ) return this.HighlightUMLLines(Resources.Controls.DD_ArrowClass);
//         if (
//           a === Resources.Controls.Dropdowns.ArrowInterface.Id.toLowerCase()
//         ) return this.HighlightUMLLines(Resources.Controls.DD_ArrowInterface);
//         if (
//           a === Resources.Controls.Dropdowns.ArrowUML.Id.toLowerCase()
//         ) return this.HighlightUMLLines(Resources.Controls.DD_ArrowUML);
//         if (
//           a === Resources.Controls.Dropdowns.ArrowBPMN.Id.toLowerCase()
//         ) return this.HighlightUMLLines(Resources.Controls.DD_ArrowBPMN);
//         if (
//           a === Resources.Controls.Dropdowns.SmartContainerArrangement.Id.toLowerCase()
//         ) return this.HighlightContainerSelection(
//           Resources.Controls.DD_SmartContainerArrangement,
//           ConstantData.DocumentContext.CurrentContainerList.Arrangement
//         );
//         if (
//           a === Resources.Controls.Dropdowns.SmartContainerType.Id.toLowerCase()
//         ) return this.HighlightContainerSelection(
//           Resources.Controls.DD_SmartContainerType,
//           ConstantData.DocumentContext.CurrentContainerList.flags & ConstantData.ContainerListFlags.Sparse
//         );
//         if (
//           a === Resources.Controls.Dropdowns.smartcontainerWrap.Id.toLowerCase()
//         ) return this.HighlightContainerSelection(
//           Resources.Controls.DD_SmartContainerWrap,
//           ConstantData.DocumentContext.CurrentContainerList.Wrap
//         );
//         if (
//           a === Resources.Controls.Dropdowns.smartcontainerChild.Id.toLowerCase()
//         ) return this.HighlightContainerSelection(
//           Resources.Controls.DD_SmartContainerChild,
//           ConstantData.DocumentContext.CurrentContainerList.flags & ConstantData.ContainerListFlags.AllowOnlyNonContainers + ConstantData.ContainerListFlags.AllowOnlyContainers
//         );
//         if (
//           a === Resources.Controls.Dropdowns.smartcontainerWrap.Id.toLowerCase()
//         ) return this.HighlightContainerSelection(
//           Resources.Controls.DD_SmartContainerWrap,
//           ConstantData.DocumentContext.CurrentContainerList.Wrap
//         );
//         if (
//           a === Resources.Controls.ContextMenus.BuilderSmartContainer.Id.toLowerCase()
//         ) return this.HighlightContainerContext();
//         if (
//           a === Resources.Controls.Dropdowns.SmartContainerSetCornerRadius.Id.toLowerCase()
//         ) return this.HighlightContainerSelection(
//           Resources.Controls.DD_CornerRadius,
//           ConstantData.DocumentContext.CurrentFixedCornerRadius
//         );
//         if (
//           a === Resources.Controls.Dropdowns.LineSetCornerRadius.Id.toLowerCase()
//         ) return this.HighlightContainerSelection(
//           Resources.Controls.DD_LineSetCornerRadius,
//           ConstantData.DocumentContext.CurrentLineCornerRadius
//         );
//         if (
//           a === Resources.Controls.Dropdowns.BuilderTableCelltypes.Id.toLowerCase()
//         ) return this.HighlightCellTypeSelection(
//           Resources.Controls.DD_BuilderTableCelltypes,
//           SDUI.Commands.RibbonCommands.Builder_GetTableCellType(ConstantData.DocumentContext.TableCellType)
//         )
//       }
//     },
//     this.HighlightTextDirectionSelection = function () {
//       var e = Resources.DocumentContext;
//       if (e.CurrentTextDirection === u) return !0;
//       u = e.CurrentTextDirection;
//       var t = Resources.Controls.DD_TextDirection;
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.TextDirection.GetControl());
//       var a = null;
//       switch (e.CurrentTextDirection) {
//         case !0:
//           a = t.AlongTheLine;
//           break;
//         case !1:
//           a = t.Horizontal
//       }
//       return null != a &&
//         (
//           null != (a = a.GetControl()) &&
//           (a.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HighlightTextAlignSelection = function () {
//       var e = Resources.DocumentContext;
//       if (e.CurrentTextAlignment === p) return !0;
//       p = e.CurrentTextAlignment;
//       var t = Resources.Controls.DD_TextAlign;
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.TextAlign.GetControl());
//       var a = null;
//       switch (e.CurrentTextAlignment) {
//         case 'top-left':
//           a = t.TopLeft;
//           break;
//         case 'top-right':
//           a = t.TopRight;
//           break;
//         case 'top-center':
//           a = t.TopCenter;
//           break;
//         case 'left':
//           a = t.Left;
//           break;
//         case 'right':
//           a = t.Right;
//           break;
//         case 'center':
//           a = t.Center;
//           break;
//         case 'bottom-left':
//           a = t.BottomLeft;
//           break;
//         case 'bottom-right':
//           a = t.BottomRight;
//           break;
//         case 'bottom-center':
//           a = t.BottomCenter
//       }
//       return null != a &&
//         (
//           null != (a = a.GetControl()) &&
//           (a.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HighlightTextSpacingSelection = function () {
//       var e = Resources.DocumentContext;
//       if (e.CurrentTextSpacing === D) return !0;
//       D = e.CurrentTextSpacing;
//       var t = Resources.Controls.DD_TextSpacing;
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.TextSpacing.GetControl());
//       var a = null;
//       switch (e.CurrentTextSpacing) {
//         case 0:
//           a = t.TextSpace_10;
//           break;
//         case 0.5:
//           a = t.TextSpace_15;
//           break;
//         case 1:
//           a = t.TextSpace_20
//       }
//       return null != a &&
//         (
//           null != (a = a.GetControl()) &&
//           (a.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HighlightBulletSelection = function () {
//       var e = Resources.DocumentContext;
//       if (e.CurrentTextBullet === d) return !0;
//       d = e.CurrentTextBullet;
//       Resources.Controls.DD_TextBullets;
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.TextBullets.GetControl());
//       var t = Resources.Controls.Dropdowns.TextBullets.GetControl(),
//         a = $('[' + Constants.Attr_TextBullet + '=' + d + ']', t);
//       return !(null != a && a.length > 0) ||
//         (
//           this.RemoveHighlightsUnder(t),
//           a.addClass(Constants.Css_Selected),
//           !0
//         )
//     },
//     this.IdleContextMenu_Text = function () {
//       var e,
//         t,
//         a,
//         r = Resources.DocumentContext,
//         i = Resources.Controls.CXT_Text;
//       if (null != (e = i.Cut.GetControl())) {
//         t = i.Copy.GetControl();
//         var n = i.AddHyperlink.GetControl();
//         a = i.Paste.GetControl(),
//           r.AllowCopy ? (
//             e.removeClass(Constants.Css_Disabled),
//             e.addClass(Constants.Css_Enabled),
//             t.removeClass(Constants.Css_Disabled),
//             t.addClass(Constants.Css_Enabled),
//             n.removeClass(Constants.Css_Disabled),
//             n.addClass(Constants.Css_Enabled)
//           ) : (
//             e.removeClass(Constants.Css_Enabled),
//             e.addClass(Constants.Css_Disabled),
//             t.removeClass(Constants.Css_Enabled),
//             t.addClass(Constants.Css_Disabled),
//             n.removeClass(Constants.Css_Enabled),
//             n.addClass(Constants.Css_Disabled)
//           ),
//           r.CurrentClipboard === ConstantData.ClipboardType.Text ? (
//             a.removeClass(Constants.Css_Disabled),
//             a.addClass(Constants.Css_Enabled)
//           ) : (
//             a.removeClass(Constants.Css_Enabled),
//             a.addClass(Constants.Css_Disabled)
//           )
//       }
//     },
//     this.IdleContextMenu_TextData = function () {
//       var e,
//         t,
//         a,
//         r = Resources.DocumentContext,
//         i = Resources.Controls.CXT_TextData;
//       if (null != (e = i.Cut.GetControl())) {
//         t = i.Copy.GetControl();
//         var n = i.AddHyperlink.GetControl();
//         a = i.Paste.GetControl(),
//           r.AllowCopy ? (
//             e.removeClass(Constants.Css_Disabled),
//             e.addClass(Constants.Css_Enabled),
//             t.removeClass(Constants.Css_Disabled),
//             t.addClass(Constants.Css_Enabled),
//             n.removeClass(Constants.Css_Disabled),
//             n.addClass(Constants.Css_Enabled)
//           ) : (
//             e.removeClass(Constants.Css_Enabled),
//             e.addClass(Constants.Css_Disabled),
//             t.removeClass(Constants.Css_Enabled),
//             t.addClass(Constants.Css_Disabled),
//             n.removeClass(Constants.Css_Enabled),
//             n.addClass(Constants.Css_Disabled)
//           ),
//           r.CurrentClipboard === ConstantData.ClipboardType.Text ? (
//             a.removeClass(Constants.Css_Disabled),
//             a.addClass(Constants.Css_Enabled)
//           ) : (
//             a.removeClass(Constants.Css_Enabled),
//             a.addClass(Constants.Css_Disabled)
//           ),
//           SDUI.Commands.MainController.DataPanel.IdleDataFieldListMenu()
//       }
//     },
//     this.HighlightLineToolSelection = function () {
//       var e = Resources.DocumentContext;
//       e.LineTool;
//       var t = Resources.Controls.DD_LineTool;
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.LineTool.GetControl());
//       var a = null,
//         r = Resources.Controls.SmartPanel_Common.LineTool.GetControl(!0);
//       if (null != r) {
//         switch (e.LineTool) {
//           case Resources.LineToolTypes.ArcLine:
//             a = t.CurvedLine;
//             break;
//           case Resources.LineToolTypes.SegmentedLine:
//             a = t.ShapeConnector;
//             break;
//           case Resources.LineToolTypes.StraightLine:
//             a = t.StraightLine;
//             break;
//           case Resources.LineToolTypes.PolyLine:
//             a = t.PolygonLine;
//             break;
//           case Resources.LineToolTypes.MoveWall:
//             a = t.AddWall;
//             break;
//           case Resources.LineToolTypes.ArcSegmentedLine:
//             a = t.CurvedConnector;
//             break;
//           case Resources.LineToolTypes.FreehandLine:
//             a = t.FreehandLine;
//             break;
//           default:
//             a = null
//         }
//         if (null == a) return !1;
//         if (null == (a = a.GetControl())) return !1;
//         var i = a[0].innerHTML.indexOf('icon="') + 6,
//           n = a[0].innerHTML.slice(i),
//           o = n.indexOf('"');
//         return n = n.slice(0, o),
//           r[0].children[0].icon = n,
//           a.addClass(Constants.Css_Selected),
//           !0
//       }
//     },
//     this.IdleCXTSwimlane = function () {
//       var e,
//         t = Resources.Controls.CXT_Swimlane,
//         a = ListManager.ObjectTypes,
//         r = GlobalDatagFlowChartManager.GetSwimlaneID(null, !1);
//       if (r) {
//         var i = GlobalData.optManager.GetObjectPtr(r.ID);
//         if (i) {
//           switch (i.objecttype) {
//             case a.SD_OBJT_SWIMLANE_COLS:
//               e = i.RotationAngle ? Resources.SwimlaneTypes.Row : Resources.SwimlaneTypes.Column;
//               break;
//             case a.SD_OBJT_SWIMLANE_ROWS:
//               e = Resources.SwimlaneTypes.Row;
//               break;
//             case a.SD_OBJT_SWIMLANE_GRID:
//               e = Resources.SwimlaneTypes.Grid
//           }
//           switch (e) {
//             case Resources.SwimlaneTypes.Column:
//               this.HideShowControl(t.FillColumnHeader.Id, !0),
//                 this.HideShowControl(t.FillRowHeader.Id, !1);
//               break;
//             case Resources.SwimlaneTypes.Row:
//               this.HideShowControl(t.FillColumnHeader.Id, !1),
//                 this.HideShowControl(t.FillRowHeader.Id, !0);
//               break;
//             case Resources.SwimlaneTypes.Grid:
//               this.HideShowControl(t.FillColumnHeader.Id, !0),
//                 this.HideShowControl(t.FillRowHeader.Id, !0)
//           }
//         }
//       }
//       return GlobalData.optManager.RightClickParams &&
//         GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(t.Lock.Id, Resources.Strings.UnlockIdle) : this.SetControlText(t.Lock.Id, Resources.Strings.LockIdle),
//         !0
//     },
//     this.IdleCXTFrame = function () {
//       var e = Resources.Controls.CXT_Frame,
//         t = GlobalDatagFlowChartManager.GetSwimlaneID(null, !0);
//       if (t) {
//         var a = GlobalData.optManager.GetObjectPtr(t.ID);
//         if (a) a.GetTable(!1) ? (
//           this.HideShowControl(e.FillColumnHeader.Id, !0),
//           this.HideShowControl(e.FillLanes.Id, !0),
//           this.HideShowControl(e.FillFrame.Id, !1)
//         ) : (
//           this.HideShowControl(e.FillColumnHeader.Id, !1),
//           this.HideShowControl(e.FillLanes.Id, !1),
//           this.HideShowControl(e.FillFrame.Id, !0)
//         )
//       }
//       return GlobalData.optManager.RightClickParams &&
//         GlobalData.optManager.RightClickParams.Locked ? this.SetControlText(e.Lock.Id, Resources.Strings.UnlockIdle) : this.SetControlText(e.Lock.Id, Resources.Strings.LockIdle),
//         !0
//     },
//     this.HighlightSwimLaneFormat = function () {
//       var e = Resources.DocumentContext;
//       this.RemoveHighlightsUnder(
//         Resources.Controls.Dropdowns.SwimlaneFormat.GetControl()
//       );
//       var t = Resources.Controls.DD_SwimlaneFormat,
//         a = null,
//         r = e.SwimlaneFormat,
//         i = e.SwimlaneRotate,
//         n = ListManager.ObjectTypes,
//         o = GlobalDatagFlowChartManager.GetSwimlaneID(null, !1);
//       if (o) {
//         var s = GlobalData.optManager.GetObjectPtr(o.ID);
//         if (s) {
//           switch (i = 0 !== s.RotationAngle, s.objecttype) {
//             case n.SD_OBJT_SWIMLANE_COLS:
//               r = i ? Resources.SwimlaneTypes.Row : Resources.SwimlaneTypes.Column;
//               break;
//             case n.SD_OBJT_SWIMLANE_ROWS:
//               r = Resources.SwimlaneTypes.Row;
//               break;
//             case n.SD_OBJT_SWIMLANE_GRID:
//               r = Resources.SwimlaneTypes.Grid
//           }
//           autocontainer = (
//             s.moreflags & ConstantData.ObjMoreFlags.SED_MF_AutoContainer
//           ) > 0,
//             actascontainer = (s.moreflags & ConstantData.ObjMoreFlags.SED_MF_Container) > 0
//         }
//       } else r === Resources.SwimlaneTypes.Column &&
//         i &&
//         (r = Resources.SwimlaneTypes.Row);
//       switch (r) {
//         case Resources.SwimlaneTypes.Column:
//           a = t.Column;
//           break;
//         case Resources.SwimlaneTypes.Row:
//           a = t.Row;
//           break;
//         case Resources.SwimlaneTypes.Grid:
//           a = t.Grid
//       }
//       return null != a &&
//         (
//           null != (a = a.GetControl()) &&
//           (a.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HighlightSwimLaneAddLanes = function () {
//       var e = !0,
//         t = !0,
//         a = !1,
//         r = !1,
//         i = ListManager.ObjectTypes,
//         n = Resources.Controls.DD_SwimlaneAddLanes,
//         o = !1,
//         s = GlobalDatagFlowChartManager.GetSwimlaneID(null, !1);
//       if (s) {
//         var l = GlobalData.optManager.GetObjectPtr(s.ID);
//         if (l) {
//           var S = 0 !== l.RotationAngle,
//             c = l.GetTable(!1);
//           if (c) {
//             var u = {
//               x: GlobalData.optManager.RightClickParams.HitPt.x,
//               y: GlobalData.optManager.RightClickParams.HitPt.y
//             };
//             u = GlobalData.optManager.Table_RotateClickPoint(l, u);
//             GlobalData.optManager.Table_RowAndColumnHit(c, u.x, u.y)
//           }
//           switch (l.objecttype) {
//             case i.SD_OBJT_SWIMLANE_COLS:
//               var p = 1;
//               S ? (e = !1, c.cols.length <= p && (r = !0)) : (t = !1, c.cols.length <= p && (a = !0));
//               break;
//             case i.SD_OBJT_SWIMLANE_ROWS:
//               p = 1,
//                 c.rows.length <= p &&
//                 (r = !0),
//                 e = !1;
//               break;
//             case i.SD_OBJT_SWIMLANE_GRID:
//               e = !1,
//                 t = !1,
//                 o = !0;
//               var d = 2;
//               GlobalData.optManager.Swimlane_HasTitleRow(l) &&
//                 (d = 3),
//                 c.rows.length <= d &&
//                 (r = !0),
//                 c.cols.length <= 2 &&
//                 (a = !0)
//           }
//           SDUI.Commands.MainController.Selection.HideShowControl(n.AddRowAbove.Id, !e),
//             SDUI.Commands.MainController.Selection.HideShowControl(n.AddRowBelow.Id, !e),
//             SDUI.Commands.MainController.Selection.HideShowControl(n.DeleteRow.Id, !e && !r && !o),
//             SDUI.Commands.MainController.Selection.HideShowControl(n.DeleteGridRow.Id, !e && !r && o),
//             SDUI.Commands.MainController.Selection.HideShowControl(n.AddColLeft.Id, !t),
//             SDUI.Commands.MainController.Selection.HideShowControl(n.AddColRight.Id, !t),
//             SDUI.Commands.MainController.Selection.HideShowControl(n.DeleteCol.Id, !t && !a && !o),
//             SDUI.Commands.MainController.Selection.HideShowControl(n.DeleteGridCol.Id, !t && !a && o)
//         }
//       }
//     },
//     this.HighlightSwimLaneOptions = function () {
//       var e = Resources.DocumentContext;
//       this.RemoveHighlightsUnder(
//         Resources.Controls.Dropdowns.SwimlaneOptions.GetControl()
//       );
//       var t = Resources.Controls.DD_SwimlaneOptions,
//         a = e.AutoContainer,
//         r = e.ActAsContainer,
//         i = ListManager.ObjectTypes,
//         n = e.SwimlaneFormat,
//         o = e.SwimlaneRotate,
//         s = n === Resources.SwimlaneTypes.Row ||
//           n === Resources.SwimlaneTypes.Column &&
//           o,
//         l = e.SwimlaneTitle,
//         S = n === Resources.SwimlaneTypes.Column,
//         c = !1,
//         u = !1,
//         p = GlobalDatagFlowChartManager.GetSwimlaneID(null, !1);
//       if (p) {
//         var d = GlobalData.optManager.GetObjectPtr(p.ID);
//         if (d) {
//           switch (o = 0 !== d.RotationAngle, d.objecttype) {
//             case i.SD_OBJT_SWIMLANE_COLS:
//               n = Resources.SwimlaneTypes.Column,
//                 o ? !1 : !1;
//               break;
//             case i.SD_OBJT_SWIMLANE_ROWS:
//               n = Resources.SwimlaneTypes.Row;
//               break;
//             case i.SD_OBJT_SWIMLANE_GRID:
//               n = Resources.SwimlaneTypes.Grid
//           }
//           s = n === Resources.SwimlaneTypes.Row ||
//             n === Resources.SwimlaneTypes.Column &&
//             o,
//             a = (
//               d.moreflags & ConstantData.ObjMoreFlags.SED_MF_AutoContainer
//             ) > 0,
//             r = (d.moreflags & ConstantData.ObjMoreFlags.SED_MF_Container) > 0,
//             S = n === Resources.SwimlaneTypes.Column,
//             l = GlobalData.optManager.Swimlane_HasTitleRow(d),
//             c = (
//               d.moreflags & ConstantData.ObjMoreFlags.SED_MF_Frame_AllowNesting
//             ) > 0,
//             u = (d.moreflags & ConstantData.ObjMoreFlags.SED_MF_Frame_Group) > 0
//         }
//       }
//       var D = t.AutoResize.GetControl();
//       D[0].checked = !a;
//       var g = t.Container.GetControl();
//       g[0].checked = !!r;
//       var h = t.AllowNesting.GetControl();
//       h[0].checked = !!c;
//       var m = t.FrameGroup.GetControl();
//       if (m[0].checked = !!u, s) {
//         SDUI.Commands.MainController.Selection.HideShowControl(t.TextDir.Id, !0);
//         var C = t.TextDirBox.GetControl();
//         C[0].checked = !!o
//       } else SDUI.Commands.MainController.Selection.HideShowControl(t.TextDir.Id, !1);
//       if (S) {
//         SDUI.Commands.MainController.Selection.HideShowControl(t.TitleRow.Id, !0);
//         var y = t.TitleRowBox.GetControl();
//         y[0].checked = !!l
//       } else SDUI.Commands.MainController.Selection.HideShowControl(t.TitleRow.Id, !1);
//       return !0
//     },
//     this.HighlightFrameOptions = function () {
//       var e = Resources.DocumentContext;
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.FrameOptions.GetControl());
//       var t = Resources.Controls.DD_FrameOptions,
//         a = e.AutoContainer,
//         r = e.SwimlaneTitle,
//         i = !1,
//         n = !1,
//         o = GlobalDatagFlowChartManager.GetSwimlaneID(null, !0);
//       if (o) {
//         var s = GlobalData.optManager.GetObjectPtr(o.ID);
//         s &&
//           (
//             a = (
//               s.moreflags & ConstantData.ObjMoreFlags.SED_MF_AutoContainer
//             ) > 0,
//             i = (
//               s.moreflags & ConstantData.ObjMoreFlags.SED_MF_Frame_AllowNesting
//             ) > 0,
//             n = (s.moreflags & ConstantData.ObjMoreFlags.SED_MF_Frame_Group) > 0,
//             r = GlobalData.optManager.Swimlane_HasTitleRow(s)
//           )
//       }
//       var l = t.AutoResize.GetControl();
//       l[0].checked = !a;
//       var S = t.AllowNesting.GetControl();
//       S[0].checked = !!i;
//       var c = t.FrameGroup.GetControl();
//       c[0].checked = !!n,
//         SDUI.Commands.MainController.Selection.HideShowControl(t.TitleRow.Id, !0);
//       var u = t.TitleRowBox.GetControl();
//       return u[0].checked = !!r,
//         !0
//     },
//     this.HighlightSwimLaneLineToolSelection = function () {
//       var e = Resources.DocumentContext;
//       e.LineTool;
//       var t = Resources.Controls.DD_LineToolSwimlanes;
//       this.RemoveHighlightsUnder(
//         Resources.Controls.Dropdowns.LineToolSwimlanes.GetControl()
//       );
//       var a = null;
//       switch (e.LineTool) {
//         case Resources.LineToolTypes.ArcLine:
//           a = t.CurvedLine;
//           break;
//         case Resources.LineToolTypes.SegmentedLine:
//           a = t.ShapeConnector;
//           break;
//         case Resources.LineToolTypes.StraightLine:
//           a = t.StraightLine;
//           break;
//         case Resources.LineToolTypes.ArcSegmentedLine:
//           a = t.CurvedConnector;
//           break;
//         default:
//           a = null
//       }
//       return null != a &&
//         (
//           null != (a = a.GetControl()) &&
//           (a.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HighlightEngineeringLineToolSelection = function () {
//       var e = Resources.DocumentContext;
//       e.LineTool;
//       var t = Resources.Controls.DD_LineToolEngineering;
//       this.RemoveHighlightsUnder(
//         Resources.Controls.Dropdowns.LineToolEngineering.GetControl()
//       );
//       var a = null;
//       switch (e.LineTool) {
//         case Resources.LineToolTypes.ArcLine:
//           a = t.CurvedLine;
//           break;
//         case Resources.LineToolTypes.SegmentedLine:
//           a = t.ShapeConnector;
//           break;
//         case Resources.LineToolTypes.StraightLine:
//           a = t.StraightLine;
//           break;
//         case Resources.LineToolTypes.ArcSegmentedLine:
//           a = t.CurvedConnector;
//           break;
//         case Resources.LineToolTypes.CommLine:
//           a = t.Comm;
//           break;
//         case Resources.LineToolTypes.DigiLine:
//           a = t.Digi;
//           break;
//         default:
//           a = null
//       }
//       return null != a &&
//         (
//           null != (a = a.GetControl()) &&
//           (a.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HighlightCustomThemeSelection = function () {
//       const t = Resources.Controls.Dropdowns.Themes.GetControl(),
//         a = Resources.Controls.Dropdowns.ThemeMore.GetControl(),
//         r = Resources.Controls.Dropdowns.ThemeLegacy.GetControl(),
//         i = $(
//           `[${Constants.Attr_ThemeName}=${Resources.CurrentTheme.Name}]`,
//           t
//         );
//       return null != i &&
//         i.length > 0 &&
//         (
//           i.hasClass(Constants.Css_Selected) ||
//           (
//             this.RemoveHighlightsUnder(t),
//             i.addClass(Constants.Css_Selected),
//             this.RemoveHighlightsUnder(r),
//             this.RemoveHighlightsUnder(a)
//           )
//         ),
//         e = Resources.CurrentTheme.Name,
//         !0
//     },
//     this.HightThemeSelection = function () {
//       if (null == Resources.CurrentTheme) return !1;
//       var t = Resources.CurrentTheme.Name;
//       if (
//         SDUI.Commands &&
//         SDUI.Commands.MainController &&
//         SDUI.Commands.MainController.Theme &&
//         SDUI.Commands.MainController.Theme.IsCustomTheme(t)
//       ) return this.HighlightCustomThemeSelection();
//       if (t === e) return !0;
//       e = t;
//       var a = Resources.Controls.Dropdowns.Themes.GetControl(),
//         r = Resources.Controls.Dropdowns.ThemeMore.GetControl(),
//         i = Resources.Controls.Dropdowns.ThemeLegacy.GetControl(),
//         n = $('[' + Constants.Attr_ThemeName + '=' + t + ']', a);
//       return null != n &&
//         n.length > 0 ? (
//         this.RemoveHighlightsUnder(a),
//         n.addClass(Constants.Css_Selected),
//         this.RemoveHighlightsUnder(i),
//         this.RemoveHighlightsUnder(r),
//         !0
//       ) : null != (n = $('[' + Constants.Attr_ThemeName + '=' + t + ']', i)) &&
//         n.length > 0 ? (
//         this.RemoveHighlightsUnder(i),
//         n.addClass(Constants.Css_Selected),
//         this.RemoveHighlightsUnder(r),
//         !(
//           null != (
//             n = Resources.Controls.DD_Theme.ThemeSubLegacy.GetControl()
//           ) &&
//           n.length > 0
//         ) ||
//         (
//           this.RemoveHighlightsUnder(a),
//           n.addClass(Constants.Css_Selected),
//           !0
//         )
//       ) : null != (n = $('[' + Constants.Attr_ThemeName + '=' + t + ']', r)) &&
//       n.length > 0 &&
//       (
//         this.RemoveHighlightsUnder(r),
//         n.addClass(Constants.Css_Selected),
//         this.RemoveHighlightsUnder(i),
//         !(
//           null != (n = Resources.Controls.DD_Theme.ThemeSubMore.GetControl()) &&
//           n.length > 0
//         ) ||
//         (
//           this.RemoveHighlightsUnder(a),
//           n.addClass(Constants.Css_Selected),
//           !0
//         )
//       )
//     },
//     this.HighlightStyleSelection = function (e) {
//       var t = null == e ? ConstantData.DocumentContext.CurrentQuickStyle : e;
//       if (null == t) return !1;
//       if (t === a) return !0;
//       a = t;
//       var r = Resources.Controls.Dropdowns.Quickstyles.GetControl();
//       if (null == r) return !1;
//       var i = $('[' + Constants.Attr_QuickStyleId + '=' + t + ']', r);
//       if (null == i || 0 === i.length) return !1;
//       this.RemoveHighlightsUnder(r),
//         i.addClass(Constants.Css_Selected)
//     },
//     this.HighlightShapeToolSelection = function () {
//       var e = Resources.DocumentContext;
//       if (e.ShapeTool === t) return !0;
//       var a = null,
//         r = FileParser.SDRShapeTypes,
//         i = Resources.Controls.SmartPanel_Common.ShapeTool.GetControl(!0);
//       if (null != i) {
//         switch (e.ShapeTool) {
//           case r.SED_S_Oval:
//             a = Resources.Controls.DD_ShapeBasic.Oval;
//             break;
//           case r.SED_S_Rect:
//             a = Resources.Controls.DD_ShapeBasic.Rectangle;
//             break;
//           case r.SED_S_RRect:
//             a = Resources.Controls.DD_ShapeBasic.RoundedRectangle;
//             break;
//           case r.SED_S_Circ:
//             a = Resources.Controls.DD_ShapeBasic.Circle;
//             break;
//           case r.SED_S_Trap:
//             a = Resources.Controls.DD_ShapeBasic.Trapezoid;
//             break;
//           case r.SED_S_Pgm:
//             a = Resources.Controls.DD_ShapeBasic.Parallelogram;
//             break;
//           case r.SED_S_Diam:
//             a = Resources.Controls.DD_ShapeBasic.Diamond;
//             break;
//           case r.SED_S_Tri:
//             a = Resources.Controls.DD_ShapeBasic.Triangle;
//             break;
//           case r.SED_S_Term:
//             a = Resources.Controls.DD_ShapeBasic.Terminator;
//             break;
//           case r.SED_S_ArrR:
//             a = Resources.Controls.DD_ShapeBasic.ArrowRight;
//             break;
//           case r.SED_S_Input:
//             a = Resources.Controls.DD_ShapeBasic.Input;
//             break;
//           case r.SED_S_PentL:
//             a = Resources.Controls.DD_ShapeBasic.PentagonLeft;
//             break;
//           case r.SED_S_Store:
//             a = Resources.Controls.DD_ShapeBasic.Storage;
//             break;
//           default:
//             return !1
//         }
//         if (null == a) return !1;
//         var n = a.GetControl();
//         if (null != n && n.length > 0) {
//           var o = n[0].innerHTML.indexOf('icon="') + 6,
//             s = n[0].innerHTML.slice(o),
//             l = s.indexOf('"');
//           s = s.slice(0, l),
//             i[0].children[0].icon = s,
//             this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.ShapeBasic.GetControl()),
//             n.addClass(Constants.Css_Selected),
//             t = e.ShapeTool
//         }
//       }
//     },
//     this.HighlightSetScaleSelection = function () {
//       var e = Resources.Controls.DD_SetScale,
//         t = SDUI.Commands.MainController.Document.MenuScaleSelected(),
//         a = - 1,
//         r = 'dd-scale-precisionDecimal';
//       t ? (a = t.scale, C = t.index, m = a) : (C = - 1, m = - 1),
//         this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.SetScale.GetControl()),
//         this.RemoveHighlightsUnder(
//           Resources.Controls.Dropdowns.SetScaleArchitecture.GetControl()
//         ),
//         this.RemoveHighlightsUnder(
//           Resources.Controls.Dropdowns.SetScaleMetric.GetControl()
//         ),
//         this.RemoveHighlightsUnder(
//           Resources.Controls.Dropdowns.SetScaleMechEng.GetControl()
//         );
//       var i = null;
//       switch (a) {
//         case 0:
//           i = e.Architectural,
//             r = 'dd-scale-precisionFraction';
//           break;
//         case 1:
//           i = e.Metric;
//           break;
//         case 2:
//           i = e.MechEng;
//           break;
//         default:
//           i = e.Custom
//       }
//       if (null == i) return !1;
//       if (null == (i = i.GetControl())) return !1;
//       i.addClass(Constants.Css_Selected);
//       var n = e.Precision.GetControl();
//       n &&
//         (
//           n[0].attributes.getNamedItem(Constants.Attr_DropdownId).value = r
//         );
//       return !0
//     },
//     this.HighlightSubScaleSelection = function () {
//       var e,
//         t,
//         a = null;
//       switch (m) {
//         case 0:
//           e = Resources.Controls.DD_SetScale_Architecture,
//             t = Resources.Controls.Dropdowns.SetScaleArchitecture.GetControl();
//           break;
//         case 1:
//           e = Resources.Controls.DD_SetScale_Metric,
//             t = Resources.Controls.Dropdowns.SetScaleMetric.GetControl();
//           break;
//         case 2:
//           e = Resources.Controls.DD_SetScale_MechEng,
//             t = Resources.Controls.Dropdowns.SetScaleMechEng.GetControl();
//           break;
//         default:
//           return
//       }
//       return a = e[C.toString()],
//         this.RemoveHighlightsUnder(t),
//         null != a &&
//         (
//           null != (a = a.GetControl()) &&
//           (a.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HighlightPrecision = function (e, t) {
//       var a,
//         r,
//         i;
//       for (var n in e) (a = e[n].GetControl()) &&
//         (
//           a.removeClass(Constants.Css_Selected),
//           (
//             r = a[0].attributes.getNamedItem(Constants.Attr_PrintScaleType)
//           ) &&
//           (i = parseInt(r.value)),
//           i === t &&
//           a.addClass(Constants.Css_Selected)
//         )
//     },
//     this.HighlightWallThickness = function () {
//       var e,
//         t,
//         a,
//         r,
//         i = Resources.Controls.DD_WallTool.WallThicknessInterior.GetControl(),
//         n = Resources.Controls.DD_WallTool.WallThicknessExterior.GetControl(),
//         o = Resources.Controls.DD_WallTool.WallThicknessMetricInterior.GetControl(),
//         s = Resources.Controls.DD_WallTool.WallThicknessMetricExterior.GetControl(),
//         l = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1),
//         S = 0,
//         c = GlobalData.optManager.GetDrawingScale(gDocumentHandler.rulerSettings),
//         u = 48,
//         p = 1;
//       gDocumentHandler.rulerSettings.useInches ? (
//         i.removeClass('hide'),
//         n.removeClass('hide'),
//         o.addClass('hide'),
//         s.addClass('hide'),
//         S = (S = l.def.wallThickness > 0 ? l.def.wallThickness : 8.33333) * (gDocumentHandler.rulerSettings.majorScale * p) / gDocumentHandler.rulerSettings.major,
//         t = i[0].attributes.getNamedItem(Constants.Attr_LineThickness),
//         e = parseFloat(t.value),
//         r = n[0].attributes.getNamedItem(Constants.Attr_LineThickness),
//         a = parseFloat(r.value),
//         Utils2.IsEqual(e, S, 0.01) ? (
//           i.addClass(Constants.Css_Selected),
//           n.removeClass(Constants.Css_Selected)
//         ) : Utils2.IsEqual(a, S, 0.01) ? (
//           i.removeClass(Constants.Css_Selected),
//           n.addClass(Constants.Css_Selected)
//         ) : (
//           i.removeClass(Constants.Css_Selected),
//           n.removeClass(Constants.Css_Selected)
//         )
//       ) : (
//         i.addClass('hide'),
//         n.addClass('hide'),
//         o.removeClass('hide'),
//         s.removeClass('hide'),
//         u = 50,
//         p = ConstantData.Defines.MetricConv,
//         S = (
//           S = l.def.wallThickness > 0 ? l.def.wallThickness : 11.811023622047243 * u / c
//         ) * (gDocumentHandler.rulerSettings.majorScale * p) / gDocumentHandler.rulerSettings.major,
//         t = o[0].attributes.getNamedItem(Constants.Attr_LineThickness),
//         e = parseFloat(t.value),
//         r = s[0].attributes.getNamedItem(Constants.Attr_LineThickness),
//         a = parseFloat(r.value),
//         Utils2.IsEqual(e, S, 0.01) ? (
//           o.addClass(Constants.Css_Selected),
//           s.removeClass(Constants.Css_Selected)
//         ) : Utils2.IsEqual(a, S, 0.01) ? (
//           o.removeClass(Constants.Css_Selected),
//           s.addClass(Constants.Css_Selected)
//         ) : (
//           o.removeClass(Constants.Css_Selected),
//           s.removeClass(Constants.Css_Selected)
//         )
//       )
//     },
//     this.HighlightLineThickness = function () {
//       var e = Resources.Controls.DD_LineThickness,
//         t = g.Line.Thickness;
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.LineThickness.GetControl());
//       var a = null;
//       if (t >= 0) switch (t) {
//         case 0:
//           a = e.Thick0;
//           break;
//         case 1:
//           a = e.Thick1;
//           break;
//         case 2:
//           a = e.Thick2;
//           break;
//         case 3:
//           a = e.Thick3;
//           break;
//         case 5:
//           a = e.Thick5;
//           break;
//         case 8:
//           a = e.Thick8;
//           break;
//         default:
//           a = e.ThickCustom
//       }
//       return null != a &&
//         (
//           null != (a = a.GetControl()) &&
//           (a.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HiliteArrowheadMenu = function (e) {
//       var t = Resources.Controls.DD_Arrowheads,
//         a = ListManager.ArrowHeadTypes.ARR_FILL;
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.Arrowheads.GetControl());
//       var r = null;
//       return e &&
//         (
//           r = e.StartArrowID === a &&
//             e.EndArrowID === a ? t.Both : e.StartArrowID === a ? t.Left : e.EndArrowID === a ? t.Right : e.StartArrowID > 0 ||
//               e.EndArrowID > 0 ? t.Custom : t.None
//         ),
//         null != r &&
//         (
//           null != (r = r.GetControl()) &&
//           (r.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HiliteArrowheadERDMenu = function (e) {
//       var t = Resources.Controls.Dropdowns.ArrowheadsERD.GetControl();
//       this.RemoveHighlightsUnder(t);
//       var a,
//         r = e.StartArrowID.toString(),
//         i = e.EndArrowID.toString();
//       return null != (a = $('[arrowheadId =' + r + '][arrowheadLocation=\'startonly\']', t)) &&
//         a.length > 0 &&
//         a.addClass(Constants.Css_Selected),
//         null != (a = $('[arrowheadId =' + i + '][arrowheadLocation=\'endonly\']', t)) &&
//         a.length > 0 &&
//         a.addClass(Constants.Css_Selected),
//         !0
//     },
//     this.HighlightLinePattern = function () {
//       var e = Resources.Controls.DD_LineStyle,
//         t = g.Line.LinePattern;
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.LineStyle.GetControl());
//       var a = null;
//       if (- 1 !== t) switch (t) {
//         case 0:
//           a = e.Solid;
//           break;
//         case '1,1':
//           a = e.Dotted;
//           break;
//         case '3,1':
//           a = e.Dashed;
//           break;
//         case '3,1,1,1':
//           a = e.DashDot;
//           break;
//         case '3,1,1,1,1,1':
//           a = e.DashDotDot
//       }
//       return null != a &&
//         (
//           null != (a = a.GetControl()) &&
//           (a.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HighlightCustomThemeLinePattern = function () {
//       if (!SDUI.Commands.MainController.CustomThemeDialogController) return !0;
//       this.RemoveHighlightsUnder(
//         Resources.Controls.Dropdowns.CustomThemeLineStyle.GetControl()
//       );
//       const e = SDUI.Commands.MainController.CustomThemeDialogController.GetCustomLineStyle(),
//         t = [
//           {
//             value: 'solid',
//             control: Resources.Controls.DD_CustomThemeLineStyle.Solid
//           },
//           {
//             value: 'dotted',
//             control: Resources.Controls.DD_CustomThemeLineStyle.Dotted
//           },
//           {
//             value: 'dashed',
//             control: Resources.Controls.DD_CustomThemeLineStyle.Dashed
//           },
//           {
//             value: 'dashdot',
//             control: Resources.Controls.DD_CustomThemeLineStyle.DashDot
//           },
//           {
//             value: 'dashdotdot',
//             control: Resources.Controls.DD_CustomThemeLineStyle.DashDotDot
//           }
//         ].find((t => t.value.toLowerCase() === e.toLowerCase()));
//       if (!t) return !0;
//       const a = t.control.GetControl();
//       return a &&
//         a.addClass(Constants.Css_Selected),
//         !0
//     },
//     this.HighlightCustomThemeLineThickness = function () {
//       if (!SDUI.Commands.MainController.CustomThemeDialogController) return !0;
//       this.RemoveHighlightsUnder(
//         Resources.Controls.Dropdowns.CustomThemeLineThickness.GetControl()
//       );
//       const e = SDUI.Commands.MainController.CustomThemeDialogController.GetCustomLineThickness(),
//         t = [
//           {
//             value: '0px',
//             control: Resources.Controls.DD_CustomThemeLineThickness.Thick0
//           },
//           {
//             value: '1px',
//             control: Resources.Controls.DD_CustomThemeLineThickness.Thick1
//           },
//           {
//             value: '2px',
//             control: Resources.Controls.DD_CustomThemeLineThickness.Thick2
//           },
//           {
//             value: '3px',
//             control: Resources.Controls.DD_CustomThemeLineThickness.Thick3
//           },
//           {
//             value: '5px',
//             control: Resources.Controls.DD_CustomThemeLineThickness.Thick5
//           },
//           {
//             value: '8px',
//             control: Resources.Controls.DD_CustomThemeLineThickness.Thick8
//           }
//         ].find((t => t.value.toLowerCase() === e.toLowerCase()));
//       if (!t) return !0;
//       const a = t.control.GetControl();
//       return a &&
//         a.addClass(Constants.Css_Selected),
//         !0
//     },
//     this.HighlightEffects = function () {
//       var e = Resources.Controls.DD_Effects,
//         t = g.Fill.FillEffect,
//         a = g.OutsideEffect.OutsideType,
//         r = FileParser.FillEffect,
//         i = FileParser.OutEffect;
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.Effects.GetControl());
//       var n = null;
//       if (- 1 !== t) switch (t) {
//         case r.SDFILL_EFFECT_NONE:
//           n = e.NoInside;
//           break;
//         case r.SDFILL_EFFECT_INSHADOW:
//           n = e.InnerShadow;
//           break;
//         case r.SDFILL_EFFECT_INGLOW:
//           n = e.InnerGlow;
//           break;
//         case r.SDFILL_EFFECT_BEVEL:
//           n = e.Bevel;
//           break;
//         case r.SDFILL_EFFECT_GLOSS:
//           n = e.Gloss
//       }
//       if (null == n) return !1;
//       if (null == (n = n.GetControl())) return !1;
//       if (n.addClass(Constants.Css_Selected), n = null, - 1 !== a) switch (a) {
//         case i.SDOUT_EFFECT_NONE:
//           n = e.NoOutside;
//           break;
//         case i.SDOUT_EFFECT_DROP:
//           n = e.Shadow;
//           break;
//         case i.SDOUT_EFFECT_CAST:
//           n = e.CastShadow;
//           break;
//         case i.SDOUT_EFFECT_GLOW:
//           n = e.Glow;
//           break;
//         case i.SDOUT_EFFECT_REFL:
//           n = e.Reflection
//       }
//       return null != n &&
//         (
//           null != (n = n.GetControl()) &&
//           (n.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HighlightInsideEffectMenu = function (e, t, a) {
//       var r = g.Fill.FillEffect;
//       FileParser.FillEffect;
//       if (this.RemoveHighlightsUnder(t.GetControl()), r === e) {
//         var i,
//           n,
//           o,
//           s = null,
//           l = 0;
//         for (
//           n = Resources.CurrentTheme.InsideEffects.length,
//           i = 0;
//           i < n;
//           i++
//         ) if (Resources.CurrentTheme.InsideEffects[i].Effect === e) {
//           if (
//             l++,
//             (
//               (o = Resources.CurrentTheme.InsideEffects[i]).EffectColor === g.Fill.EffectColor ||
//               null === o.EffectColor
//             ) &&
//             o.LParam === g.Fill.LParam &&
//             o.WParam === g.Fill.WParam
//           ) {
//             s = a[l.toString()];
//             break
//           }
//         } else if (l) break;
//         return null != s &&
//           (
//             null != (s = s.GetControl()) &&
//             (s.addClass(Constants.Css_Selected), !0)
//           )
//       }
//     },
//     this.HighlightOutsideEffectMenu = function (e, t, a) {
//       var r = g.OutsideEffect.OutsideType;
//       if (this.RemoveHighlightsUnder(t.GetControl()), r === e) {
//         var i,
//           n,
//           o,
//           s = null,
//           l = 0;
//         for (
//           n = Resources.CurrentTheme.OutsideEffects.length,
//           i = 0;
//           i < n;
//           i++
//         ) if (
//             Resources.CurrentTheme.OutsideEffects[i].OutsideType === e
//           ) {
//             if (
//               l++,
//               (o = Resources.CurrentTheme.OutsideEffects[i]).Color === g.OutsideEffect.Color &&
//               o.LParam === g.OutsideEffect.LParam &&
//               o.WParam === g.OutsideEffect.WParam &&
//               o.OutsideExtent_Bottom === g.OutsideEffect.OutsideExtent_Bottom &&
//               o.OutsideExtent_Left === g.OutsideEffect.OutsideExtent_Left &&
//               o.OutsideExtent_Right === g.OutsideEffect.OutsideExtent_Right &&
//               o.OutsideExtent_Top === g.OutsideEffect.OutsideExtent_Top
//             ) {
//               s = a[l.toString()];
//               break
//             }
//           } else if (l) break;
//         return null != s &&
//           (
//             null != (s = s.GetControl()) &&
//             (s.addClass(Constants.Css_Selected), !0)
//           )
//       }
//     },
//     this.HighlightSetSnapsSelection = function () {
//       var e,
//         t = Resources.Controls.DD_SetSnaps;
//       return this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.SetSnaps.GetControl()),
//         null != (
//           e = gDocumentHandler.documentConfig.enableSnap ? gDocumentHandler.documentConfig.centerSnap ? t.Center : t.TopLeft : t.NoSnaps
//         ) &&
//         (
//           null != (e = e.GetControl()) &&
//           (e.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HighlightPrintOrientationSelection = function () {
//       var e,
//         t = Resources.Controls.DD_SetOrientation,
//         a = gDocumentHandler.GetPrintSettings();
//       return this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.Orientation.GetControl()),
//         null != (e = 'portrait' === a.orientation ? t.Portrait : t.Landscape) &&
//         (
//           null != (e = e.GetControl()) &&
//           (e.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.HighlightSpellOptionSelection = function () {
//       var e = Resources.Controls.DD_SpellOptions,
//         t = gDocumentHandler.svgDoc.GetSpellCheck().GetSpellFlags();
//       this.RemoveHighlightsUnder(
//         Resources.Controls.Dropdowns.SpellOptionsDD.GetControl()
//       );
//       var a = e.SpellIgnoreCaps.GetControl();
//       return a &&
//         t & Globals.SpellFlags.IgnoreAllCaps &&
//         a.addClass(Constants.Css_Selected),
//         (a = e.SpellInitCaps.GetControl()) &&
//         t & Globals.SpellFlags.IgnoreInitCaps &&
//         a.addClass(Constants.Css_Selected),
//         (a = e.SpellAlphaNum.GetControl()) &&
//         t & Globals.SpellFlags.IgnoreMixedAlphaNum &&
//         a.addClass(Constants.Css_Selected),
//         !0
//     },
//     this.HighlightChartsDataSelection = function () {
//       var e = Resources.Controls.DD_ChartsData,
//         t = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (t < 0) return !1;
//       var a = GlobalData.optManager.GetObjectPtr(t, !1).GetGraph(!1);
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.ChartsData.GetControl());
//       var r = e.HideDataLabels.GetControl();
//       return !r ||
//         a.pointflags & ListManager.Graph.PointFlags.SDAX_VALUELABELS ||
//         r.addClass(Constants.Css_Selected),
//         a.pointflags & ListManager.Graph.PointFlags.SDAX_VALUELABELS &&
//         (
//           (r = e.OutsideLabels.GetControl()) &&
//           a.pointflags & ListManager.Graph.PointFlags.SDAX_VALUELABELS_EXTERNAL &&
//           !(
//             a.pointflags & ListManager.Graph.PointFlags.SDAX_VALUELABELS_ANGLED
//           ) &&
//           r.addClass(Constants.Css_Selected),
//           (r = e.OutsideAngle.GetControl()) &&
//           a.pointflags & ListManager.Graph.PointFlags.SDAX_VALUELABELS_EXTERNAL &&
//           a.pointflags & ListManager.Graph.PointFlags.SDAX_VALUELABELS_ANGLED &&
//           r.addClass(Constants.Css_Selected),
//           (r = e.OutsideAngledLeader.GetControl()) &&
//           a.pointflags & ListManager.Graph.PointFlags.SDAX_VALUELABELS_EXTERNAL_LEADERS &&
//           a.pointflags & ListManager.Graph.PointFlags.SDAX_VALUELABELS_ANGLED &&
//           r.addClass(Constants.Css_Selected)
//         ),
//         !0
//     },
//     this.HighlightChartsAxesSelection = function () {
//       var e = Resources.Controls.DD_ChartAxes,
//         t = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (t < 0) return !1;
//       var a = GlobalData.optManager.GetObjectPtr(t, !1).GetGraph(!1);
//       return this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.ChartAxes.GetControl()),
//         a.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags & ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE &&
//           a.axes[ListManager.Graph.Defines.SDAX_VERT].flags & ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE ? e.HideBoth.GetControl().addClass(Constants.Css_Selected) : a.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags & ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE ||
//             a.axes[ListManager.Graph.Defines.SDAX_VERT].flags & ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE ? (
//           a.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags & ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE ||
//           e.ShowHorizontal.GetControl().addClass(Constants.Css_Selected),
//           a.axes[ListManager.Graph.Defines.SDAX_VERT].flags & ListManager.Graph.AxisFlags.SDAX_HIDE_AXIS_LINE ||
//           e.ShowVertical.GetControl().addClass(Constants.Css_Selected)
//         ) : e.ShowBoth.GetControl().addClass(Constants.Css_Selected),
//         !0
//     },
//     this.HighlightAxisMenuSelection = function (e) {
//       var t = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (t < 0) return !1;
//       var a = GlobalData.optManager.GetObjectPtr(t, !1).GetGraph(!1),
//         r = null,
//         i = null,
//         n = !1;
//       e === Resources.Controls.Dropdowns.HorizontalAxis.Id.toLowerCase() ? (
//         r = a.axes[ListManager.Graph.Defines.SDAX_HORIZ],
//         i = Resources.Controls.DD_HorizontalAxis,
//         this.RemoveHighlightsUnder(
//           Resources.Controls.Dropdowns.HorizontalAxis.GetControl()
//         ),
//         n = !0
//       ) : (
//         r = a.axes[ListManager.Graph.Defines.SDAX_VERT],
//         i = Resources.Controls.DD_VerticalAxis,
//         this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.VerticalAxis.GetControl())
//       );
//       var o = n ? i.NoHorizontalAxisLabels.GetControl() : i.NoVerticalAxisLabels.GetControl();
//       return o &&
//         r.flags & ListManager.Graph.AxisFlags.SDAX_HIDE_LABELS ? o.addClass(Constants.Css_Selected) : !(
//           o = n ? i.ShowHorizontalAxisLabels.GetControl() : i.ShowVerticalAxisLabels.GetControl()
//         ) ||
//         r.flags & ListManager.Graph.AxisFlags.SDAX_HIDE_LABELS ||
//       o.addClass(Constants.Css_Selected),
//         r.flags & ListManager.Graph.AxisFlags.SDAX_HIDE_LABELS ||
//         (
//           o = n ? i.AngleHorizontalAxisLabels.GetControl() : i.AngleVerticalAxisLabels.GetControl()
//         ) &&
//         r.flags & ListManager.Graph.AxisFlags.SDAX_LABELS_ANGLED &&
//         o.addClass(Constants.Css_Selected),
//         (o = i.ShowMinorTickMarks.GetControl()) &&
//         r.flags & ListManager.Graph.AxisFlags.SDAX_HIDE_MINOR_TICKS &&
//         o.addClass(Constants.Css_Selected),
//         (o = i.ShowMajorTickMarks.GetControl()) &&
//         r.flags & ListManager.Graph.AxisFlags.SDAX_HIDE_MAJOR_TICKS &&
//         o.addClass(Constants.Css_Selected),
//         !(
//           o = n ? i.ShowHorizontalAxisTitle.GetControl() : i.ShowVerticalAxisTitle.GetControl()
//         ) ||
//         r.flags & ListManager.Graph.AxisFlags.SDAX_HIDE_TITLE ||
//         o.addClass(Constants.Css_Selected),
//         !0
//     },
//     this.GetAppropriateTimeMeasureMenuItem = function (e) {
//       var t = e.GetGanttInfo();
//       if (t) {
//         var a = Resources.Controls.DD_TimeMeasure,
//           r = null;
//         if (
//           t.flags & ListManager.Table.GanttGridFlags.SDGF_FIT_TO_WINDOW
//         ) r = a.Auto;
//         else switch (t.timeScale) {
//           case 2:
//             r = a.Years;
//             break;
//           case 3:
//             r = a.Quarters;
//             break;
//           case 11:
//             r = a.Months;
//             break;
//           case 1:
//             r = a.DaysByMonths;
//             break;
//           case 5:
//             r = a.Weeks;
//             break;
//           case 4:
//             r = a.DaysByWeeks;
//             break;
//           case 17:
//             r = a.Hours
//         }
//         return r
//       }
//     },
//     this.GetAppropriateTimeMeasureMenuControl = function (e) {
//       return this.GetAppropriateTimeMeasureMenuItem(e).GetControl()
//     },
//     this.HighlightTimeMeasureMenuSelection = function () {
//       var e;
//       if (
//         GlobalData.optManager.RightClickParams &&
//         (
//           e = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.RightClickParams.TargetID)
//         ),
//         null != e
//       ) {
//         this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.TimeMeasure.GetControl());
//         var t = this.GetAppropriateTimeMeasureMenuControl(e);
//         return t &&
//           t.addClass(Constants.Css_Selected),
//           !0
//       }
//     },
//     this.HighlightHolidayCountryMenuSelection = function () {
//       if (
//         obj = GlobalData.optManager.GetCurrentPlanningTable(ConstantData.ObjectTypes.SD_OBJT_GANTT_CHART, !1),
//         obj
//       ) {
//         this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.Holidays.GetControl());
//         var e = Resources.Controls.Modal_ProjectOptions.HolidayCountry.GetControl()[0].innerText;
//         e = e.toUpperCase();
//         var t = null;
//         for (var a in Resources.Controls.DD_Holidays) {
//           var r = Resources.Controls.DD_Holidays[a];
//           label = r.Id;
//           var i = label.lastIndexOf('-');
//           if (
//             i > 0 &&
//             (label = label.substring(i + 1)),
//             label = label.toUpperCase(),
//             label === e
//           ) {
//             t = r.GetControl();
//             break
//           }
//         }
//         return t &&
//           t.addClass(Constants.Css_Selected),
//           !0
//       }
//     },
//     this.HighlightUMLLines = function (e) {
//       var t,
//         a,
//         r,
//         i,
//         n,
//         o = !1,
//         s = new ListManager.ArrowheadRecord,
//         l = this.GetStyleInUse(null, s).Line.LinePattern;
//       for (var S in e) (t = e[S].GetControl()) &&
//         (
//           t.removeClass(Constants.Css_Selected),
//           (
//             a = t[0].attributes.getNamedItem(Constants.Attr_ArrowheadStart)
//           ) &&
//           (i = parseInt(a.value)),
//           (
//             r = t[0].attributes.getNamedItem(Constants.Attr_ArrowheadEnd)
//           ) &&
//           (n = parseInt(r.value)),
//           o = 43 === n ||
//           43 === i,
//           t[0].attributes.getNamedItem(Constants.Attr_LineDashPattern).value == l &&
//           (
//             s.StartArrowID === i &&
//             s.EndArrowID === n ||
//             !o &&
//             s.StartArrowID === n &&
//             s.EndArrowID === i
//           ) &&
//           t.addClass(Constants.Css_Selected)
//         )
//     },
//     this.HighlightBPMNIconSelection = function (e) {
//       if (gListManager && GlobalData.optManager.Table_GetCellIcons) {
//         var t,
//           a,
//           r,
//           i = GlobalData.optManager.Table_GetCellIcons(GlobalData.optManager.SelectionState.tselect);
//         for (var n in i.length, e) (t = e[n].GetControl()) &&
//           (
//             t.removeClass(Constants.Css_Selected),
//             (a = t[0].attributes.getNamedItem(Constants.Attr_IconID)) &&
//             (
//               r = parseInt(a.value),
//               i.indexOf(r) >= 0 &&
//               t.addClass(Constants.Css_Selected)
//             )
//           )
//       }
//     },
//     this.HighlightBPMNSubtypeSelection = function (e) {
//       var t,
//         a;
//       for (var r in e) (t = e[r].GetControl()) &&
//         (
//           t.removeClass(Constants.Css_Selected),
//           (a = t[0].attributes.getNamedItem(Constants.Attr_SubType)) &&
//           parseInt(a.value) === ConstantData.DocumentContext.CurrentSubType &&
//           t.addClass(Constants.Css_Selected)
//         )
//     },
//     this.HighlightBPMNLineThicknessSelection = function (e) {
//       var t,
//         a;
//       if (gListManager && GlobalData.optManager.GetSelectedStyle) {
//         var r = GlobalData.optManager.GetSelectedStyle(null, null);
//         if (r && r.Line) for (var i in e) (t = e[i].GetControl()) &&
//           (
//             t.removeClass(Constants.Css_Selected),
//             (
//               a = t[0].attributes.getNamedItem(Constants.Attr_LineThickness)
//             ) &&
//             parseInt(a.value) === r.Line.Thickness &&
//             t.addClass(Constants.Css_Selected)
//           )
//       }
//     },
//     this.GetBPMNLineThicknessData = function (e) {
//       var t,
//         a,
//         r = {
//           label: '',
//           iconclass: ''
//         };
//       if (gListManager && GlobalData.optManager.GetSelectedStyle) {
//         var i = GlobalData.optManager.GetSelectedStyle(null, null);
//         if (i && i.Line) for (var n in e) if (
//           (t = e[n].GetControl()) &&
//           (
//             a = t[0].attributes.getNamedItem(Constants.Attr_LineThickness)
//           ) &&
//           parseInt(a.value) === i.Line.Thickness
//         ) return r.iconclass = t[0].children[0].childNodes[0].classList.value,
//           r.label = t[0].children[0].childNodes[1].wholeText,
//           r
//       }
//       return r
//     },
//     this.GetBPMNSubtypeData = function (e) {
//       var t,
//         a,
//         r = {
//           label: '',
//           iconclass: ''
//         };
//       for (var i in e) if (
//         (t = e[i].GetControl()) &&
//         (a = t[0].attributes.getNamedItem(Constants.Attr_SubType)) &&
//         parseInt(a.value) === ConstantData.DocumentContext.CurrentSubType
//       ) return r.iconclass = t[0].children[0].childNodes[0].classList.value,
//         r.label = t[0].children[0].childNodes[1].wholeText,
//         r;
//       return null
//     },
//     this.GetBPMNIconData = function (e) {
//       var t,
//         a,
//         r,
//         i = {
//           label: 'None',
//           iconclass: ''
//         },
//         n = GlobalData.optManager.Table_GetCellIcons(GlobalData.optManager.SelectionState.tselect);
//       for (var o in e) if (
//         (t = e[o].GetControl()) &&
//         (a = t[0].attributes.getNamedItem(Constants.Attr_IconID)) &&
//         (r = parseInt(a.value), n.indexOf(r) >= 0)
//       ) return i.iconclass = t[0].children[0].childNodes[0].classList.value,
//         i.label = t[0].children[0].childNodes[1].wholeText,
//         i;
//       return i
//     },
//     this.GetBPMNObjecttypeData = function (e) {
//       var t,
//         a,
//         r = {
//           label: '',
//           iconclass: ''
//         };
//       for (var i in e) if (
//         (t = e[i].GetControl()) &&
//         (
//           a = t[0].attributes.getNamedItem(Constants.Attr_ObjectType)
//         ) &&
//         parseInt(a.value) === ConstantData.DocumentContext.CurrentObjType
//       ) return r.iconclass = t[0].children[0].childNodes[0].classList.value,
//         r.label = t[0].children[0].childNodes[1].wholeText,
//         r;
//       return null
//     },
//     this.HighlightBPMNObjecttypeSelection = function (e) {
//       var t,
//         a;
//       for (var r in e) (t = e[r].GetControl()) &&
//         (
//           t.removeClass(Constants.Css_Selected),
//           (
//             a = t[0].attributes.getNamedItem(Constants.Attr_ObjectType)
//           ) &&
//           parseInt(a.value) === ConstantData.DocumentContext.CurrentObjType &&
//           t.addClass(Constants.Css_Selected)
//         )
//     },
//     this.HighlightContainerContext = function () {
//       var e = Resources.Controls.CTX_BuilderContainer.Adjust.GetControl(),
//         t = (
//           ConstantData.DocumentContext.CurrentContainerList.flags & ConstantData.ContainerListFlags.Adjust
//         ) > 0,
//         a = (
//           ConstantData.DocumentContext.CurrentContainerList.flags & ConstantData.ContainerListFlags.Sparse
//         ) > 0;
//       e &&
//         (
//           a ? (
//             e.removeClass(Constants.Css_Selected),
//             e.removeClass(Constants.Css_Enabled),
//             e.addClass(Constants.Css_Disabled)
//           ) : (
//             e.removeClass(Constants.Css_Disabled),
//             e.addClass(Constants.Css_Enabled),
//             t ? e.addClass(Constants.Css_Selected) : e.removeClass(Constants.Css_Selected)
//           )
//         )
//     },
//     this.HighlightCellTypeSelection = function (e, t) {
//       var a,
//         r,
//         i;
//       for (var n in e) (a = (i = e[n]).GetControl()) &&
//         (
//           a.removeClass(Constants.Css_Selected),
//           (r = a[0].attributes.getNamedItem(Constants.Attr_ItemId)) &&
//           (
//             0 === (i = parseInt(r.value)) ? i === t.rowtype &&
//               i === t.coltype &&
//               a.addClass(Constants.Css_Selected) : i !== t.rowtype &&
//               i !== t.coltype ||
//             a.addClass(Constants.Css_Selected)
//           )
//         )
//     },
//     this.HighlightContainerSelection = function (e, t) {
//       var a,
//         r,
//         i,
//         n,
//         o = null;
//       for (var s in e) (r = (a = e[s]).GetControl()) &&
//         (
//           r.removeClass(Constants.Css_Selected),
//           (i = r[0].attributes.getNamedItem(Constants.Attr_ItemId)) &&
//           (
//             - 1 === (a = parseInt(i.value)) &&
//             (o = r),
//             a === t &&
//             (n = r, r.addClass(Constants.Css_Selected))
//           )
//         );
//       null == n &&
//         (r = o) &&
//         r.addClass(Constants.Css_Selected)
//     },
//     this.HighlightChartRotateMenuSelection = function () {
//       var e = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (e < 0) return !1;
//       var t = GlobalData.optManager.GetObjectPtr(e, !1).GetGraph(!1),
//         a = Resources.Controls.DD_ChartRotate;
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.ChartRotate.GetControl());
//       var r = null;
//       switch (t.quadrant) {
//         case 0:
//           r = a.Quadrant1.GetControl();
//           break;
//         case 1:
//           r = a.Quadrant2.GetControl();
//           break;
//         case 2:
//           r = a.Quadrant3.GetControl();
//           break;
//         case 3:
//           r = a.Quadrant4.GetControl()
//       }
//       return r &&
//         r.addClass(Constants.Css_Selected),
//         !0
//     },
//     this.HighlightGridMenuSelection = function () {
//       var e = GlobalData.optManager.Graph_GetActiveID(!0);
//       if (e < 0) return !1;
//       var t = GlobalData.optManager.GetObjectPtr(e, !1).GetGraph(!1),
//         a = Resources.Controls.DD_ChartsGrid;
//       this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.ChartsGrid.GetControl());
//       var r = null;
//       return (
//         r = t.axes[ListManager.Graph.Defines.SDAX_VERT].flags & ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MINOR &&
//           t.axes[ListManager.Graph.Defines.SDAX_VERT].flags & ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MAJOR ? a.HorizontalMajorandMinorGridlines.GetControl() : t.axes[ListManager.Graph.Defines.SDAX_VERT].flags & ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MAJOR ? a.HorizontalMajorGridlines.GetControl() : t.axes[ListManager.Graph.Defines.SDAX_VERT].flags & ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MINOR ? a.HorizontalMinorGridlines.GetControl() : a.HorizontalNone.GetControl()
//       ) &&
//         r.addClass(Constants.Css_Selected),
//         r = null,
//         (
//           r = t.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags & ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MINOR &&
//             t.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags & ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MAJOR ? a.VerticalMajorandMinorGridlines.GetControl() : t.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags & ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MAJOR ? a.VerticalMajorGridlines.GetControl() : t.axes[ListManager.Graph.Defines.SDAX_HORIZ].flags & ListManager.Graph.AxisFlags.SDAX_SHOW_GRID_LINE_MINOR ? a.VerticalMinorGridlines.GetControl() : a.VerticalNone.GetControl()
//         ) &&
//         r.addClass(Constants.Css_Selected),
//         !0
//     },
//     this.HighlightMarginSelection = function () {
//       var e,
//         t = Resources.Controls.DD_SetMargins,
//         a = GlobalData.optManager.theContentHeader.Page.margins;
//       if (
//         this.RemoveHighlightsUnder(Resources.Controls.Dropdowns.Margins.GetControl()),
//         a.left === a.right &&
//         a.left === a.top &&
//         a.top === a.bottom
//       ) switch (a.left) {
//         case 50:
//           e = t.Normal;
//           break;
//         case 25:
//           e = t.Narrow;
//           break;
//         case 100:
//           e = t.Wide;
//           break;
//         default:
//           e = t.Custom
//       } else e = t.Custom;
//       return null != e &&
//         (
//           null != (e = e.GetControl()) &&
//           (e.addClass(Constants.Css_Selected), !0)
//         )
//     },
//     this.RemoveHighlightsUnder = function (e) {
//       if (null == e) return !1;
//       var t = $('.' + Constants.Css_Selected, e);
//       return null != t &&
//         0 !== t.length &&
//         (t.removeClass(Constants.Css_Selected), !0)
//     },
//     this.UpdateRecentFillColors = function () {
//       !0 === r &&
//         (
//           this.SetFillRecentColors(
//             Resources.Controls.DD_Fill.RecentColorGroup.GetControl()
//           ),
//           r = !1
//         )
//     },
//     this.UpdateRecentBackColors = function () {
//       !0 === S &&
//         (
//           this.SetFillRecentColors(
//             Resources.Controls.DD_Background.RecentColorGroup.GetControl()
//           ),
//           S = !1
//         )
//     },
//     this.UpdateRecentTextColors = function () {
//       !0 === l &&
//         (
//           this.SetFillRecentColors(
//             Resources.Controls.DD_textColor.RecentColorGroup.GetControl()
//           ),
//           l = !1
//         )
//     },
//     this.HighlightActiveColorOptions = function (e, t, a, r, i) {
//       if (null == t || 0 === t.length) return !1;
//       var n;
//       if (
//         this.RemoveHighlightsUnder(t),
//         a.FillType === ConstantData.FillTypes.SDFILL_SOLID
//       ) {
//         var o,
//           s = this.GetRecentColorIndex(a.Color);
//         - 1 !== s ? null != (
//           o = $(
//             '[' + Constants.Attr_ColorIndex + '=\'' + a.Color.toLowerCase() + '\']',
//             t
//           )
//         ) &&
//           o.length > 0 &&
//           o.addClass(Constants.Css_Selected) : - 1 !== (s = this.GetThemeColorIndex(a.Color)) ? null != (o = $('[' + Constants.Attr_ColorIndex + '=\'' + s + '\']', t)) &&
//             o.length > 0 &&
//             o.addClass(Constants.Css_Selected) : (n = e.More) &&
//         this.HighlightControl(n.Id)
//       } else a.FillType === ConstantData.FillTypes.SDFILL_GRADIENT ? (n = e.Gradient) &&
//         this.HighlightControl(n.Id) : a.FillType === ConstantData.FillTypes.SDFILL_TEXTURE ? (n = e.Texture) &&
//           this.HighlightControl(n.Id) : a.FillType === ConstantData.FillTypes.SDFILL_TRANSPARENT &&
//           (n = e.NoFill) &&
//       this.HighlightControl(n.Id);
//       r &&
//         this.SetControlValue(r, 100 * a.Opacity),
//         i &&
//         (n = e.Hatch) &&
//         this.HighlightControl(n.Id)
//     },
//     this.HighlightActiveFreehandOptions = function (e, t, a, r) {
//       if (null == t || 0 === t.length) return !1;
//       this.RemoveHighlightsUnder(t);
//       let i = null,
//         n = a.Thickness;
//       if (n >= 0 && !isNaN(n)) {
//         let e = $(`[linethickness=${n}]`, t);
//         i = e &&
//           e.length ? e : Resources.Controls.DD_FreehandLine.MoreThickness.GetControl(),
//           i &&
//           i.addClass(Constants.Css_Selected)
//       }
//       let o = a.Paint.Color.toUpperCase();
//       colorToHighlight = $('[' + Constants.Attr_ColorIndex + '=\'' + o + '\']', t),
//         null != colorToHighlight &&
//         colorToHighlight.length > 0 &&
//         colorToHighlight.addClass(Constants.Css_Selected),
//         r &&
//         this.SetControlValue(r, 100 * a.Paint.Opacity)
//     },
//     this.UpdateRecentLineColors = function () {
//       !0 === i &&
//         (
//           this.SetFillRecentColors(Resources.Controls.DD_Lines.RecentColors.GetControl()),
//           i = !1
//         )
//     },
//     this.UpdateRecentFreehandColors = function (e) {
//       !0 === s &&
//         (this.SetFreehandRecentColors(e), s = !1)
//     },
//     this.UpdateRecentLineFillColors = function () {
//       !0 === n &&
//         (
//           this.SetFillRecentColors(
//             Resources.Controls.DD_LineFill.RecentColors.GetControl()
//           ),
//           n = !1
//         )
//     },
//     this.UpdateRecentBorderFillColors = function () {
//       !0 === o &&
//         (
//           this.SetFillRecentColors(Resources.Controls.DD_Borders.RecentColors.GetControl()),
//           o = !1
//         )
//     },
//     this.SetFillRecentColors = function (e) {
//       var t = ConstantData.DocumentContext.RecentColors;
//       if (null == e || 0 === e.length || 0 === t.length) return !1;
//       for (var a = e.length < t.length ? e.length : t.length, r = 0; r < a; r++) {
//         var i = e[r],
//           n = t[r],
//           o = i.style.backgroundColor;
//         null == o &&
//           null != n ? i.style.backgroundColor = n : null != o &&
//           null != n &&
//           o.toLowerCase() != n.toLowerCase() &&
//         (
//           i.style.backgroundColor = n,
//           i.setAttribute(Constants.Attr_ColorIndex, n)
//         )
//       }
//     },
//     this.SetFreehandRecentColors = function (e) {
//       let t = Resources.Controls.DD_FreehandLine.CustomColorGroup.GetControl(!0);
//       t &&
//         t.length &&
//         t.remove();
//       let a = Resources.Controls.DD_FreehandLine.FreehandColorContainer.GetControl(),
//         r = SDUI.Commands.MainController.GetHTMLTemplate('/Views/Partials/FreehandLineColor.html'),
//         i = new SDUI.Appender,
//         n = document.createDocumentFragment(),
//         o = i.GetBoundPropertyList(r),
//         s = {};
//       for (
//         let e = 0;
//         e < ConstantData.DocumentContext.RecentFreehandColors.length;
//         e++
//       ) {
//         const t = ConstantData.DocumentContext.RecentFreehandColors[e];
//         s.Color = t;
//         i.Append(n, r, s, o)
//       }
//       a.append(n)
//     },
//     this.GetThemeColorIndex = function (e) {
//       if (null == e) return - 1;
//       var t = Resources.CurrentTheme,
//         a = t.Colors.length,
//         r = - 1;
//       e = e.toLowerCase();
//       for (var i = 0; i < a; i++) if (t.Colors[i].toLowerCase() === e) {
//         r = i;
//         break
//       }
//       return r
//     },
//     this.GetRecentColorIndex = function (e) {
//       if (null == e) return - 1;
//       var t = ConstantData.DocumentContext.RecentColors,
//         a = t.length,
//         r = - 1;
//       e = e.toLowerCase();
//       for (var i = 0; i < a; i++) if (t[i].toLowerCase() === e) {
//         r = i;
//         break
//       }
//       return r
//     },
//     this.PlanningTableToolBarSetSlider = function (e) {
//       var t = Resources.Controls.Dropdowns.GanttScrollBar.GetControl();
//       t &&
//         (t[0].value = 100 * e)
//     },
//     this.PlanningTableToolBarIdleSlider = function () {
//       if (GlobalData.optManager.RightClickParams) var e = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.RightClickParams.TargetID);
//       if (null != e) {
//         var t = e.GetGanttInfo();
//         if (t) {
//           var a = GlobalData.optManager.GanttGetDateblockWidth(
//             e,
//             ListManager.Table.CellTypes.SDT_CT_GANTT_DATEBLOCK_GRID_HEADER
//           ),
//             r = t.gridTimes.length * t.gridWd > a;
//           Resources.Controls.Dropdowns.GanttScrollBar.GetControl() &&
//             (
//               r ? (
//                 SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.Dropdowns.GanttScrollBar.Id),
//                 SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.Dropdowns.GanttScrollBarLeft.Id),
//                 SDUI.Commands.MainController.Selection.EnableControl(Resources.Controls.Dropdowns.GanttScrollBarRight.Id)
//               ) : (
//                 SDUI.Commands.MainController.Selection.DisableControl(Resources.Controls.Dropdowns.GanttScrollBar.Id),
//                 SDUI.Commands.MainController.Selection.DisableControl(Resources.Controls.Dropdowns.GanttScrollBarLeft.Id),
//                 SDUI.Commands.MainController.Selection.DisableControl(Resources.Controls.Dropdowns.GanttScrollBarRight.Id)
//               )
//             )
//         }
//       }
//     },
//     this.GanttTimeMeasureIdleMenuButtonText = function () {
//       var e = '';
//       if (GlobalData.optManager.RightClickParams) var t = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.RightClickParams.TargetID);
//       if (null != t) {
//         var a = this.GetAppropriateTimeMeasureMenuControl(t);
//         if (a) e = (e = a[0].innerText).replace(/[\n\r]/g, '');
//         else {
//           var r = this.GetAppropriateTimeMeasureMenuItem(t);
//           if (!r) return;
//           if (
//             r.Id === Resources.Controls.DD_TimeMeasure.DaysByMonths.Id ||
//             r.Id === Resources.Controls.DD_TimeMeasure.DaysByWeeks.Id
//           ) e = 'Days';
//           else {
//             var i = r.Id.split('-'),
//               n = i[i.length - 1];
//             e = n.substring(0, 1).toUpperCase(),
//               e += n.substring(1).toLowerCase()
//           }
//         }
//         var o = e.indexOf('(');
//         o > 0 &&
//           (e = e.substring(0, o));
//         var s = Resources.Controls.DD_GanttScroll.GanttScrollTimeMeasureButton.GetControl();
//         s &&
//           (s[0].childNodes[0].innerText = e)
//       }
//     },
//     this.IsJiraCardsAvailable = function () {
//     }
// }

// export default ActiveSelection
