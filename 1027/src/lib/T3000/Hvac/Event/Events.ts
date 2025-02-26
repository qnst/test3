
import Utils4 from '../Helper/Utils4'
import Resources from '../Data/Resources'
import $ from 'jquery'
import GlobalData from '../Data/GlobalData'
import Commands from '../Opt/Business/Commands'
import ConstantData from '../Data/ConstantData'

class Events {

  static OnClick(e, t, a) {
    var r = e.currentTarget;
    if (r) {
      var i = $(r);
      if (i.attr("disabled") || i.hasClass("disabled"))
        return !1
    }
    Events.Handle(e, t, a)
  }

  static OnFocus(e, t, a) {
    return Events.Handle(e, t, a)
  }

  static OnMouseDown(e, t, a) {
    Events.Handle(e, t, a)
  }

  static OnMouseOver(e, t, a) {
    Events.Handle(e, t, a)
  }

  static OnKeyUp(e) {
    e.keyCode === Resources.Keys.Space && (ConstantData.DocumentContext.SpacebarDown = !1)
  }

  static OnKeyDown(e) {
    var t = e.keyCode
      , a = Utils4.GetModifierKeys(e);
    t === Resources.Keys.Space && (ConstantData.DocumentContext.SpacebarDown = !0);
    var r = $(e.target || e.srcElement);
    8 != e.keyCode || r.is('input,[contenteditable="true"],textarea') && "radio" != r.attr("type") && "checkbox" != r.attr("type") || e.preventDefault();
    try {
      var i = !1;
      r && r[0].attributes && (i = r[0].attributes.getNamedItem(/*Constants.Attr_DropdownText*/"dropDownText")),
        null != i && "1" === i.value || e.keyCode !== Resources.Keys.Alt && e.keyCode !== Resources.Keys.Ctrl,
        // && Commands.MainController.Dropdowns.HideAllDropdowns(),
        Commands.MainController.HandleKeyDown(e, t, a)
    } catch (e) {

      GlobalData.optManager.ExceptionCleanup(e);
      throw e;
    }
  }

  static OnKeyPress(e) {
    var t = e.charCode;
    try {
      Commands.MainController.HandleKeyPress(e, t)
    } catch (e) {
      throw e;
    }
  }

  static OnChange(e, t, a) {
    Events.Handle(e, t, a)
  }

  static Handle(e, t, a) {
    if ($(e.currentTarget).hasClass("triggerSignup") && Resources.License && 4 == Resources.License.Edition)
      switch (e.currentTarget.id) {
        case "r-topbar-share":
        case Resources.Controls.Ribbon_File.Print.Id:
        case Resources.Controls.Ribbon_File.Share.Id:
        case Resources.Controls.DD_Ro.Print.Id:
        case Resources.Controls.DD_Export.ExportOffice.Id:
        case Resources.Controls.DD_Export.ExportPDF.Id:
        case Resources.Controls.DD_Export.ExportSVG.Id:
        case Resources.Controls.DD_Export.ExportPNG.Id:
        case Resources.Controls.DD_Export.ExportJPEG.Id:
        case Resources.Controls.DD_Export.ExportVSD.Id:
        case Resources.Controls.DD_Export.ExportVSDX.Id:
          return void function () {
            const e = [{
              messageApplies: !AppSettings.ExportsEnabled,
              messageText: Resources.Strings.TrialNoPrintNoExport
            }, {
              messageApplies: !AppSettings.AllowSharing || AppSettings.IsAtlassianConnectorApp(),
              messageText: Resources.Strings.TrialNoPrintNoShare
            }, {
              messageApplies: !0,
              messageText: Resources.Strings.TrialNoPrint
            }].find((e => e.messageApplies)).messageText
              , t = Resources.Controls.Modals.MessageBoxNoPrint.Id;
            Commands.MainController.ShowMessageBoxWithModal(e, 0, t, (() => Commands.MainController.ShowModal("m-trialbuy")))
          }()
      }
    if ($("body").hasClass("anonTrial") && $(e.currentTarget).hasClass("triggerSignup"))
      return LoginSignupController.Show(),
        e.preventDefault(),
        !1;
    if (null != t) {
      if (null != a)
        return Commands.MainController.InvokeSubController(e, a, t);
      var r = Commands.RibbonCommands[t];
      if (null != r)
        return Utils4.Logger.LogCommand(t, e),
          r(e);
      for (var i in Commands.SmartPanelCommands) {
        var n = Commands.SmartPanelCommands[i];
        if (null != n && null != (r = n[t]))
          return Utils4.Logger.LogCommand(t, e),
            r(e)
      }
      alert(t + " is not a known command.")
    } else
      alert("No event command passed to handler.")
  }

  // SD_Click = Events.OnClick;
  // SD_Focus = Events.OnFocus;
  // SD_MouseDown = Events.OnMouseDown;
  // SD_MouseOver = Events.OnMouseOver;
  // SD_Change = Events.OnChange;

}

export default Events
