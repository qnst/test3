

import Resources from '../Data/Resources'
import QuickStyle from '../Model/QuickStyle';

class Utils4 {

  static GetModifierKeys(e) {
    var t = Resources.ModifierKeys.None;
    return !0 === e.ctrlKey || !0 === e.metaKey ? (t = Resources.ModifierKeys.Ctrl,
      !0 === e.shiftKey ? t = Resources.ModifierKeys.Ctrl_Shift : !0 === e.altKey && (t = Resources.ModifierKeys.Ctrl_Alt)) : !0 === e.shiftKey ? (t = Resources.ModifierKeys.Shift,
        !0 === e.altKey && (t = Resources.ModifierKeys.Shift_Alt)) : !0 === e.altKey && (t = Resources.ModifierKeys.Alt),
      t
  }

  static FindStyle(name) {
    return new QuickStyle();
  }

}


export default Utils4
