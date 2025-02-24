

import HvTimer from '../Helper/HvTimer'
import BaseDrawingObject from './Shape.BaseDrawingObject'
import GlobalData from '../Data/GlobalData'
import Utils1 from '../Helper/Utils1';
import Utils2 from "../Helper/Utils2";
import Utils3 from "../Helper/Utils3";
import DefaultEvt from "../Event/DefaultEvt";
import Collab from '../Data/Collab'
import FileParser from '../Data/FileParser'
import Resources from '../Data/Resources'
import ListManager from '../Data/ListManager';
import $ from 'jquery';
import Point from '../Model/Point';
import Document from '../Basic/Basic.Document'
import Element from '../Basic/Basic.Element';
import Business from '../Opt/Business/Business';
import SDF from '../Data/SDF'
import Commands from '../Opt/Business/Commands'
import Instance from '../Data/Instance/Instance'
import ConstantData from '../Data/ConstantData'
import PolyList from '../Model/PolyList'
import PolySeg from '../Model/PolySeg'
import RightClickData from '../Model/RightClickData'
import Rectangle from '../Model/Rectangle'

class BaseShape extends BaseDrawingObject {

  public ShapeType: any;
  public shapeparam: any;
  public SVGDim: any;

  constructor(options: any) {
    console.log("= S.BaseShape - constructor input:", options);

    options = options || {};
    options.DrawingObjectBaseClass = ConstantData.DrawingObjectBaseClass.SHAPE;

    if (options.hookflags !== 0) {
      options.hookflags = ConstantData.HookFlags.SED_LC_Shape | ConstantData.HookFlags.SED_LC_AttachToLine;
    }

    if (options.targflags !== 0) {
      options.targflags = ConstantData.HookFlags.SED_LC_Shape | ConstantData.HookFlags.SED_LC_Line;
    }

    super(options);

    this.ShapeType = options.ShapeType;
    this.shapeparam = options.shapeparam || 0;
    this.SVGDim = options.SVGDim || {};

    console.log("= S.BaseShape - constructor output:", this);
  }

  CreateActionTriggers(svgDoc, triggerId, rotationProvider, extraParam) {
    console.log("= S.BaseShape - CreateActionTriggers input:", { svgDoc, triggerId, rotationProvider, extraParam });

    // Define default cursor types for knobs (8 directions)
    const defaultCursorTypes = [
      Element.CursorType.RESIZE_LT,
      Element.CursorType.RESIZE_T,
      Element.CursorType.RESIZE_RT,
      Element.CursorType.RESIZE_R,
      Element.CursorType.RESIZE_RB,
      Element.CursorType.RESIZE_B,
      Element.CursorType.RESIZE_LB,
      Element.CursorType.RESIZE_L
    ];

    // Check if the active table is this shape
    if (GlobalData.optManager.Table_GetActiveID() === this.BlockID) {
      console.log("= S.BaseShape - CreateActionTriggers output: null (Table Active)");
      return null;
    }

    let connectorInfo;
    const groupShape = svgDoc.CreateShape(ConstantData.CreateShapeType.GROUP);
    const knobSize = ConstantData.Defines.SED_KnobSize;
    const rKnobSize = ConstantData.Defines.SED_RKnobSize;
    let hasSideKnobs = ((this.extraflags & ConstantData.ExtraFlags.SEDE_SideKnobs &&
      this.dataclass === ConstantData.SDRShapeTypes.SED_S_Poly) > 0);
    const minSidePointLength = ConstantData.Defines.MinSidePointLength;
    let scale = svgDoc.docInfo.docToScreenScale;
    if (svgDoc.docInfo.docScale <= 0.5) {
      scale *= 2;
    }

    const adjustedKnobSize = knobSize / scale;
    const adjustedRKnobSize = rKnobSize / scale;
    const fillColor = 'black';
    const frame = this.Frame;
    let frameWidth = frame.width + adjustedKnobSize;
    let frameHeight = frame.height + adjustedKnobSize;

    // Expand the frame bounds for trigger display
    const adjustedFrame = $.extend(true, {}, frame);
    adjustedFrame.x -= adjustedKnobSize / 2;
    adjustedFrame.y -= adjustedKnobSize / 2;
    adjustedFrame.width += adjustedKnobSize;
    adjustedFrame.height += adjustedKnobSize;

    // Adjust rotation for proper cursor ordering
    let rotation = rotationProvider.GetRotation() + 22.5;
    if (rotation >= 360) {
      rotation = 0;
    }
    const rotationIndex = Math.floor(rotation / 45);
    // Reorder cursor types based on rotation offset
    const cursorTypes = defaultCursorTypes.slice(rotationIndex).concat(defaultCursorTypes.slice(0, rotationIndex));

    // Flags to determine which knob sets to use
    let drawCorners = true;
    let drawVerticalKnobs = !hasSideKnobs;
    let drawHorizontalKnobs = !hasSideKnobs;

    // Adjust based on grow behavior
    switch (this.ObjGrow) {
      case ConstantData.GrowBehavior.HCONSTRAIN:
        drawCorners = false;
        drawHorizontalKnobs = false;
        break;
      case ConstantData.GrowBehavior.VCONSTRAIN:
        drawCorners = false;
        drawVerticalKnobs = false;
        break;
      case ConstantData.GrowBehavior.PROPORTIONAL:
        drawCorners = true;
        drawVerticalKnobs = false;
        drawHorizontalKnobs = false;
        break;
    }

    // Prepare knob configuration object
    const knobConfig = {
      svgDoc: svgDoc,
      shapeType: ConstantData.CreateShapeType.RECT,
      x: 0,
      y: 0,
      knobSize: adjustedKnobSize,
      fillColor: fillColor,
      fillOpacity: 1,
      strokeSize: 1,
      strokeColor: '#777777',
      locked: false
    };

    // Adjust styling for triggers if not equal to triggerId
    if (triggerId !== extraParam) {
      knobConfig.fillColor = 'white';
      knobConfig.strokeSize = 1;
      knobConfig.strokeColor = 'black';
      knobConfig.fillOpacity = '0.0';
    }

    // Adjust style if shape is locked
    if (this.flags & ConstantData.ObjFlags.SEDO_Lock) {
      knobConfig.fillColor = 'gray';
      knobConfig.locked = true;
      hasSideKnobs = false;
    } else if (this.NoGrow()) {
      knobConfig.fillColor = 'red';
      hasSideKnobs = false;
      knobConfig.strokeColor = 'red';
      // Set all cursor types to default when growth is not allowed
      for (let i = 0; i < 8; i++) {
        cursorTypes[i] = Element.CursorType.DEFAULT;
      }
    }

    let knobElement;
    // Draw corner knobs if allowed (four corner triggers)
    if (drawCorners) {
      // Top Left knob
      knobConfig.knobID = ConstantData.ActionTriggerType.TOPLEFT;
      knobConfig.cursorType = cursorTypes[0];
      knobElement = this.GenericKnob(knobConfig);
      groupShape.AddElement(knobElement);

      // Top Right knob
      knobConfig.x = frameWidth - adjustedKnobSize;
      knobConfig.y = 0;
      knobConfig.cursorType = cursorTypes[2];
      knobConfig.knobID = ConstantData.ActionTriggerType.TOPRIGHT;
      knobElement = this.GenericKnob(knobConfig);
      groupShape.AddElement(knobElement);

      // Bottom Right knob
      knobConfig.x = frameWidth - adjustedKnobSize;
      knobConfig.y = frameHeight - adjustedKnobSize;
      knobConfig.cursorType = cursorTypes[4];
      knobConfig.knobID = ConstantData.ActionTriggerType.BOTTOMRIGHT;
      knobElement = this.GenericKnob(knobConfig);
      groupShape.AddElement(knobElement);

      // Bottom Left knob
      knobConfig.x = 0;
      knobConfig.y = frameHeight - adjustedKnobSize;
      knobConfig.cursorType = cursorTypes[6];
      knobConfig.knobID = ConstantData.ActionTriggerType.BOTTOMLEFT;
      knobElement = this.GenericKnob(knobConfig);
      groupShape.AddElement(knobElement);
    }

    // Draw vertical (top/bottom center) knobs if allowed
    if (drawHorizontalKnobs) {
      // Top Center knob
      knobConfig.x = frameWidth / 2 - adjustedKnobSize / 2;
      knobConfig.y = 0;
      knobConfig.cursorType = cursorTypes[1];
      knobConfig.knobID = ConstantData.ActionTriggerType.TOPCENTER;
      knobElement = this.GenericKnob(knobConfig);
      groupShape.AddElement(knobElement);

      // Bottom Center knob
      knobConfig.x = frameWidth / 2 - adjustedKnobSize / 2;
      knobConfig.y = frameHeight - adjustedKnobSize;
      knobConfig.cursorType = cursorTypes[5];
      knobConfig.knobID = ConstantData.ActionTriggerType.BOTTOMCENTER;
      knobElement = this.GenericKnob(knobConfig);
      groupShape.AddElement(knobElement);
    }

    // Draw horizontal (center left/right) knobs if allowed
    if (drawVerticalKnobs) {
      // Center Left knob
      knobConfig.x = 0;
      knobConfig.y = frameHeight / 2 - adjustedKnobSize / 2;
      knobConfig.cursorType = cursorTypes[7];
      knobConfig.knobID = ConstantData.ActionTriggerType.CENTERLEFT;
      knobElement = this.GenericKnob(knobConfig);
      groupShape.AddElement(knobElement);

      // Center Right knob
      knobConfig.x = frameWidth - adjustedKnobSize;
      knobConfig.y = frameHeight / 2 - adjustedKnobSize / 2;
      knobConfig.cursorType = cursorTypes[3];
      knobConfig.knobID = ConstantData.ActionTriggerType.CENTERRIGHT;
      knobElement = this.GenericKnob(knobConfig);
      groupShape.AddElement(knobElement);
    }

    // If connector information exists, add connector icons
    connectorInfo = (function (currentShape) {
      let info = null;
      if (currentShape.hooks.length) {
        const hookedObj = GlobalData.optManager.GetObjectPtr(currentShape.hooks[0].objid, false);
        if (hookedObj && (hookedObj.DrawingObjectBaseClass === ConstantData.DrawingObjectBaseClass.CONNECTOR ||
          (hookedObj && hookedObj instanceof Instance.Shape.ShapeContainer))) {
          info = hookedObj.Pr_GetShapeConnectorInfo(currentShape.hooks[0]);
        }
      }
      return info;
    })(this);
    if (connectorInfo && connectorInfo.length) {
      const iconConfig = {
        svgDoc: svgDoc,
        iconSize: 14,
        imageURL: null,
        iconID: 0,
        userData: 0,
        cursorType: 0
      };
      for (let i = 0, len = connectorInfo.length; i < len; i++) {
        if (connectorInfo[i].position === 'right') {
          iconConfig.x = frameWidth - 14 - 1 - adjustedKnobSize;
        } else {
          iconConfig.x = adjustedKnobSize + 1;
        }
        if (connectorInfo[i].position === 'bottom') {
          iconConfig.y = frameHeight - 14 - 1 - adjustedKnobSize;
        } else {
          iconConfig.y = adjustedKnobSize + 1;
        }
        iconConfig.cursorType = connectorInfo[i].cursorType;
        iconConfig.iconID = connectorInfo[i].knobID;
        iconConfig.imageURL = (connectorInfo[i].polyType === 'vertical')
          ? ConstantData.Defines.Connector_Move_Vertical_Path
          : ConstantData.Defines.Connector_Move_Horizontal_Path;
        iconConfig.userData = connectorInfo[i].knobData;

        knobElement = this.GenericIcon(iconConfig);
        groupShape.AddElement(knobElement);
        iconConfig.x += 16;
      }
    }

    // Draw side knobs for polyline shapes if enabled
    if (hasSideKnobs) {
      const sideShape = Utils1.DeepCopy(this);
      sideShape.inside = $.extend(true, {}, sideShape.Frame);
      const polyPoints = GlobalData.optManager.ShapeToPolyLine(this.BlockID, false, true, sideShape)
        .GetPolyPoints(ConstantData.Defines.NPOLYPTS, true, true, false, []);
      if (polyPoints) {
        knobConfig.shapeType = ConstantData.CreateShapeType.OVAL;
        knobConfig.knobID = ConstantData.ActionTriggerType.MOVEPOLYSEG;
        knobConfig.fillColor = 'green';
        knobConfig.strokeColor = 'green';
        for (let i = 1, len = polyPoints.length; i < len; i++) {
          const dx = polyPoints[i].x - polyPoints[i - 1].x;
          const dy = polyPoints[i].y - polyPoints[i - 1].y;
          if (Utils2.sqrt(dx * dx + dy * dy) > minSidePointLength) {
            knobConfig.cursorType = (dx * dx > dy * dy) ? Element.CursorType.RESIZE_TB : Element.CursorType.RESIZE_LR;
            knobConfig.x = polyPoints[i - 1].x + dx / 2;
            knobConfig.y = polyPoints[i - 1].y + dy / 2;
            knobElement = this.GenericKnob(knobConfig);
            knobElement.SetUserData(i);
            groupShape.AddElement(knobElement);
          }
        }
      }
    }

    // Check for object hooks; if present and not connectors, do not add rotate trigger
    const narrowShape = frame.width < 44;
    let hasValidHooks = this.hooks.length > 0;
    if (hasValidHooks) {
      const hookObj = GlobalData.optManager.GetObjectPtr(this.hooks[0].objid, false);
      if (hookObj && hookObj.DrawingObjectBaseClass !== ConstantData.DrawingObjectBaseClass.CONNECTOR) {
        hasValidHooks = false;
      }
    }

    // Add rotate trigger if allowed (and not locked, touch initiated, or narrow, and no valid hooks)
    if (!(this.NoRotate() || this.NoGrow() || GlobalData.optManager.bTouchInitiated || knobConfig.locked || narrowShape || hasValidHooks)) {
      const isTextAlignedLeft = (this.TextGrow === ConstantData.TextGrowBehavior.HORIZONTAL &&
        (this.flags & ConstantData.ObjFlags.SEDO_TextOnly) &&
        SDF.TextAlignToWin(this.TextAlign).just === FileParser.TextJust.TA_LEFT);
      knobConfig.shapeType = ConstantData.CreateShapeType.OVAL;
      knobConfig.x = isTextAlignedLeft ? frameWidth + adjustedRKnobSize : frameWidth - 3 * adjustedRKnobSize;
      knobConfig.y = frameHeight / 2 - adjustedRKnobSize / 2;
      knobConfig.cursorType = Element.CursorType.ROTATE;
      knobConfig.knobID = ConstantData.ActionTriggerType.ROTATE;
      knobConfig.fillColor = 'white';
      knobConfig.fillOpacity = 0.001;
      knobConfig.strokeSize = 1.5;
      knobConfig.strokeColor = 'black';
      knobElement = this.GenericKnob(knobConfig);
      groupShape.AddElement(knobElement);
    }

    // Create dimension adjustment knobs if required
    if ((this.Dimensions & ConstantData.DimensionFlags.SED_DF_Standoff) &&
      this.CanUseStandOffDimensionLines()) {
      const shapeElem = GlobalData.optManager.svgObjectLayer.GetElementByID(this.BlockID);
      this.CreateDimensionAdjustmentKnobs(groupShape, shapeElem, knobConfig);
    }

    // Set size and position of the action triggers container
    groupShape.SetSize(frameWidth, frameHeight);
    groupShape.SetPos(adjustedFrame.x, adjustedFrame.y);
    groupShape.isShape = true;
    groupShape.SetID(ConstantData.Defines.Action + triggerId);

    console.log("= S.BaseShape - CreateActionTriggers output:", groupShape);
    return groupShape;
  }


  CreateConnectHilites(
    svgDoc: any,
    triggerId: any,
    targetParam: any,
    additionalParam: any,
    extraParam: any,
    connectionHint: any
  ) {
    console.log("= S.BaseShape - CreateConnectHilites input:", {
      svgDoc,
      triggerId,
      targetParam,
      additionalParam,
      extraParam,
      connectionHint
    });

    // Create the main group shape for the connection highlights
    const groupShape = svgDoc.CreateShape(ConstantData.CreateShapeType.GROUP);
    let screenScale = svgDoc.docInfo.docToScreenScale;
    if (svgDoc.docInfo.docScale <= 0.5) {
      screenScale *= 2;
    }

    // Calculate knob dimension based on scale
    const connectDim = ConstantData.Defines.CONNECTPT_DIM / screenScale;
    let targetPoints: any[] = [];
    // Using ConnectPoints if flag is set (though not used further)
    if (this.flags & ConstantData.ObjFlags.SEDO_UseConnect && this.ConnectPoints) {
      // Code intentionally left empty if only referenced for side-effect
    }

    // Determine if continuous connector flag is set or a connection hint exists
    const useContinuous = (this.flags & ConstantData.ObjFlags.SEDO_ContConn) || connectionHint != null;
    if (useContinuous) {
      targetPoints.push(targetParam);
    } else {
      targetPoints = this.GetTargetPoints(null, ConstantData.HookFlags.SED_LC_NoSnaps, null);
      if (targetPoints == null) return;
    }

    // Get perimeter points for connection highlights
    const perimeterPts = this.GetPerimPts(
      triggerId,
      targetPoints,
      null,
      !useContinuous,
      connectionHint,
      extraParam
    );

    // Expand the frame by connectDim
    const frame = this.Frame;
    let frameWidth = frame.width;
    let frameHeight = frame.height;
    const expandedFrame = $.extend(true, {}, frame);
    expandedFrame.x -= connectDim / 2;
    expandedFrame.y -= connectDim / 2;
    expandedFrame.width += connectDim;
    expandedFrame.height += connectDim;
    frameWidth += connectDim;
    frameHeight += connectDim;

    // Prepare knob configuration parameters
    const knobConfig = {
      svgDoc: svgDoc,
      shapeType: ConstantData.CreateShapeType.OVAL,
      x: 0,
      y: 0,
      knobSize: connectDim,
      fillColor: "black",
      fillOpacity: 1,
      strokeSize: 1,
      strokeColor: "#777777",
      KnobID: 0,
      cursorType: Element.CursorType.ANCHOR
    };

    let knobElement: any;
    // Depending on useContinuous, position the knob appropriately
    if (useContinuous) {
      expandedFrame.x = perimeterPts[0].x;
      expandedFrame.y = perimeterPts[0].y;
      expandedFrame.x -= connectDim;
      expandedFrame.y -= connectDim;
      knobConfig.x = connectDim / 2;
      knobConfig.y = connectDim / 2;
      knobElement = this.GenericKnob(knobConfig);
      groupShape.AddElement(knobElement);
      groupShape.SetSize(expandedFrame.width, expandedFrame.height);
      groupShape.SetPos(expandedFrame.x, expandedFrame.y);
    } else {
      // Create a knob at each perimeter point relative to the shape's Frame
      for (let i = 0; i < perimeterPts.length; i++) {
        knobConfig.x = perimeterPts[i].x - this.Frame.x;
        knobConfig.y = perimeterPts[i].y - this.Frame.y;
        knobElement = this.GenericKnob(knobConfig);
        groupShape.AddElement(knobElement);
      }
      groupShape.SetSize(frameWidth, frameHeight);
      groupShape.SetPos(expandedFrame.x, expandedFrame.y);
    }

    groupShape.isShape = true;
    groupShape.SetEventBehavior(Element.EventBehavior.NONE);
    groupShape.SetID("hilite_" + triggerId);

    console.log("= S.BaseShape - CreateConnectHilites output:", groupShape);
    return groupShape;
  }

  SetCursors() {
    console.log("= S.BaseShape - SetCursors input, BlockID:", this.BlockID);

    // Retrieve the main SVG element for this shape
    const svgElement = GlobalData.optManager.svgObjectLayer.GetElementByID(this.BlockID);
    const isOneClickText = ((this.TextFlags & ConstantData.TextFlags.SED_TF_OneClick) > 0);
    const editMode = GlobalData.optManager.GetEditMode();

    switch (editMode) {
      case ConstantData.EditState.DEFAULT: {
        const activeTableId = GlobalData.optManager.Table_GetActiveID();
        const table = this.GetTable(false);

        if (table) {
          if (isOneClickText || this.BlockID === activeTableId) {
            console.log("= S.BaseShape - SetCursors: Using Table_SetCursors with disable editing");
            GlobalData.optManager.Table_SetCursors(svgElement, this, table, false);
          } else {
            console.log("= S.BaseShape - SetCursors: Using Table_SetCursors with enable editing");
            GlobalData.optManager.Table_SetCursors(svgElement, this, table, true);
            // Call parent SetCursors to handle default cursor settings
            super.SetCursors();

            if (isOneClickText) {
              const shapeElem = svgElement.GetElementByID(ConstantData.SVGElementClass.SHAPE);
              if (shapeElem) {
                shapeElem.SetCursor(Element.CursorType.TEXT);
              }
              // Optionally retrieve the "SLOP" element if needed
              const slopElem = svgElement.GetElementByID(ConstantData.SVGElementClass.SLOP);
            }
          }
        } else {
          // When no table exists, simply call the parent method
          super.SetCursors();
        }
        break;
      }
      case ConstantData.EditState.FORMATPAINT: {
        console.log("= S.BaseShape - SetCursors: FORMATPAINT mode");
        const shapeElem = svgElement.GetElementByID(ConstantData.SVGElementClass.SHAPE);
        if (shapeElem) {
          shapeElem.SetCursor(Element.CursorType.PAINT);
        }
        const slopElem = svgElement.GetElementByID(ConstantData.SVGElementClass.SLOP);
        if (slopElem) {
          slopElem.SetCursor(Element.CursorType.PAINT);
        }
        break;
      }
      default: {
        console.log("= S.BaseShape - SetCursors: Default mode, calling super.SetCursors()");
        // Default behavior: just call the parent's method
        super.SetCursors();
      }
    }

    console.log("= S.BaseShape - SetCursors output, BlockID:", this.BlockID);
  }

  GetTextObject(event: any, skipTableRelease: boolean) {
    console.log("= S.BaseShape - GetTextObject input:", { event, skipTableRelease });
    let dataId: number;
    const table = this.GetTable(false);
    const graph = this.GetGraph(false);

    if (table) {
      // When a table is present
      if (table.select >= 0) {
        if (!skipTableRelease) {
          GlobalData.optManager.Table_Release(true);
        }
        dataId = table.select;
        if (!GlobalData.optManager.Table_AllowCellTextEdit(table, dataId)) {
          dataId = GlobalData.optManager.Table_GetNextTextCell(table, dataId, Resources.Keys.Right_Arrow);
          if (dataId < 0) {
            dataId = GlobalData.optManager.Table_GetNextTextCell(table, 0, Resources.Keys.Right_Arrow);
          }
        }
        if (dataId >= 0) {
          table.select = dataId;
          this.DataID = table.cells[table.select].DataID;
        }
      } else {
        // When no selection exists in the table
        if (event) {
          dataId = GlobalData.optManager.Table_GetCellClicked(this, event);
          if (dataId >= 0) {
            if (!GlobalData.optManager.Table_AllowCellTextEdit(table, dataId)) {
              dataId = GlobalData.optManager.Table_GetNextTextCell(table, dataId, Resources.Keys.Right_Arrow);
            }
          }
        } else {
          dataId = GlobalData.optManager.Table_GetFirstTextCell(table);
        }
        if (dataId >= 0) {
          table.select = dataId;
          this.DataID = table.cells[table.select].DataID;
        }
      }

      // Validate DataID exists
      if (this.DataID >= 0 && GlobalData.optManager.GetObjectPtr(this.DataID, false) == null) {
        this.DataID = -1;
        table.cells[table.select].DataID = -1;
      }

      // Update text element on the SVG layer
      const svgElement = GlobalData.optManager.svgObjectLayer.GetElementByID(this.BlockID);
      if (svgElement) {
        svgElement.textElem = svgElement.GetElementByID(ConstantData.SVGElementClass.TEXT, this.DataID);
      }
    } else if (graph) {
      // When a graph is present
      this.DataID = graph.selectedText;
      const svgElement = GlobalData.optManager.svgObjectLayer.GetElementByID(this.BlockID);
      if (svgElement) {
        svgElement.textElem = svgElement.GetElementByID(ConstantData.SVGElementClass.TEXT, this.DataID);
      }
    } else if (this.DataID >= 0 && GlobalData.optManager.GetObjectPtr(this.DataID, false) == null) {
      // When the DataID is invalid
      this.DataID = -1;
    }

    console.log("= S.BaseShape - GetTextObject output:", { DataID: this.DataID });
    return this.DataID;
  }

  UseTextBlockColor() {
    console.log("= S.BaseShape - UseTextBlockColor input:", {
      TextFlags: this.TextFlags,
      FillPaintType: this.StyleRecord.Fill.Paint.FillType,
      TextPaintColor: this.StyleRecord.Text.Paint.Color,
      FillColor: this.StyleRecord.Fill.Paint.Color
    });

    const hasAttachFlag =
      (this.TextFlags & ConstantData.TextFlags.SED_TF_AttachA) ||
      (this.TextFlags & ConstantData.TextFlags.SED_TF_AttachB);

    const isTransparent =
      this.StyleRecord.Fill.Paint.FillType === ConstantData.FillTypes.SDFILL_TRANSPARENT;

    const isSolidAndSameColor =
      this.StyleRecord.Fill.Paint.FillType === ConstantData.FillTypes.SDFILL_SOLID &&
      this.StyleRecord.Text.Paint.Color.toUpperCase() === this.StyleRecord.Fill.Paint.Color.toUpperCase();

    const result = hasAttachFlag || isTransparent || isSolidAndSameColor;
    console.log("= S.BaseShape - UseTextBlockColor output:", result);

    return result;
  }

  SetTextObject(inputDataID: number) {
    console.log("= S.BaseShape - SetTextObject input:", inputDataID);
    const table = this.GetTable(true);
    if (table) {
      if (table.select >= 0) {
        table.cells[table.select].DataID = inputDataID;
      }
    }
    if (this.UseTextBlockColor()) {
      const style = Resources.FindStyle(ConstantData.Defines.TextBlockStyle);
      if (style) {
        this.StyleRecord.Text.Paint = Utils1.DeepCopy(style.Text.Paint);
      }
    }
    this.DataID = inputDataID;
    console.log("= S.BaseShape - SetTextObject output:", this.DataID);
    return true;
  }


  GetTextParams(event: any) {
    console.log("= S.BaseShape - GetTextParams input:", { event });

    let textParams: any = {};
    const table = this.GetTable(false);
    const graph = this.GetGraph(false);

    if (table && table.select >= 0) {
      textParams = GlobalData.optManager.Table_GetTRect(this, table, event);
    } else if (graph && graph.selectedText >= 0) {
      textParams = GlobalData.optManager.Graph_GetTRect(this, graph, event);
    } else {
      textParams.trect = Utils1.DeepCopy(this.trect);
      textParams.sizedim = Utils1.DeepCopy(this.sizedim);
      textParams.tsizedim = {
        width: this.sizedim.width - (this.Frame.width - this.trect.width),
        height: this.sizedim.height - (this.Frame.height - this.trect.height)
      };
    }

    console.log("= S.BaseShape - GetTextParams output:", textParams);
    return textParams;
  }

  GetTextDefault(e: any): any {
    console.log("= S.BaseShape - GetTextDefault input:", { event: e });
    const table = this.GetTable(false);
    let textDefault: any;

    if (table) {
      textDefault = GlobalData.optManager.Table_GetCellTextFormat(table, table.select, e);
    } else {
      textDefault = super.GetTextDefault(e);
    }

    console.log("= S.BaseShape - GetTextDefault output:", textDefault);
    return textDefault;
  }

  SetTableProperties(properties: any, option: any): any {
    console.log("= S.BaseShape - SetTableProperties input:", { properties, option });

    if (this.GetTable(false)) {
      const result = GlobalData.optManager.Table_SetProperties(this, properties, option, true);
      console.log("= S.BaseShape - SetTableProperties output:", result);
      return result;
    }

    console.log("= S.BaseShape - SetTableProperties output: no table found");
    return undefined;
  }

  SetTextGrow(textGrowBehavior: any): void {
    console.log("= S.BaseShape - SetTextGrow input:", textGrowBehavior);

    if (this.GetTable(false)) {
      GlobalData.optManager.Table_ChangeTextAttributes(this, null, null, null, null, null, textGrowBehavior, false);
      console.log("= S.BaseShape - SetTextGrow output: Table text attributes changed");
    } else {
      // Update the TextGrow property
      this.TextGrow = textGrowBehavior;

      if (this.DataID >= 0) {
        const shapeElement = GlobalData.optManager.svgObjectLayer.GetElementByID(this.BlockID);
        if (shapeElement) {
          const textElement = shapeElement.textElem;

          if (this.TextGrow === ConstantData.TextGrowBehavior.HORIZONTAL) {
            textElement.SetConstraints(
              GlobalData.optManager.theContentHeader.MaxWorkDim.x,
              this.trect.width,
              this.trect.height
            );
            console.log("= S.BaseShape - SetTextGrow applied HORIZONTAL constraints");
          } else {
            const shapeCopy = Utils1.DeepCopy(this);
            const frameCopy = Utils1.DeepCopy(this.Frame);
            frameCopy.width = this.sizedim.width;
            shapeCopy.UpdateFrame(frameCopy);
            textElement.SetConstraints(
              shapeCopy.trect.width,
              shapeCopy.trect.width,
              this.trect.height
            );
            console.log("= S.BaseShape - SetTextGrow applied VERTICAL constraints");
          }
        }
        GlobalData.optManager.TextResizeCommon(this.BlockID, true);
        console.log("= S.BaseShape - SetTextGrow: TextResizeCommon called");
      }
      console.log("= S.BaseShape - SetTextGrow output:", this.TextGrow);
    }
  }

  ChangeShape(newDataClass, newShapeType, getVertexArrayFunc, shapeParam, preserveAspect) {
    console.log("= S.BaseShape - ChangeShape input:", {
      newDataClass,
      newShapeType,
      shapeParam,
      preserveAspect
    });

    let newShape;
    let preservedBlock;
    let tableResult;
    let rectCopy;
    let resizedTable;
    const sessionBlock = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, false);

    if (this.SymbolURL && this.SymbolURL.length > 0) {
      console.log("= S.BaseShape - ChangeShape output: SymbolURL exists, returning false");
      return false;
    }

    if (newDataClass !== this.dataclass || newShapeType === ConstantData.SDRShapeTypes.SED_S_Rect) {
      // Create a deep copy of current properties
      const newShapeProps = $.extend(true, {}, this);

      // Enforce aspect ratio if required
      if (preserveAspect) {
        const centerX = newShapeProps.Frame.x + newShapeProps.Frame.width / 2;
        const centerY = newShapeProps.Frame.y + newShapeProps.Frame.height / 2;
        if (newShapeProps.Frame.width > newShapeProps.Frame.height) {
          newShapeProps.Frame.x = centerX - newShapeProps.Frame.height / 2;
          newShapeProps.Frame.width = newShapeProps.Frame.height;
        } else {
          newShapeProps.Frame.y = centerY - newShapeProps.Frame.width / 2;
          newShapeProps.Frame.height = newShapeProps.Frame.width;
        }
      }

      // Instantiate the correct shape based on newShapeType
      switch (newShapeType) {
        case ConstantData.SDRShapeTypes.SED_S_Rect:
        case ConstantData.SDRShapeTypes.SED_S_MeasureArea:
          newShape = new ListManager.Rect(newShapeProps);
          break;
        case ConstantData.SDRShapeTypes.SED_S_RRect:
          newShapeProps.shapeparam = sessionBlock.def.rrectparam;
          newShape = new ListManager.RRect(newShapeProps);
          newShape.moreflags = Utils2.SetFlag(newShape.moreflags, ConstantData.ObjMoreFlags.SED_MF_FixedRR, true);
          shapeParam = sessionBlock.def.rrectparam;
          break;
        case ConstantData.SDRShapeTypes.SED_S_Oval:
        case ConstantData.SDRShapeTypes.SED_S_Circ:
          newShape = new ListManager.Oval(newShapeProps);
          break;
        case ConstantData.SDRShapeTypes.SED_S_Poly:
          const vertexArray = getVertexArrayFunc(this.Frame, shapeParam);
          newShapeProps.VertexArray = vertexArray;
          newShape = new ListManager.Polygon(newShapeProps);
          newShape.NeedsSIndentCount = true;
          break;
      }

      // Preserve the block and update new shape properties
      preservedBlock = GlobalData.objectStore.PreserveBlock(this.BlockID);
      newShape.dataclass = newDataClass;
      newShape.shapeparam = shapeParam;
      newShape.ResizeAspectConstrain = preserveAspect;
      if (newShape.ImageURL === "") {
        newShape.extraflags = Utils2.SetFlag(
          newShape.extraflags,
          ConstantData.ExtraFlags.SEDE_FlipHoriz | ConstantData.ExtraFlags.SEDE_FlipVert,
          false
        );
      }
      newShape.ObjGrow = preserveAspect ? ConstantData.GrowBehavior.PROPORTIONAL : ConstantData.GrowBehavior.ALL;
      newShape.BlockID = preservedBlock.Data.BlockID;
      newShape.left_sindent = 0;
      newShape.top_sindent = 0;
      newShape.right_sindent = 0;
      newShape.bottom_sindent = 0;
      preservedBlock.Data = newShape;
      newShape.moreflags = Utils2.SetFlag(newShape.moreflags, ConstantData.ObjMoreFlags.SED_MF_FixedRR, false);

      // Handle table adjustments if a table exists for the new shape
      tableResult = newShape.GetTable(true);
      if (tableResult) {
        if (this.hookflags & ConstantData.HookFlags.SED_LC_TableRows) {
          newShape.hookflags = Utils2.SetFlag(newShape.hookflags, ConstantData.HookFlags.SED_LC_TableRows, true);
        }
        newShape.UpdateFrame(newShape.Frame);
        rectCopy = Utils1.DeepCopy(newShape.trect);
        newShape.sizedim.width = newShape.Frame.width;
        newShape.sizedim.height = newShape.Frame.height;
        GlobalData.optManager.theActionTable = Utils1.DeepCopy(tableResult);
        resizedTable = GlobalData.optManager.Table_Resize(
          newShape,
          tableResult,
          GlobalData.optManager.theActionTable,
          rectCopy.width,
          rectCopy.height
        );
        if (resizedTable.x > rectCopy.width + 0.1 || resizedTable.y > rectCopy.height + 0.1) {
          const aspectRatioOriginal = newShape.sizedim.width / newShape.sizedim.height;
          rectCopy.width = resizedTable.x;
          rectCopy.height = resizedTable.y;
          newShape.TRectToFrame(rectCopy);
          const currentAspectRatio = newShape.Frame.width / newShape.Frame.height;
          if (currentAspectRatio > aspectRatioOriginal) {
            newShape.Frame.height = newShape.Frame.width / aspectRatioOriginal;
            newShape.UpdateFrame(newShape.Frame);
            GlobalData.optManager.Table_Resize(
              newShape,
              tableResult,
              GlobalData.optManager.theActionTable,
              newShape.trect.width,
              newShape.trect.height
            );
          } else if (currentAspectRatio < aspectRatioOriginal) {
            newShape.Frame.width = newShape.Frame.height * aspectRatioOriginal;
            newShape.UpdateFrame(newShape.Frame);
            GlobalData.optManager.Table_Resize(
              newShape,
              tableResult,
              GlobalData.optManager.theActionTable,
              newShape.trect.width,
              newShape.trect.height
            );
          }
        }
        GlobalData.optManager.theActionTable = null;
      } else if (newShape.DataID >= 0) {
        // When there is no table, update based on text element sizing
        newShape.UpdateFrame(newShape.Frame);
        newShape.sizedim.width = newShape.Frame.width;
        newShape.sizedim.height = newShape.Frame.height;
        const svgElement = GlobalData.optManager.svgObjectLayer.GetElementByID(this.BlockID);
        let textElement;
        if (svgElement) {
          textElement = svgElement.textElem;
        }
        rectCopy = Utils1.DeepCopy(newShape.trect);
        if (textElement) {
          let textFit = textElement.CalcTextFit(rectCopy.width);
          if (textFit.height > rectCopy.height) {
            textFit = GlobalData.optManager.FitProp(newShape, textElement, textFit.height - rectCopy.height, -1);
            newShape.Frame.width = textFit.x;
            newShape.Frame.height = textFit.y;
          } else {
            newShape.TRectToFrame(rectCopy, false);
          }
        }
      }

      newShape.SetSize(newShape.Frame.width, newShape.Frame.height, 0);
      console.log("= S.BaseShape - ChangeShape output:", { result: true, newShape });
      return true;
    }

    console.log("= S.BaseShape - ChangeShape output: condition not met, returning false");
    return false;
  }

  SetShapeProperties(properties: any) {
    console.log("= S.BaseShape - SetShapeProperties input:", properties);
    let changed = false;
    let widthAdjust = 0;
    let heightAdjust = 0;
    let flagUpdated = false;
    const currentTextFlags = this.TextFlags;
    const textFlagConstants = ConstantData.TextFlags;

    // Call parent implementation and check text flags condition
    if (
      // Calling parent's SetShapeProperties
      super.SetShapeProperties(properties) &&
      (changed = true,
        ((this.TextFlags & (textFlagConstants.SED_TF_AttachA + textFlagConstants.SED_TF_AttachB)) !== (currentTextFlags & (textFlagConstants.SED_TF_AttachA + textFlagConstants.SED_TF_AttachB)) &&
          this.DataID >= 0))
    ) {
      flagUpdated = true;
      let style;
      if (this.TextFlags & (textFlagConstants.SED_TF_AttachA + textFlagConstants.SED_TF_AttachB)) {
        style = Resources.FindStyle(ConstantData.Defines.TextBlockStyle);
      } else {
        style = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, false).def.style;
      }
      const newStyle = {
        StyleRecord: {
          Text: {
            Paint: {
              Color: style.Text.Paint.Color
            }
          }
        }
      };
      const oldColor = { Color: newStyle.StyleRecord.Text.Paint.Color };
      const styleConfig = { color: newStyle.StyleRecord.Text.Paint.Color };
      this.ChangeTextAttributes(styleConfig, oldColor);
    }

    // Update text margin if provided
    const table = this.GetTable(false);
    if (properties.tmargin != null) {
      if (table) {
        changed = GlobalData.optManager.Table_ChangeTextMargin(this, properties.tmargin);
      } else if (this.TMargins.left !== properties.tmargin) {
        this.TMargins.left = properties.tmargin;
        this.TMargins.right = properties.tmargin;
        this.TMargins.top = properties.tmargin;
        this.TMargins.bottom = properties.tmargin;
        changed = true;
        const frameCopy = $.extend(true, {}, this.Frame);
        this.UpdateFrame(frameCopy);
        if (this.trect.width < 0) {
          widthAdjust = -this.trect.width;
        }
        if (this.trect.height < 0) {
          heightAdjust = -this.trect.height;
        }
        if (widthAdjust || heightAdjust) {
          Utils2.InflateRect(this.trect, widthAdjust / 2, heightAdjust / 2);
          this.TRectToFrame(this.trect, true);
          GlobalData.optManager.AddToDirtyList(this.BlockID);
        }
        if (this.DataID >= 0) {
          flagUpdated = true;
        }
        changed = true;
      }
    }

    // Update side connection flag for polygon shapes
    if (
      properties.SideConn != null &&
      this.ShapeType === ConstantData.ShapeType.POLYGON &&
      properties.AdjSides !== ((this.extraflags & ConstantData.ExtraFlags.SEDE_SideKnobs) > 0)
    ) {
      this.extraflags = Utils2.SetFlag(
        this.extraflags,
        ConstantData.ExtraFlags.SEDE_SideKnobs,
        properties.SideConn
      );
      GlobalData.optManager.AddToDirtyList(this.BlockID);
      changed = true;
    }

    // Update container flag if needed
    if (
      properties.Container != null &&
      properties.Container !== ((this.moreflags & ConstantData.ObjMoreFlags.SED_MF_Container) > 0)
    ) {
      this.moreflags = Utils2.SetFlag(
        this.moreflags,
        ConstantData.ObjMoreFlags.SED_MF_Container,
        properties.Container
      );
      changed = true;
    }

    // Update grow behavior
    if (properties.ObjGrow != null && properties.ObjGrow !== this.ObjGrow) {
      this.ObjGrow = properties.ObjGrow;
      GlobalData.optManager.AddToDirtyList(this.BlockID);
      changed = true;
      this.ResizeAspectConstrain = this.ObjGrow === ConstantData.GrowBehavior.PROPORTIONAL;
    }

    // Update text grow property if changed
    if (properties.TextGrow != null && properties.TextGrow !== this.TextGrow) {
      this.SetTextGrow(properties.TextGrow);
      changed = true;
      flagUpdated = false;
    }

    if (flagUpdated) {
      this.SetTextGrow(this.TextGrow);
      changed = true;
    }

    console.log("= S.BaseShape - SetShapeProperties output:", changed);
    return changed;
  }

  ApplyStyle(style: any, options: any): void {
    console.log("= S.BaseShape - ApplyStyle input:", { style, options });

    let backupLine: any = null;

    // Only adjust style if not a swimlane or shape container
    if (!this.IsSwimlane() && this.objecttype !== ConstantData.ObjectTypes.SD_OBJT_SHAPECONTAINER) {
      if (style && style.Line && style.Border) {
        backupLine = Utils1.DeepCopy(style.Line);
        style.Line = Utils1.DeepCopy(style.Border);
      }

      // Call parent ApplyStyle method
      super.ApplyStyle(style, options);

      if (backupLine != null) {
        style.Line = Utils1.DeepCopy(backupLine);
      }
    }

    console.log("= S.BaseShape - ApplyStyle output:", { style, options });
  }

  SetObjectStyle(style: any): any {
    console.log("= S.BaseShape.SetObjectStyle input:", style);

    let originalLine: any = null;

    // Save original line style if available and replace with border style
    if (style.StyleRecord && style.StyleRecord.Line && style.StyleRecord.Border) {
      originalLine = Utils1.DeepCopy(style.StyleRecord.Line);
      style.StyleRecord.Line = Utils1.DeepCopy(style.StyleRecord.Border);
    }

    // Call parent SetObjectStyle
    const result = super.SetObjectStyle(style);

    // If there is a line thickness defined, update the size based on current frame dimensions
    if (result.StyleRecord && result.StyleRecord.Line && result.StyleRecord.Line.Thickness) {
      this.SetSize(
        this.Frame.width,
        this.Frame.height,
        ConstantData.ActionTriggerType.LINE_THICKNESS
      );
    }

    // Restore original line style if it was modified
    if (originalLine != null) {
      style.StyleRecord.Line = Utils1.DeepCopy(originalLine);
    }

    // Clear image and update text flags if necessary
    if (result.StyleRecord && result.StyleRecord.Fill && result.StyleRecord.Fill.FillType) {
      GlobalData.optManager.ClearImage(this.BlockID, false, true);

      if (
        (this.flags & ConstantData.ObjFlags.SEDO_TextOnly) &&
        this.StyleRecord.Fill.Paint.FillType !== ConstantData.FillTypes.SDFILL_TRANSPARENT
      ) {
        this.flags = Utils2.SetFlag(this.flags, ConstantData.ObjFlags.SEDO_TextOnly, false);
      }
    }

    console.log("= S.BaseShape.SetObjectStyle output:", result);
    return result;
  }

  SetShapeConnectionPoints(connectionType: any, connectionPoints: any, newAttachPoint: any) {
    console.log("= S.BaseShape - SetShapeConnectionPoints input:", { connectionType, connectionPoints, newAttachPoint });

    let changed = false;

    // Update attach point if different
    if (!(this.attachpoint.x === newAttachPoint.x && this.attachpoint.y === newAttachPoint.y)) {
      this.attachpoint.x = newAttachPoint.x;
      this.attachpoint.y = newAttachPoint.y;
      changed = true;
    }

    switch (connectionType) {
      case ConstantData.ObjFlags.SEDO_ContConn:
        if ((this.flags & connectionType) === 0) {
          this.flags = Utils2.SetFlag(this.flags, ConstantData.ObjFlags.SEDO_UseConnect, false);
          this.flags = Utils2.SetFlag(this.flags, ConstantData.ObjFlags.SEDO_ContConn, true);
          changed = true;
        }
        break;

      case ConstantData.ObjFlags.SEDO_UseConnect:
        this.flags = Utils2.SetFlag(this.flags, ConstantData.ObjFlags.SEDO_ContConn, false);
        this.flags = Utils2.SetFlag(this.flags, ConstantData.ObjFlags.SEDO_UseConnect, true);
        this.ConnectPoints = Utils1.DeepCopy(connectionPoints);
        changed = true;
        break;

      default:
        if (
          (this.flags & ConstantData.ObjFlags.SEDO_ContConn) ||
          (this.flags & ConstantData.ObjFlags.SEDO_UseConnect)
        ) {
          this.flags = Utils2.SetFlag(this.flags, ConstantData.ObjFlags.SEDO_UseConnect, false);
          this.flags = Utils2.SetFlag(this.flags, ConstantData.ObjFlags.SEDO_ContConn, false);
          changed = true;
        }
    }

    console.log("= S.BaseShape - SetShapeConnectionPoints output:", changed);
    return changed;
  }

  GetClosestConnectPoint(point: { x: number; y: number }): boolean {
    console.log("= S.BaseShape - GetClosestConnectPoint input:", point);

    const table = this.GetTable(false);
    const useTableRows = (this.hookflags & ConstantData.HookFlags.SED_LC_TableRows) && table;
    const useConnect = (this.flags & ConstantData.ObjFlags.SEDO_UseConnect) && this.ConnectPoints;
    let connectPoints: Array<{ x: number; y: number }> = [];
    const connectDimension = ConstantData.Defines.SED_CDim;

    if (useConnect) {
      // Create a rect with the connection dimension
      const rect = { x: 0, y: 0, width: connectDimension, height: connectDimension };
      connectPoints = Utils1.DeepCopy(this.ConnectPoints);
      GlobalData.optManager.FlipPoints(rect, this.extraflags, connectPoints);
      if (this.RotationAngle !== 0) {
        const rotationRadians = -this.RotationAngle / (180 / ConstantData.Geometry.PI);
        Utils3.RotatePointsAboutCenter(rect, rotationRadians, connectPoints);
      }
    } else if (useTableRows) {
      connectPoints = GlobalData.optManager.Table_GetRowConnectPoints(this, table);
      if (point.x < 10) {
        point.x = connectPoints[2].x;
        point.y = connectPoints[2].y;
        console.log("= S.BaseShape - GetClosestConnectPoint output:", point);
        return true;
      }
      if (point.x > connectDimension - 10) {
        point.x = connectPoints[2 + table.rows.length].x;
        point.y = connectPoints[2 + table.rows.length].y;
        console.log("= S.BaseShape - GetClosestConnectPoint output:", point);
        return true;
      }
    }

    if (useConnect || useTableRows) {
      let bestDistanceSquared: number | undefined;
      let bestConnectPoint: { x: number; y: number };

      for (let i = 0; i < connectPoints.length; i++) {
        const cp = connectPoints[i];
        const dx = point.x - cp.x;
        const dy = point.y - cp.y;
        const currentDistanceSquared = dx * dx + dy * dy;
        if (bestDistanceSquared === undefined || currentDistanceSquared < bestDistanceSquared) {
          bestDistanceSquared = currentDistanceSquared;
          bestConnectPoint = cp;
        }
      }

      point.x = bestConnectPoint.x;
      point.y = bestConnectPoint.y;
      console.log("= S.BaseShape - GetClosestConnectPoint output:", point);
      return true;
    }

    console.log("= S.BaseShape - GetClosestConnectPoint output:", false);
    return false;
  }

  GetPolyList() {
    console.log("= S.BaseShape - GetPolyList input:", {});
    let seg: PolySeg;
    let polyList: PolyList = new PolyList();
    let tempValue: any;
    let frameParam: any;
    let cornerSize: any;
    const shapeTypes = ConstantData.SDRShapeTypes;
    const lineTypes = ConstantData.LineType;

    switch (this.dataclass) {
      case shapeTypes.SED_S_Rect:
        seg = new PolySeg(lineTypes.LINE, 0, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, this.inside.width, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, this.inside.width, this.inside.height);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, 0, this.inside.height);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, 0, 0);
        polyList.segs.push(seg);
        break;

      case shapeTypes.SED_S_RRect:
        tempValue = this.Frame.width;
        if (this.Frame.height < tempValue) {
          tempValue = this.Frame.height;
        }
        cornerSize = this.GetCornerSize();
        seg = new PolySeg(lineTypes.LINE, 0, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, this.inside.width - 2 * cornerSize, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width - cornerSize, cornerSize);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_TL;
        seg.param = Math.PI / 2;
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, this.inside.width - cornerSize, this.inside.height - cornerSize);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width - 2 * cornerSize, this.inside.height);
        polyList.segs.push(seg);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_BR;
        seg = new PolySeg(lineTypes.LINE, 0, this.inside.height);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, -cornerSize, this.inside.height - cornerSize);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_BL;
        seg.param = Math.PI / 2;
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, -cornerSize, cornerSize);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, 0, 0);
        polyList.segs.push(seg);
        polyList.offset.x = cornerSize;
        polyList.offset.y = 0;
        break;

      case shapeTypes.SED_S_Oval:
      case shapeTypes.SED_S_Circ:
        seg = new PolySeg(lineTypes.LINE, 0, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width / 2, this.inside.height / 2);
        polyList.segs.push(seg);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_BR;
        seg.param = -Math.PI / 2;
        seg = new PolySeg(lineTypes.ARCSEGLINE, 0, this.inside.height);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_BL;
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, -this.inside.width / 2, this.inside.height / 2);
        polyList.segs.push(seg);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_TL;
        seg.param = -Math.PI / 2;
        seg = new PolySeg(lineTypes.ARCSEGLINE, 0, 0);
        polyList.segs.push(seg);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_TL;
        polyList.offset.x = this.inside.width / 2;
        polyList.offset.y = 0;
        break;

      case shapeTypes.SED_S_Doc:
        cornerSize = this.shapeparam;
        seg = new PolySeg(lineTypes.LINE, 0, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, this.inside.width, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, this.inside.width, this.inside.height - cornerSize);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCLINE, this.inside.width / 2, this.inside.height - cornerSize);
        seg.param = cornerSize;
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCLINE, 0, this.inside.height - cornerSize);
        seg.param = -cornerSize;
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, 0, 0);
        polyList.segs.push(seg);
        break;

      case shapeTypes.SED_S_Term:
        if (this.inside.width > this.inside.height) {
          cornerSize = this.inside.height / 2;
          seg = new PolySeg(lineTypes.LINE, 0, 0);
          polyList.segs.push(seg);
          seg = new PolySeg(lineTypes.LINE, this.inside.width - 2 * cornerSize, 0);
          polyList.segs.push(seg);
          seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width - cornerSize, cornerSize);
          seg.ShortRef = ConstantData.ArcQuad.SD_PLA_TL;
          seg.param = Math.PI / 2;
          polyList.segs.push(seg);
          seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width - 2 * cornerSize, this.inside.height);
          polyList.segs.push(seg);
          seg.ShortRef = ConstantData.ArcQuad.SD_PLA_BR;
          seg = new PolySeg(lineTypes.LINE, 0, this.inside.height);
          polyList.segs.push(seg);
          seg = new PolySeg(lineTypes.ARCSEGLINE, -cornerSize, this.inside.height - cornerSize);
          seg.ShortRef = ConstantData.ArcQuad.SD_PLA_BL;
          seg.param = Math.PI / 2;
          polyList.segs.push(seg);
          seg = new PolySeg(lineTypes.ARCSEGLINE, 0, 0);
          seg.ShortRef = ConstantData.ArcQuad.SD_PLA_TL;
          polyList.segs.push(seg);
        } else {
          cornerSize = this.inside.width / 2;
          seg = new PolySeg(lineTypes.LINE, 0, 0);
          polyList.segs.push(seg);
          seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width - cornerSize, cornerSize);
          seg.ShortRef = ConstantData.ArcQuad.SD_PLA_TL;
          seg.param = Math.PI / 2;
          polyList.segs.push(seg);
          seg = new PolySeg(lineTypes.LINE, this.inside.width - cornerSize, this.inside.height - cornerSize);
          polyList.segs.push(seg);
          seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width - 2 * cornerSize, this.inside.height);
          polyList.segs.push(seg);
          seg.ShortRef = ConstantData.ArcQuad.SD_PLA_BR;
          seg = new PolySeg(lineTypes.ARCSEGLINE, -cornerSize, this.inside.height - cornerSize);
          seg.ShortRef = ConstantData.ArcQuad.SD_PLA_BL;
          seg.param = Math.PI / 2;
          polyList.segs.push(seg);
          seg = new PolySeg(lineTypes.LINE, -cornerSize, cornerSize);
          polyList.segs.push(seg);
          seg = new PolySeg(lineTypes.ARCSEGLINE, 0, 0);
          seg.ShortRef = ConstantData.ArcQuad.SD_PLA_TL;
          polyList.segs.push(seg);
        }
        polyList.offset.x = cornerSize;
        polyList.offset.y = 0;
        break;

      case shapeTypes.SED_S_Store:
        cornerSize = this.shapeparam;
        seg = new PolySeg(lineTypes.LINE, 0, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, this.inside.width - cornerSize, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width - 2 * cornerSize, this.inside.height / 2);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_TL;
        seg.param = -Math.PI / 2;
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width - cornerSize, this.inside.height);
        polyList.segs.push(seg);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_BL;
        seg = new PolySeg(lineTypes.LINE, 0, this.inside.height);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, -cornerSize, this.inside.height / 2);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_BL;
        seg.param = Math.PI / 2;
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, 0, 0);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_TL;
        polyList.segs.push(seg);
        polyList.offset.x = cornerSize;
        polyList.offset.y = 0;
        break;

      case shapeTypes.SED_S_Delay:
        cornerSize = this.shapeparam;
        seg = new PolySeg(lineTypes.LINE, 0, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, this.inside.width - cornerSize, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width, this.inside.height / 2);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_TL;
        seg.param = Math.PI / 2;
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width - cornerSize, this.inside.height);
        polyList.segs.push(seg);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_BR;
        seg = new PolySeg(lineTypes.LINE, 0, this.inside.height);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, 0, 0);
        polyList.offset.x = 0;
        polyList.offset.y = 0;
        break;

      case shapeTypes.SED_S_Disp:
        cornerSize = this.shapeparam;
        seg = new PolySeg(lineTypes.LINE, 0, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, this.inside.width - 2 * cornerSize, 0);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width - cornerSize, this.inside.height / 2);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_TL;
        seg.param = Math.PI / 2;
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.ARCSEGLINE, this.inside.width - 2 * cornerSize, this.inside.height);
        polyList.segs.push(seg);
        seg.ShortRef = ConstantData.ArcQuad.SD_PLA_BR;
        seg = new PolySeg(lineTypes.LINE, 0, this.inside.height);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, -cornerSize, this.inside.height / 2);
        polyList.segs.push(seg);
        seg = new PolySeg(lineTypes.LINE, 0, 0);
        polyList.offset.x = cornerSize;
        polyList.offset.y = 0;
        break;

      default:
        // Default case: use poly points from GetPolyPoints
        const frameBackup = this.Frame;
        this.Frame = this.inside;
        const polyPoints = this.GetPolyPoints(ConstantData.Defines.NPOLYPTS, true, true, false, null);
        this.Frame = frameBackup;
        if (polyPoints.length > 0) {
          polyList.offset.x = polyPoints[0].x;
          polyList.offset.y = polyPoints[0].y;
          for (let idx = 0; idx < polyPoints.length; idx++) {
            seg = new PolySeg(lineTypes.LINE, polyPoints[idx].x - polyList.offset.x, polyPoints[idx].y - polyList.offset.y);
            polyList.segs.push(seg);
          }
        }
    }
    polyList.closed = true;
    polyList.dim.x = this.inside.width;
    polyList.dim.y = this.inside.height;
    polyList.wasline = false;
    console.log("= S.BaseShape - GetPolyList output:", polyList);
    return polyList;
  }

  GetListOfEnclosedObjects(isRecursive: boolean) {
    console.log("= S.BaseShape - GetListOfEnclosedObjects input:", { isRecursive });
    let enclosedObjects: number[] = [];
    const containerFlag = ConstantData.ObjMoreFlags.SED_MF_Container;

    // Process only if this object is a container.
    if (this.moreflags & containerFlag) {
      if (this.IsSwimlane()) {
        if (this.FramezList == null) {
          this.FramezList = [];
        }
        console.log("= S.BaseShape - GetListOfEnclosedObjects output (Swimlane):", this.FramezList);
        return this.FramezList;
      }

      let tempVar: any;
      let visibleZList = GlobalData.optManager.VisibleZList();
      let polyRect: any = {};
      const visibleCount = visibleZList.length;
      let baseRect = this.trect;
      let basePoly = this.GetPolyPoints(ConstantData.Defines.NPOLYPTS, false, true, false, null);

      // If this shape is rotated, update the base polygon accordingly.
      if (this.RotationAngle !== 0) {
        const rotationRadians = -this.RotationAngle / (180 / ConstantData.Geometry.PI);
        Utils3.RotatePointsAboutCenter(this.Frame, rotationRadians, basePoly);
      }

      // Determine if we need to adjust the base rect for the table cells.
      let fillIsTransparent = (this.StyleRecord.Fill.Paint.FillType === ConstantData.FillTypes.SDFILL_TRANSPARENT);
      // Override fill transparent check.
      fillIsTransparent = false;
      if (!fillIsTransparent) {
        const tableObj = this.GetTable(false);
        if (tableObj) {
          let cellCount = tableObj.cells.length;
          let transparentCellIndex = -1;
          for (let i = 0; i < cellCount; i++) {
            const cell = tableObj.cells[i];
            if (cell.fill.Paint.FillType === ConstantData.FillTypes.SDFILL_TRANSPARENT) {
              if (transparentCellIndex === -1) {
                transparentCellIndex = i;
              }
            } else if (transparentCellIndex >= 0) {
              transparentCellIndex = -2;
              break;
            }
          }
          if (transparentCellIndex >= 0) {
            // Adjust the base rectangle using the transparent cell's frame.
            const cellFrame = tableObj.cells[transparentCellIndex].frame;
            let newRect = {
              x: cellFrame.x,
              y: cellFrame.y,
              width: tableObj.wd - cellFrame.x,
              height: tableObj.ht - cellFrame.y
            };
            Utils2.OffsetRect(newRect, this.trect.x, this.trect.y);
            baseRect = newRect;
            if (this.RotationAngle !== 0) {
              const originalFrame = $.extend(true, {}, this.Frame);
              this.Frame = newRect;
              basePoly = this.GetPolyPoints(ConstantData.Defines.NPOLYPTS, false, true, false, null);
              this.Frame = originalFrame;
              const rotationRadians = -this.RotationAngle / (180 / ConstantData.Geometry.PI);
              Utils3.RotatePointsAboutCenter(this.Frame, rotationRadians, basePoly);
            }
          } else {
            fillIsTransparent = false;
          }
        }
      }

      // Determine the starting index based on this object's BlockID in the visible Z list.
      let startIndex = 0;
      if (!fillIsTransparent) {
        for (let i = 0; i < visibleCount; i++) {
          if (visibleZList[i] === this.BlockID) {
            startIndex = i + 1;
            break;
          }
        }
      }

      // Collection to hold candidates which might be containers.
      let containerCandidates: number[] = [];
      for (let i = startIndex; i < visibleCount; i++) {
        const candidateId = visibleZList[i];
        if (candidateId !== this.BlockID) {
          let candidateObj = GlobalData.optManager.GetObjectPtr(candidateId, false);
          let candidatePoly: any;
          let candidateRect: any;
          // If candidate is rotated, compute its polygon points.
          if (candidateObj.RotationAngle !== 0) {
            candidatePoly = candidateObj.GetPolyPoints(ConstantData.Defines.NPOLYPTS, false, true, false, null);
            const candidateRotation = -candidateObj.RotationAngle / (180 / ConstantData.Geometry.PI);
            Utils3.RotatePointsAboutCenter(candidateObj.Frame, candidateRotation, candidatePoly);
            Utils2.GetPolyRect(polyRect, candidatePoly);
          } else {
            candidateRect = $.extend(true, {}, candidateObj.Frame);
            polyRect = candidateRect;
          }

          // Determine if the candidate is fully enclosed.
          let isInside = false;
          if (this.RotationAngle !== 0) {
            if (candidateObj.RotationAngle !== 0) {
              isInside = Utils2.IsAllPolyPointsInPoly(basePoly, candidatePoly);
            } else {
              isInside = Utils2.IsAllFrameCornersInPoly(basePoly, polyRect);
            }
          } else {
            if (candidateObj.RotationAngle !== 0) {
              isInside = Utils2.IsAllPolyPointsInPoly(basePoly, candidatePoly);
            } else {
              isInside = Utils2.RectInsideRect(baseRect, polyRect);
            }
          }
          if (isInside) {
            enclosedObjects.push(candidateId);
            if (candidateObj.hooks.length === 2) {
              containerCandidates.push(candidateId);
            }
            // If candidate is a container and we are recursing, then include its enclosed objects.
            if ((candidateObj.moreflags & containerFlag) && isRecursive) {
              const childList = candidateObj.GetListOfEnclosedObjects(true);
              if (childList.length) {
                enclosedObjects = enclosedObjects.concat(childList);
              }
            }
          }
        }
      }

      // Remove container candidates that do not meet full connection criteria.
      for (let i = 0; i < containerCandidates.length; i++) {
        const candidateObj = GlobalData.optManager.GetObjectPtr(containerCandidates[i], false);
        const hookId1 = candidateObj.hooks[0].objid;
        const hookId2 = candidateObj.hooks[1].objid;
        if ((enclosedObjects.indexOf(hookId1) < 0 || enclosedObjects.indexOf(hookId2) < 0) &&
          (enclosedObjects.indexOf(containerCandidates[i]) >= 0)) {
          const indexToRemove = enclosedObjects.indexOf(containerCandidates[i]);
          enclosedObjects.splice(indexToRemove, 1);
        }
      }

    }
    console.log("= S.BaseShape - GetListOfEnclosedObjects output:", enclosedObjects);
    return enclosedObjects;
  }

  PinProportional(actionRect: { x: number; y: number; width: number; height: number }): void {
    console.log("= S.BaseShape PinProportional - Input:", actionRect);

    // Define knob size from constants
    const knobSize = ConstantData.Defines.SED_KnobSize;
    let currentFrameRect: { x: number; y: number; width: number; height: number } = {} as any;

    // If the shape is rotated, compute the rotated bounding rectangle
    if (this.RotationAngle !== 0) {
      const polyPoints = this.GetPolyPoints(ConstantData.Defines.NPOLYPTS, false, false, true, null);
      const rotationRadians = -this.RotationAngle / (180 / ConstantData.Geometry.PI);
      Utils3.RotatePointsAboutCenter(this.Frame, rotationRadians, polyPoints);
      Utils2.GetPolyRect(currentFrameRect, polyPoints);
    } else {
      currentFrameRect = this.Frame;
    }

    // Compute margins based on the current frame and the reference rectangle this.r
    const margins = {
      left: currentFrameRect.x - this.r.x + knobSize / 2,
      top: currentFrameRect.y - this.r.y + knobSize / 2,
      right: (this.r.x + this.r.width) - (currentFrameRect.x + currentFrameRect.width),
      bottom: (this.r.y + this.r.height) - (currentFrameRect.y + currentFrameRect.height)
    };

    // Adjust actionRect vertically if its y is less than the top margin.
    // Note: original code sets actionRect.y to margins.left; preserving as is.
    if (actionRect.y < margins.top) {
      const deltaY = margins.top - actionRect.y;
      const deltaWidth = deltaY * (GlobalData.optManager.theActionAspectRatioWidth / GlobalData.optManager.theActionAspectRatioHeight);
      actionRect.height -= deltaY;
      actionRect.width -= deltaWidth;
      actionRect.y = margins.left;
    }

    // Adjust actionRect horizontally if its x is less than the left margin.
    if (actionRect.x < margins.left) {
      const deltaX = margins.left - actionRect.x;
      const deltaHeight = deltaX * (GlobalData.optManager.theActionAspectRatioHeight / GlobalData.optManager.theActionAspectRatioWidth);
      actionRect.height -= deltaHeight;
      actionRect.width -= deltaX;
      actionRect.x = margins.left;
    }

    console.log("= S.BaseShape PinProportional - Output:", actionRect);
  }

  HandleActionTriggerTrackCommon(e, t, a) {
    var r,
      i,
      n,
      o,
      s,
      l,
      S,
      c,
      //Double ====
      enhance,
      u = GlobalData.optManager.theActionStartX,
      p = GlobalData.optManager.theActionStartY,
      d = e - u,
      D = t - p,
      g = {
        x: e,
        y: t
      },
      h = {},
      m = - 1,
      C = this.GetTable(!1),
      y = this,
      f = GlobalData.optManager.OverrideSnaps(a),
      L = $.extend(!0, {
      }, GlobalData.optManager.theActionBBox),
      I = $.extend(!0, {
      }, GlobalData.optManager.theActionBBox),
      T = function (e) {
        var t;
        if (y.RotationAngle) {
          var a = Utils2.PolyFromRect(e),
            r = - y.RotationAngle / (180 / ConstantData.Geometry.PI);
          t = $.extend(!0, {
          }, e),
            Utils3.RotatePointsAboutCenter(y.Frame, r, a),
            Utils2.GetPolyRect(t, a)
        } else t = e;
        if (Math.floor(t.x) < 0) return !0;
        if (Math.floor(t.y) < 0) return !0;
        if (
          GlobalData.optManager.theContentHeader.flags & ConstantData.ContentHeaderFlags.CT_DA_NoAuto
        ) {
          var i = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
          if (t.x + t.width > i.dim.x) return !0;
          if (t.y + t.height > i.dim.y) return !0
        }
        return !1
      };
    switch (GlobalData.optManager.theActionTriggerID) {
      case ConstantData.ActionTriggerType.TOPLEFT:
        if (
          S = I.x - e,
          c = I.y - t,
          I.x = e,
          I.y = t,
          I.width += S,
          I.height += c,
          GlobalData.docHandler.documentConfig.enableSnap,
          GlobalData.optManager.theActionLockAspectRatio ? (
            I.width < 0 &&
            (
              I.x = GlobalData.optManager.theActionBBox.x + GlobalData.optManager.theActionBBox.width,
              I.width = - I.width
            ),
            r = I.width * GlobalData.optManager.theActionAspectRatioHeight / GlobalData.optManager.theActionAspectRatioWidth,
            I.height < 0 ? (
              I.y = GlobalData.optManager.theActionBBox.y + GlobalData.optManager.theActionBBox.height,
              I.height = r
            ) : (
              I.y = GlobalData.optManager.theActionBBox.y + GlobalData.optManager.theActionBBox.height - r,
              I.height = r
            ),
            this.PinProportional(I)
          ) : (
            I.width < 0 &&
            (
              I.x = GlobalData.optManager.theActionBBox.x + GlobalData.optManager.theActionBBox.width,
              I.width = - I.width
            ),
            I.height < 0 &&
            (
              I.y = GlobalData.optManager.theActionBBox.y + GlobalData.optManager.theActionBBox.height,
              I.height = - I.height
            )
          ),
          T(I)
        ) break;
        GlobalData.optManager.theActionNewBBox = $.extend(!0, {
        }, I),
          this.HandleActionTriggerCallResize(GlobalData.optManager.theActionNewBBox, !0, g);
        break;
      case ConstantData.ActionTriggerType.TOPCENTER:
        if (
          c = I.y - t,
          I.y = t,
          I.height = I.height + c,
          GlobalData.docHandler.documentConfig.enableSnap,
          GlobalData.optManager.theActionLockAspectRatio ? (
            I.height < 0 &&
            (
              I.y = GlobalData.optManager.theActionBBox.y + GlobalData.optManager.theActionBBox.height,
              I.height = - I.height
            ),
            i = I.height * GlobalData.optManager.theActionAspectRatioWidth / GlobalData.optManager.theActionAspectRatioHeight,
            I.x = GlobalData.optManager.theActionBBox.x + GlobalData.optManager.theActionBBox.width / 2 - i / 2,
            I.width = i,
            this.PinProportional(I)
          ) : I.height < 0 &&
          (
            I.y = GlobalData.optManager.theActionBBox.y + GlobalData.optManager.theActionBBox.height,
            I.height = - I.height
          ),
          T(I)
        ) break;
        GlobalData.optManager.theActionNewBBox = $.extend(!0, {
        }, I),
          this.HandleActionTriggerCallResize(GlobalData.optManager.theActionNewBBox, !0, g);
        break;
      case ConstantData.ActionTriggerType.TOPRIGHT:
        if (
          c = I.y - t,
          I.y = t,
          I.height = I.height + c,
          I.width = e - I.x,
          GlobalData.docHandler.documentConfig.enableSnap,
          GlobalData.optManager.theActionLockAspectRatio ? (
            I.width < 0 &&
            (I.x = e, I.width = - I.width),
            r = I.width * GlobalData.optManager.theActionAspectRatioHeight / GlobalData.optManager.theActionAspectRatioWidth,
            I.height < 0 ? (
              I.y = GlobalData.optManager.theActionBBox.y + GlobalData.optManager.theActionBBox.height,
              I.height = r
            ) : (
              I.y = GlobalData.optManager.theActionBBox.y + GlobalData.optManager.theActionBBox.height - r,
              I.height = r
            ),
            I.height = r,
            this.PinProportional(I)
          ) : (
            I.width < 0 &&
            (I.x = e, I.width = - I.width),
            I.height < 0 &&
            (
              I.y = GlobalData.optManager.theActionBBox.y + GlobalData.optManager.theActionBBox.height,
              I.height = - I.height
            )
          ),
          T(I)
        ) break;
        GlobalData.optManager.theActionNewBBox = $.extend(!0, {
        }, I),
          this.HandleActionTriggerCallResize(GlobalData.optManager.theActionNewBBox, !0, g);
        break;
      case ConstantData.ActionTriggerType.CENTERRIGHT:
        if (
          I.width = e - I.x,
          GlobalData.docHandler.documentConfig.enableSnap,
          GlobalData.optManager.theActionLockAspectRatio ? (
            I.width < 0 &&
            (I.x = e, I.width = - I.width),
            r = I.width * GlobalData.optManager.theActionAspectRatioHeight / GlobalData.optManager.theActionAspectRatioWidth,
            I.y = GlobalData.optManager.theActionBBox.y + GlobalData.optManager.theActionBBox.height / 2 - r / 2,
            I.height = r,
            this.PinProportional(I)
          ) : I.width < 0 &&
          (I.x = e, I.width = - I.width),
          T(I)
        ) break;
        GlobalData.optManager.theActionNewBBox = $.extend(!0, {
        }, I),
          this.HandleActionTriggerCallResize(GlobalData.optManager.theActionNewBBox, !0, g);
        break;
      case ConstantData.ActionTriggerType.BOTTOMRIGHT:
        if (
          I.width = e - I.x,
          I.height = t - I.y,
          GlobalData.docHandler.documentConfig.enableSnap,
          GlobalData.optManager.theActionLockAspectRatio ? (
            I.width < 0 &&
            (I.x = e, I.width = - I.width),
            r = I.width * GlobalData.optManager.theActionAspectRatioHeight / GlobalData.optManager.theActionAspectRatioWidth,
            I.height < 0 &&
            (I.y = L.y - r),
            I.height = r,
            this.PinProportional(I)
          ) : (
            I.width < 0 &&
            (I.x = e, I.width = - I.width),
            I.height < 0 &&
            (I.y = t, I.height = - I.height)
          ),
          T(I)
        ) break;
        GlobalData.optManager.theActionNewBBox = $.extend(!0, {
        }, I),
          this.HandleActionTriggerCallResize(GlobalData.optManager.theActionNewBBox, !0, g);
        break;
      case ConstantData.ActionTriggerType.BOTTOMCENTER:
        if (
          I.height = t - I.y,
          GlobalData.docHandler.documentConfig.enableSnap,
          GlobalData.optManager.theActionLockAspectRatio ? (
            I.height < 0 &&
            (I.y = t, I.height = - I.height),
            i = I.height * GlobalData.optManager.theActionAspectRatioWidth / GlobalData.optManager.theActionAspectRatioHeight,
            I.x = GlobalData.optManager.theActionBBox.x + GlobalData.optManager.theActionBBox.width / 2 - i / 2,
            I.width = i,
            this.PinProportional(I)
          ) : I.height < 0 &&
          (I.y = t, I.height = - I.height),
          T(I)
        ) break;
        GlobalData.optManager.theActionNewBBox = $.extend(!0, {
        }, I),
          this.HandleActionTriggerCallResize(GlobalData.optManager.theActionNewBBox, !0, g);
        break;
      case ConstantData.ActionTriggerType.TABLE_SELECT:
      case ConstantData.ActionTriggerType.TABLE_ROWSELECT:
      case ConstantData.ActionTriggerType.TABLE_COLSELECT:
        if (null == C) break;
        C = this.GetTable(!0),
          C = this.GetTable(!0),
          g.x = e - this.trect.x,
          g.y = t - this.trect.y,
          GlobalData.optManager.Table_Select(this, C, g, !0, GlobalData.optManager.theActionTriggerID, !1);
        break;
      case ConstantData.ActionTriggerType.MOVEPOLYSEG:
        g.x = e,
          g.y = t,
          R = GlobalData.optManager.GetObjectPtr(this.BlockID, !1);
        var b = $.extend(!0, {
        }, R.Frame);
        GlobalData.docHandler.documentConfig.enableSnap &&
          !f &&
          (g = GlobalData.docHandler.SnapToGrid(g)),
          GlobalData.optManager.ShapeToPolyLine(this.BlockID, !0, !0),
          (R = GlobalData.optManager.GetObjectPtr(this.BlockID, !1)).MovePolySeg(
            GlobalData.optManager.theActionSVGObject,
            g.x,
            g.y,
            GlobalData.optManager.theActionTriggerID,
            GlobalData.optManager.theActionTriggerData
          ),
          GlobalData.optManager.PolyLineToShape(R.BlockID, !0);
        if (
          s = (R = GlobalData.optManager.GetObjectPtr(this.BlockID, !1)).trect,
          l = this.TextGrow === ConstantData.TextGrowBehavior.HORIZONTAL ? GlobalData.optManager.theContentHeader.MaxWorkDim.x : s.width,
          GlobalData.optManager.theActionSVGObject &&
          GlobalData.optManager.theActionSVGObject.textElem
        ) {
          var M = GlobalData.optManager.theActionSVGObject.textElem;
          theMinDim = M.CalcTextFit(l);
          var P = theMinDim.width;
          if (theMinDim.height > s.height || P > s.width) {
            GlobalData.optManager.ShapeToPolyLine(this.BlockID, !0, !0);
            var R = GlobalData.optManager.GetObjectPtr(this.BlockID, !1);
            g.x = GlobalData.optManager.theActionTableLastX,
              g.y = GlobalData.optManager.theActionTableLastY,
              R.MovePolySeg(
                GlobalData.optManager.theActionSVGObject,
                g.x,
                g.y,
                GlobalData.optManager.theActionTriggerID,
                GlobalData.optManager.theActionTriggerData
              ),
              GlobalData.optManager.PolyLineToShape(this.BlockID, !0),
              R = GlobalData.optManager.GetObjectPtr(this.BlockID, !1)
          }
        }
        if (
          GlobalData.optManager.theActionNewBBox = $.extend(!0, {
          }, R.Frame),
          R.HandleActionTriggerCallResize(
            GlobalData.optManager.theActionNewBBox,
            ConstantData.ActionTriggerType.MOVEPOLYSEG,
            g
          ),
          GlobalData.optManager.theActionTableLastX = g.x,
          GlobalData.optManager.theActionTableLastY = g.y,
          R.RotationAngle
        ) {
          var A = GlobalData.optManager.theActionSVGObject.GetRotation(),
            _ = $.extend(!0, {
            }, R.Frame),
            E = (
              h = GlobalData.optManager.svgDoc.CalculateRotatedOffsetForResize(b, _, A),
              GlobalData.optManager.theActionSVGObject.GetPos()
            );
          E.x += h.x,
            E.y += h.y,
            GlobalData.optManager.theActionSVGObject.SetPos(E.x, E.y),
            GlobalData.optManager.theActionBBox.x += h.x,
            GlobalData.optManager.theActionBBox.y += h.y,
            GlobalData.optManager.theActionStartX += h.x,
            GlobalData.optManager.theActionStartY += h.y,
            R.Frame.x += h.x,
            R.Frame.y += h.y
        }
        break;
      case ConstantData.ActionTriggerType.TABLE_COL:
        if (null == C) break;
        C = this.GetTable(!0),
          g.x = e,
          g.y = t,
          GlobalData.docHandler.documentConfig.enableSnap &&
          !f &&
          (g = GlobalData.docHandler.SnapToGrid(g)),
          d = g.x - u;
        var w = GlobalData.optManager.Table_GetColumnAndSegment(GlobalData.optManager.theActionTriggerData);
        this.objecttype === ConstantData.ObjectTypes.SD_OBJT_SWIMLANE_COLS &&
          this.RotationAngle &&
          (d = - d, w.column++),
          n = GlobalData.optManager.Table_GrowColumn(this, C, w.column, d, this.TextGrow, !1, !1, !1, this.IsSwimlane());
        $.extend(!0, {
        }, this.trect);
        var F = {
          column: w.column,
          theDeltaX: d
        };
        Collab.SendSVGEvent(
          this.BlockID,
          ConstantData.CollabSVGEventTypes.Table_GrowColumn,
          null,
          F
        ),
          (o = Utils1.DeepCopy(this)).trect.width = n.x,
          o.trect.height = n.y,
          o.TRectToFrame(o.trect, !0),
          n.x = o.Frame.width,
          n.y = o.Frame.height;
        var v = I.width;
        if (
          I.width = n.x,
          I.height = n.y,
          this.objecttype === ConstantData.ObjectTypes.SD_OBJT_SWIMLANE_COLS &&
          this.RotationAngle &&
          (I.x -= I.width - v),
          GlobalData.optManager.theActionLockAspectRatio ? (
            I.width < 0 &&
            (I.x = e, I.width = - I.width),
            r = I.width * GlobalData.optManager.theActionAspectRatioHeight / GlobalData.optManager.theActionAspectRatioWidth,
            I.y = GlobalData.optManager.theActionBBox.y + GlobalData.optManager.theActionBBox.height / 2 - r / 2,
            I.height = r,
            this.PinProportional(I),
            m = ConstantData.ActionTriggerType.TABLE_COL
          ) : I.width < 0 &&
          (I.x = e, I.width = - I.width),
          T(I)
        ) {
          d = GlobalData.optManager.theActionTableLastX - u,
            GlobalData.optManager.Table_GrowColumn(this, C, w.column, d, this.TextGrow, !1, !0, !1);
          break
        }
        GlobalData.optManager.theActionNewBBox = $.extend(!0, {
        }, I),
          GlobalData.optManager.theActionTableLastX = e,
          GlobalData.optManager.theActionTableLastY = t,
          this.HandleActionTriggerCallResize(GlobalData.optManager.theActionNewBBox, m, g);
        break;
      case ConstantData.ActionTriggerType.TABLE_ROW:
        if (null == C) break;
        C = this.GetTable(!0),
          g.x = e,
          g.y = t,
          GlobalData.docHandler.documentConfig.enableSnap &&
          !f &&
          (g = GlobalData.docHandler.SnapToGrid(g));
        var G = GlobalData.optManager.Table_GetRowAndSegment(GlobalData.optManager.theActionTriggerData);
        if (
          D = g.y - p,
          n = GlobalData.optManager.Table_GrowRow(C, G.row, D, !1),
          (o = Utils1.DeepCopy(this)).trect.width = n.x,
          o.trect.height = n.y,
          o.TRectToFrame(o.trect, !0),
          n.x = o.Frame.width,
          n.y = o.Frame.height,
          I.height = n.y,
          GlobalData.optManager.theActionLockAspectRatio ? (
            I.height < 0 &&
            (I.y = t, I.height = - I.height),
            i = I.height * GlobalData.optManager.theActionAspectRatioWidth / GlobalData.optManager.theActionAspectRatioHeight,
            I.x = GlobalData.optManager.theActionBBox.x + GlobalData.optManager.theActionBBox.width / 2 - i / 2,
            I.width = i,
            this.PinProportional(I),
            m = ConstantData.ActionTriggerType.TABLE_ROW
          ) : I.height < 0 &&
          (I.y = t, I.height = - I.height),
          T(I)
        ) {
          D = GlobalData.optManager.theActionTableLastY - p,
            GlobalData.optManager.Table_GrowRow(C, G.row, D, !1);
          break
        }
        GlobalData.optManager.theActionNewBBox = $.extend(!0, {
        }, I),
          GlobalData.optManager.theActionTableLastX = e,
          GlobalData.optManager.theActionTableLastY = t,
          this.HandleActionTriggerCallResize(GlobalData.optManager.theActionNewBBox, m, g);
        break;
      case ConstantData.ActionTriggerType.BOTTOMLEFT:
        if (
          I.height = t - I.y,
          S = I.x - e,
          I.x = e,
          I.width += S,
          GlobalData.docHandler.documentConfig.enableSnap,
          GlobalData.optManager.theActionLockAspectRatio ? (
            I.width < 0 &&
            (
              I.x = GlobalData.optManager.theActionBBox.x + GlobalData.optManager.theActionBBox.width,
              I.width = - I.width
            ),
            r = I.width * GlobalData.optManager.theActionAspectRatioHeight / GlobalData.optManager.theActionAspectRatioWidth,
            I.height < 0 &&
            (I.y = L.y - r),
            I.height = r,
            this.PinProportional(I)
          ) : (
            I.width < 0 &&
            (
              I.x = GlobalData.optManager.theActionBBox.x + GlobalData.optManager.theActionBBox.width,
              I.width = - I.width
            ),
            I.height < 0 &&
            (I.y = t, I.height = - I.height)
          ),
          T(I)
        ) break;
        GlobalData.optManager.theActionNewBBox = $.extend(!0, {
        }, I),
          this.HandleActionTriggerCallResize(GlobalData.optManager.theActionNewBBox, !0, g);
        break;
      case ConstantData.ActionTriggerType.CENTERLEFT:
        if (
          S = I.x - e,
          I.x = e,
          I.width += S,
          GlobalData.docHandler.documentConfig.enableSnap,
          GlobalData.optManager.theActionLockAspectRatio ? (
            I.width < 0 &&
            (
              I.x = GlobalData.optManager.theActionBBox.x + GlobalData.optManager.theActionBBox.width,
              I.width = - I.width
            ),
            r = I.width * GlobalData.optManager.theActionAspectRatioHeight / GlobalData.optManager.theActionAspectRatioWidth,
            I.y = GlobalData.optManager.theActionBBox.y + GlobalData.optManager.theActionBBox.height / 2 - r / 2,
            I.height = r,
            this.PinProportional(I)
          ) : I.width < 0 &&
          (
            I.x = GlobalData.optManager.theActionBBox.x + GlobalData.optManager.theActionBBox.width,
            I.width = - I.width
          ),
          T(I)
        ) break;
        GlobalData.optManager.theActionNewBBox = $.extend(!0, {
        }, I),
          this.HandleActionTriggerCallResize(GlobalData.optManager.theActionNewBBox, !0, g);
        break;
      case ConstantData.ActionTriggerType.CONTAINER_ADJ:
        var N,
          k,
          U,
          J;
        for (
          N = GlobalData.optManager.theDragElementList.length,
          GlobalData.optManager.theActionContainerArrangement === ConstantData.ContainerListArrangements.Column ? (
            - D > GlobalData.optManager.theActionOldExtra &&
            (D = - GlobalData.optManager.theActionOldExtra),
            GlobalData.optManager.theActionTableLastY = D,
            d = 0
          ) : (
            - d > GlobalData.optManager.theActionOldExtra &&
            (d = - GlobalData.optManager.theActionOldExtra),
            GlobalData.optManager.theActionTableLastY = d,
            D = 0
          ),
          k = 0;
          k < N;
          k++
        ) J = GlobalData.optManager.theDragBBoxList[k],
          (U = GlobalData.optManager.GetSVGDragElement(k)) &&
          U.SetPos(J.x + d, J.y + D);
        break;
      case ConstantData.ActionTriggerType.ROTATE:
        var x = e - GlobalData.optManager.theRotatePivotX,
          O = t - GlobalData.optManager.theRotatePivotY,
          B = 0;
        0 === x &&
          0 === O ? B = 0 : 0 === x ? B = O > 0 ? 90 : 270 : x >= 0 &&
            O >= 0 ? (B = Math.atan(O / x), B *= 180 / ConstantData.Geometry.PI) : x < 0 &&
              O >= 0 ||
              x < 0 &&
              O < 0 ? B = 180 + (B = Math.atan(O / x)) * (180 / ConstantData.Geometry.PI) : x >= 0 &&
              O < 0 &&
          (B = 360 + (B = Math.atan(O / x)) * (180 / ConstantData.Geometry.PI)),
          GlobalData.docHandler.documentConfig.enableSnap &&
          !f &&
          (
            enhance = GlobalData.optManager.EnhanceSnaps(a),
            B = enhance ? Math.round(B / GlobalData.optManager.enhanceRotateSnap) * GlobalData.optManager.enhanceRotateSnap : Math.round(B / GlobalData.optManager.theRotateSnap) * GlobalData.optManager.theRotateSnap
          );
        var H = this.GetPolyPoints(ConstantData.Defines.NPOLYPTS, !1, !1, !0, null),
          V = - B / (180 / ConstantData.Geometry.PI),
          j = {};
        if (
          Utils3.RotatePointsAboutCenter(this.Frame, V, H),
          Utils2.GetPolyRect(j, H),
          j.x < 0
        ) break;
        if (j.y < 0) break;
        if (
          GlobalData.optManager.theContentHeader.flags & ConstantData.ContentHeaderFlags.CT_DA_NoAuto
        ) {
          var z = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1);
          if (j.x + j.width > z.dim.x) break;
          if (j.y + j.height > z.dim.y) break
        }
        GlobalData.optManager.theRotateEndRotation = B,
          this.Rotate(GlobalData.optManager.theActionSVGObject, B);
        var W = GlobalData.optManager.SD_GetVisioTextChild(this.BlockID);
        if (W >= 0) {
          var q = GlobalData.optManager.GetObjectPtr(W, !0);
          if (q) {
            var K = GlobalData.optManager.svgObjectLayer.GetElementByID(q.BlockID);
            K &&
              (B -= q.VisioRotationDiff, q.Rotate(K, B))
          }
        }
        break;
      case ConstantData.ActionTriggerType.DIMENSION_LINE_ADJ:
        this.DimensionLineDeflectionAdjust(
          GlobalData.optManager.theActionSVGObject,
          e,
          t,
          GlobalData.optManager.theActionTriggerID,
          GlobalData.optManager.theActionTriggerData
        )
    }
  }

  HandleActionTriggerCallResize(newFrame, triggerType, event, prevFrame) {
    console.log("= S.BaseShape - HandleActionTriggerCallResize input:", { newFrame, triggerType, event, prevFrame });

    let table, newSize, textFit, textElem, visioTextChild, visioTextChildObj, visioTextChildElem;
    let isLineThickness = false;
    let isLineLength = false;
    this.prevBBox = prevFrame ? $.extend(true, {}, prevFrame) : $.extend(true, {}, this.Frame);
    const originalFrame = $.extend(false, {}, this.Frame);

    // Ensure minimum dimensions
    newFrame.width < ConstantData.Defines.SED_MinDim && (newFrame.width = ConstantData.Defines.SED_MinDim);
    newFrame.height < ConstantData.Defines.SED_MinDim && (newFrame.height = ConstantData.Defines.SED_MinDim);

    this.UpdateFrame(newFrame);

    if (triggerType === ConstantData.ActionTriggerType.LINELENGTH) {
      triggerType = 0;
      isLineLength = true;
    }

    if (triggerType === ConstantData.ActionTriggerType.LINE_THICKNESS) {
      triggerType = 0;
      isLineThickness = true;
    }

    if (GlobalData.optManager.theActionStoredObjectID === this.BlockID && event) {
      GlobalData.optManager.UpdateDisplayCoordinates(newFrame, event, ConstantData.CursorTypes.Grow, this);
    }

    let shouldResize = true;
    table = this.GetTable(false);

    if (triggerType === -1) {
      shouldResize = false;
      triggerType = true;
    } else if (triggerType === ConstantData.ActionTriggerType.TABLE_EDIT) {
      shouldResize = false;
      triggerType = false;
    }

    if (table && shouldResize) {
      let widthDiff = newFrame.width - GlobalData.optManager.theActionBBox.width;
      if (!triggerType) {
        GlobalData.optManager.theActionTable = Utils1.DeepCopy(table);
      }
      if (Utils2.IsEqual(widthDiff, 0) && !isLineThickness) {
        widthDiff = null;
        this.trect.width = table.wd;
        this.TRectToFrame(this.trect, triggerType || isLineLength);
      } else {
        widthDiff = this.trect.width;
      }

      let heightDiff = newFrame.height - GlobalData.optManager.theActionBBox.height;
      if (Utils2.IsEqual(heightDiff, 0) && !isLineThickness) {
        heightDiff = null;
        this.trect.height = table.ht;
        this.TRectToFrame(this.trect, triggerType || isLineLength);
      } else {
        heightDiff = this.trect.height;
      }

      switch (triggerType) {
        case ConstantData.ActionTriggerType.TABLE_ROW:
          heightDiff = null;
          break;
        case ConstantData.ActionTriggerType.TABLE_COL:
          widthDiff = null;
          break;
      }

      if (widthDiff || heightDiff) {
        const originalHeight = GlobalData.optManager.theActionTable.ht;
        table = this.GetTable(true);
        newSize = GlobalData.optManager.Table_Resize(this, table, GlobalData.optManager.theActionTable, widthDiff, heightDiff);

        if (!Utils2.IsEqual(newSize.y, originalHeight) && (triggerType || isLineThickness)) {
          const tempShape = Utils1.DeepCopy(this);
          tempShape.trect.width = newSize.x;
          tempShape.trect.height = newSize.y;
          tempShape.TRectToFrame(tempShape.trect, true);
          GlobalData.optManager.theActionNewBBox.height = tempShape.Frame.height;
        }

        if (newSize.x - this.trect.width > 0.1 || newSize.y - this.trect.height > 0.1 || (!Utils2.IsEqual(newSize.y, originalHeight) && isLineLength)) {
          const tempRect = {
            x: this.trect.x,
            y: this.trect.y,
            width: newSize.x,
            height: newSize.y
          };
          this.TRectToFrame(tempRect, triggerType || isLineLength);
          newFrame = $.extend(false, {}, this.Frame);

          if (newSize.x - this.trect.width > 0.1 && newSize.y - this.trect.height > 0.1 || !triggerType) {
            return;
          }
          GlobalData.optManager.theActionNewBBox = $.extend(false, {}, this.Frame);
        }
      }
    } else if (this.DataID !== -1 && !(this.TextFlags & ConstantData.TextFlags.SED_TF_AttachA || this.TextFlags & ConstantData.TextFlags.SED_TF_AttachB)) {
      const svgElem = GlobalData.optManager.svgObjectLayer.GetElementByID(this.BlockID);
      if (svgElem) {
        textElem = svgElem.textElem;
        const textRect = this.trect;
        const maxWidth = this.TextGrow === ConstantData.TextGrowBehavior.HORIZONTAL ? GlobalData.optManager.theContentHeader.MaxWorkDim.x : textRect.width;
        textFit = textElem ? textElem.CalcTextFit(maxWidth) : { width: 0, height: 0 };

        const trimmedWidth = Utils2.TrimDP(textFit.width, GlobalData.docHandler.rulerSettings.dp);
        const trimmedHeight = Utils2.TrimDP(textFit.height, GlobalData.docHandler.rulerSettings.dp);
        const roundedWidth = Utils2.TrimDP(textFit.width, 0);
        const roundedHeight = Utils2.TrimDP(textFit.height, 0);
        const roundedTextRectHeight = Utils2.TrimDP(textRect.height, 0);
        const roundedTextRectWidth = Utils2.TrimDP(textRect.width, 0);

        if (roundedHeight !== 0 && Math.abs(roundedTextRectHeight - roundedHeight) <= 1) {
          roundedHeight = roundedTextRectHeight;
        }
        if (roundedWidth !== 0 && Math.abs(roundedTextRectWidth - roundedWidth) <= 1) {
          roundedWidth = roundedTextRectWidth;
        }

        if (roundedHeight > roundedTextRectHeight || roundedWidth > roundedTextRectWidth) {
          if (!triggerType) {
            if (trimmedHeight > (textRect = Utils1.DeepCopy(this.trect)).height) {
              textRect.height = trimmedHeight;
            }
            if (trimmedWidth > textRect.width) {
              textRect.width = trimmedWidth;
            }
            this.TRectToFrame(textRect, triggerType);
          }
          this.UpdateFrame(originalFrame);
          return;
        }
      }
    }

    if (triggerType && GlobalData.optManager.theActionSVGObject && GlobalData.optManager.theActionStoredObjectID === this.BlockID) {
      const offset = this.Resize(GlobalData.optManager.theActionSVGObject, GlobalData.optManager.theActionNewBBox, this, triggerType);
      GlobalData.optManager.theActionBBox.x += offset.x;
      GlobalData.optManager.theActionBBox.y += offset.y;
      GlobalData.optManager.theActionStartX += offset.x;
      GlobalData.optManager.theActionStartY += offset.y;
      this.Frame.x += offset.x;
      this.Frame.y += offset.y;
      this.inside.x += offset.x;
      this.inside.y += offset.y;
      this.trect.x += offset.x;
      this.trect.y += offset.y;
    }

    console.log("= S.BaseShape - HandleActionTriggerCallResize output:", { newFrame, triggerType, event, prevFrame });
  }

  HandleActionTriggerDoAutoScroll() {
    console.log("= S.BaseShape - HandleActionTriggerDoAutoScroll input");

    GlobalData.optManager.autoScrollTimerID = GlobalData.optManager.autoScrollTimer.setTimeout('HandleActionTriggerDoAutoScroll', 100);
    let coords = GlobalData.optManager.svgDoc.ConvertWindowToDocCoords(GlobalData.optManager.autoScrollXPos, GlobalData.optManager.autoScrollYPos);

    this.PinAction(coords);
    coords = GlobalData.optManager.DoAutoGrowDrag(coords);
    GlobalData.docHandler.ScrollToPosition(coords.x, coords.y);

    if (GlobalData.optManager.theActionTriggerID !== ConstantData.ActionTriggerType.ROTATE && GlobalData.optManager.theRotateObjectRadians) {
      const frame = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theActionStoredObjectID, false).Frame;
      const center = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };
      const rotatedPoint = GlobalData.optManager.RotatePointAroundPoint(center, coords, GlobalData.optManager.theRotateObjectRadians);
      coords.x = rotatedPoint.x;
      coords.y = rotatedPoint.y;
    }

    this.HandleActionTriggerTrackCommon(coords.x, coords.y);

    console.log("= S.BaseShape - HandleActionTriggerDoAutoScroll output", coords);
  }

  AutoScrollCommon(event, enableSnap, autoScrollCallback) {
    console.log("= S.BaseShape - AutoScrollCommon input:", { event, enableSnap, autoScrollCallback });

    let shouldAutoScroll = false;
    const overrideSnaps = GlobalData.optManager.OverrideSnaps(event);
    if (overrideSnaps) {
      enableSnap = false;
    }

    const clientX = event.gesture.center.clientX;
    const clientY = event.gesture.center.clientY;
    let scrollX = clientX;
    let scrollY = clientY;
    const docInfo = GlobalData.optManager.svgDoc.docInfo;

    if (clientX >= docInfo.dispX + docInfo.dispWidth - 4) {
      shouldAutoScroll = true;
      scrollX = docInfo.dispX + docInfo.dispWidth - 4 + 32;
    } else if (clientX < docInfo.dispX) {
      shouldAutoScroll = true;
      scrollX = docInfo.dispX - 32;
    }

    if (clientY >= docInfo.dispY + docInfo.dispHeight - 4) {
      shouldAutoScroll = true;
      scrollY = docInfo.dispY + docInfo.dispHeight - 4 + 32;
    } else if (clientY < docInfo.dispY) {
      shouldAutoScroll = true;
      scrollY = docInfo.dispY - 32;
    }

    if (shouldAutoScroll) {
      if (enableSnap && GlobalData.docHandler.documentConfig.enableSnap) {
        const snappedCoords = GlobalData.docHandler.SnapToGrid({ x: scrollX, y: scrollY });
        scrollX = snappedCoords.x;
        scrollY = snappedCoords.y;
      }

      GlobalData.optManager.autoScrollXPos = scrollX;
      GlobalData.optManager.autoScrollYPos = scrollY;

      if (GlobalData.optManager.autoScrollTimerID !== -1) {
        console.log("= S.BaseShape - AutoScrollCommon output: false (timer already set)");
        return false;
      }

      GlobalData.optManager.autoScrollTimer = new HvTimer(this);
      GlobalData.optManager.autoScrollTimerID = GlobalData.optManager.autoScrollTimer.setTimeout(autoScrollCallback, 0);
      console.log("= S.BaseShape - AutoScrollCommon output: false (timer started)");
      return false;
    }

    this.ResetAutoScrollTimer();
    console.log("= S.BaseShape - AutoScrollCommon output: true");
    return true;
  }

  PinAction(coords) {
    console.log("= S.BaseShape - PinAction input:", coords);

    const knobSize = ConstantData.Defines.SED_KnobSize;
    let frameRect = {};
    let rotatedRect = {};

    if (this.RotationAngle !== 0) {
      const polyPoints = this.GetPolyPoints(ConstantData.Defines.NPOLYPTS, false, false, true, null);
      const rotationRadians = -this.RotationAngle / (180 / ConstantData.Geometry.PI);
      Utils3.RotatePointsAboutCenter(this.Frame, rotationRadians, polyPoints);
      Utils2.GetPolyRect(rotatedRect, polyPoints);
    } else {
      rotatedRect = this.Frame;
    }

    frameRect.left = rotatedRect.x - this.r.x + knobSize / 2;
    frameRect.top = rotatedRect.y - this.r.y + knobSize / 2;
    frameRect.right = this.r.x + this.r.width - (rotatedRect.x + rotatedRect.width) + knobSize / 2;
    frameRect.bottom = this.r.y + this.r.height - (rotatedRect.y + rotatedRect.height) + knobSize / 2;

    if (coords.x < frameRect.left) {
      coords.x = frameRect.left;
    }
    if (coords.y < frameRect.top) {
      coords.y = frameRect.top;
    }

    if (GlobalData.optManager.theContentHeader.flags & ConstantData.ContentHeaderFlags.CT_DA_NoAuto) {
      const sessionBlock = GlobalData.objectStore.GetObject(GlobalData.optManager.theSEDSessionBlockID).Data;
      if (coords.x > sessionBlock.dim.x - frameRect.right) {
        coords.x = sessionBlock.dim.x - frameRect.right;
      }
      if (coords.y > sessionBlock.dim.y - frameRect.bottom) {
        coords.y = sessionBlock.dim.y - frameRect.bottom;
      }
    }

    console.log("= S.BaseShape - PinAction output:", coords);
    return coords;
  }

  ActionApplySnaps(coords, triggerType) {
    console.log("= S.BaseShape - ActionApplySnaps input:", { coords, triggerType });

    let snapRect = this.GetSnapRect();
    let snapApplied = false;
    let snapGuides = [];
    let adjustedRect = {};
    let snapOffsets = { x: null, y: null };
    const actionTriggerType = ConstantData.ActionTriggerType;

    let dynamicGuides;

    const adjustBottom = (rect) => {
      adjustedRect.x = rect.x;
      adjustedRect.y = rect.y;
      adjustedRect.width = rect.width;
      adjustedRect.height = coords.y - rect.y;
      if (adjustedRect.height < 0) {
        adjustedRect.y = coords.y;
        adjustedRect.height = rect.y - coords.y;
        snapGuides.push('left_top', 'right_top');
      } else {
        snapGuides.push('left_bottom', 'right_bottom');
      }
      snapApplied = true;
    };

    const adjustTop = (rect) => {
      adjustedRect.x = rect.x;
      adjustedRect.y = coords.y;
      adjustedRect.width = rect.width;
      adjustedRect.height = rect.y + rect.height - coords.y;
      if (adjustedRect.height < 0) {
        adjustedRect.y = rect.y;
        adjustedRect.height = coords.y - rect.y;
        snapGuides.push('left_bottom', 'right_bottom');
      } else {
        snapGuides.push('left_top', 'right_top');
      }
      snapApplied = true;
    };

    const adjustRight = (rect) => {
      adjustedRect.y = rect.y;
      adjustedRect.x = coords.x;
      adjustedRect.height = rect.height;
      adjustedRect.width = rect.x + rect.width - coords.x;
      if (adjustedRect.width < 0) {
        adjustedRect.x = rect.x;
        adjustedRect.width = coords.x - rect.x;
        snapGuides.push('above_right', 'below_right');
      } else {
        snapGuides.push('above_left', 'below_left');
      }
      snapApplied = true;
    };

    const adjustLeft = (rect) => {
      adjustedRect.y = rect.y;
      adjustedRect.x = rect.x;
      adjustedRect.height = rect.height;
      adjustedRect.width = coords.x - rect.x;
      if (adjustedRect.width < 0) {
        adjustedRect.x = coords.x;
        adjustedRect.width = rect.x - coords.x;
        snapGuides.push('above_left', 'below_left');
      } else {
        snapGuides.push('above_right', 'below_right');
      }
      snapApplied = true;
    };

    if (GlobalData.optManager.AllowSnapToShapes()) {
      switch (triggerType) {
        case actionTriggerType.BOTTOMCENTER:
          adjustBottom(snapRect);
          break;
        case actionTriggerType.BOTTOMLEFT:
          adjustBottom(snapRect);
          adjustRight(Utils1.DeepCopy(adjustedRect));
          break;
        case actionTriggerType.BOTTOMRIGHT:
          adjustBottom(snapRect);
          adjustLeft(Utils1.DeepCopy(adjustedRect));
          break;
        case actionTriggerType.CENTERLEFT:
          adjustRight(snapRect);
          break;
        case actionTriggerType.CENTERRIGHT:
          adjustLeft(snapRect);
          break;
        case actionTriggerType.TOPCENTER:
          adjustTop(snapRect);
          break;
        case actionTriggerType.TOPRIGHT:
          adjustTop(snapRect);
          adjustLeft(Utils1.DeepCopy(adjustedRect));
          break;
        case actionTriggerType.TOPLEFT:
          adjustTop(snapRect);
          adjustRight(Utils1.DeepCopy(adjustedRect));
          break;
      }

      if (snapApplied) {
        dynamicGuides = new ListManager.Dynamic_Guides();
        if (this.DrawingObjectBaseClass === ConstantData.DrawingObjectBaseClass.SHAPE) {
          snapOffsets = GlobalData.optManager.DynamicSnaps_GetSnapObjects(this.BlockID, adjustedRect, dynamicGuides, null, snapGuides);
          if (snapOffsets.x !== null) coords.x += snapOffsets.x;
          if (snapOffsets.y !== null) coords.y += snapOffsets.y;
        }
      }
    }

    if (GlobalData.docHandler.documentConfig.enableSnap) {
      const gridSnap = GlobalData.docHandler.SnapToGrid(coords);
      if (snapOffsets.x === null) coords.x = gridSnap.x;
      if (snapOffsets.y === null) coords.y = gridSnap.y;
    }

    console.log("= S.BaseShape - ActionApplySnaps output:", dynamicGuides);
    return dynamicGuides;
  }

  LM_ActionTrack(e) {
    console.log('============ListManager.BaseShape.prototype.LM_ActionTrack e=>', e);
    if (
      Utils2.StopPropagationAndDefaults(e),
      - 1 == GlobalData.optManager.theActionStoredObjectID
    ) return !1;
    var t = null,
      a = ConstantData.ActionTriggerType;
    t = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theActionStoredObjectID, !1),
      GlobalData.optManager.theActionTriggerID != ConstantData.ActionTriggerType.ROTATE &&
      t.SetDimensionLinesVisibility(GlobalData.optManager.theActionSVGObject, !1);
    var r = t.Frame,
      i = (
        e.target,
        GlobalData.optManager.svgDoc.ConvertWindowToDocCoords(e.gesture.center.clientX, e.gesture.center.clientY)
      );
    this.PinAction(i),
      i = GlobalData.optManager.DoAutoGrowDrag(i);
    var n = GlobalData.optManager.OverrideSnaps(e),
      o = !1;
    switch (GlobalData.optManager.theActionTriggerID) {
      case a.MODIFYSHAPE:
      case a.ROTATE:
        o = !0
    }
    if (!o && !n) var s = this.ActionApplySnaps(i, GlobalData.optManager.theActionTriggerID);
    var l = i.x,
      S = i.y,
      c = {},
      u = {},
      p = {};
    if (
      GlobalData.optManager.theActionTriggerID != ConstantData.ActionTriggerType.ROTATE &&
      GlobalData.optManager.theRotateObjectRadians &&
      (
        c.x = l,
        c.y = S,
        u.x = r.x + r.width / 2,
        u.y = r.y + r.height / 2,
        l = (
          p = GlobalData.optManager.RotatePointAroundPoint(u, c, GlobalData.optManager.theRotateObjectRadians)
        ).x,
        S = p.y,
        i.x = l,
        i.y = S
      ),
      this.AutoScrollCommon(e, !0, 'HandleActionTriggerDoAutoScroll') &&
      (
        i = this.LM_ActionDuringTrack(i),
        this.HandleActionTriggerTrackCommon(i.x, i.y, e),
        GlobalData.optManager.theActionTriggerID != ConstantData.ActionTriggerType.ROTATE &&
        t &&
        t.SetDimensionLinesVisibility(GlobalData.optManager.theActionSVGObject, !0),
        s
      )
    ) {
      var d = Utils1.DeepCopy(this.Frame);
      this.Frame = GlobalData.optManager.theActionNewBBox;
      var D = this.GetSnapRect();
      this.Frame = d,
        GlobalData.optManager.DynamicSnaps_UpdateGuides(s, this.BlockID, D)
    }
  }

  LM_ActionRelease(event, triggerData) {
    console.log('= S.BaseShape - LM_ActionRelease input:', { event, triggerData });

    try {
      const isGanttChart = this.objecttype === ConstantData.ObjectTypes.SD_OBJT_GANTT_CHART;
      const isTimeline = this.objecttype === ConstantData.ObjectTypes.SD_OBJT_NG_TIMELINE;
      let shouldUpdateGeometry = false;
      let shouldUpdateTimeline = false;
      const storedObject = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theActionStoredObjectID, false);

      if (!storedObject) return;

      if (!triggerData) {
        GlobalData.optManager.unbindActionClickHammerEvents();
        this.ResetAutoScrollTimer();

        if (!GlobalData.optManager.theActionSVGObject || GlobalData.optManager.theActionStoredObjectID < 0) return;

        let collabMessage = null;
        let shouldSendCollabMessage = false;

        if (Collab.AllowMessage()) {
          collabMessage = {
            BlockID: GlobalData.optManager.theActionStoredObjectID,
            ActionTriggerID: GlobalData.optManager.theActionTriggerID,
            ActionData: GlobalData.optManager.theActionTriggerData,
            Frame: Utils1.DeepCopy(storedObject.Frame),
            theRotateEndRotation: GlobalData.optManager.theRotateEndRotation
          };
          shouldSendCollabMessage = true;
        }

        switch (GlobalData.optManager.theActionTriggerID) {
          case ConstantData.ActionTriggerType.TABLE_ROW:
            const tableRow = storedObject.GetTable(false);
            if (tableRow) {
              const rowSegment = GlobalData.optManager.Table_GetRowAndSegment(GlobalData.optManager.theActionTriggerData);
              GlobalData.optManager.Table_SelectRowDivider(storedObject, rowSegment.row, false);
            }
            shouldUpdateGeometry = true;
            break;

          case ConstantData.ActionTriggerType.TABLE_COL:
            const tableCol = storedObject.GetTable(false);
            if (tableCol) {
              const colSegment = GlobalData.optManager.Table_GetColumnAndSegment(GlobalData.optManager.theActionTriggerData);
              let column = colSegment.column;
              if (this.objecttype === ConstantData.ObjectTypes.SD_OBJT_SWIMLANE_COLS && this.RotationAngle) {
                column++;
              }
              if (column >= 0) {
                GlobalData.optManager.Table_SelectColDivider(storedObject, column, false);
                if (shouldSendCollabMessage) {
                  collabMessage.ColumnWidth = tableCol.cols[colSegment.column].x;
                  if (colSegment.column > 0) {
                    collabMessage.ColumnWidth -= tableCol.cols[colSegment.column - 1].x;
                  }
                }
              }
            }
            shouldUpdateGeometry = true;
            break;

          case ConstantData.ActionTriggerType.TABLE_SELECT:
          case ConstantData.ActionTriggerType.TABLE_ROWSELECT:
          case ConstantData.ActionTriggerType.TABLE_COLSELECT:
            shouldUpdateGeometry = true;
            if (!Collab.IsPrimary()) {
              collabMessage = null;
            }
            break;

          case ConstantData.ActionTriggerType.MOVEPOLYSEG:
            shouldUpdateGeometry = true;
            if (shouldSendCollabMessage) {
              const polyObject = GlobalData.optManager.GetObjectPtr(this.BlockID, false);
              collabMessage.left_sindent = polyObject.left_sindent;
              collabMessage.right_sindent = polyObject.right_sindent;
              collabMessage.top_sindent = polyObject.top_sindent;
              collabMessage.bottom_sindent = polyObject.bottom_sindent;
              collabMessage.tindent = Utils1.DeepCopy(polyObject.tindent);
              if (polyObject.polylist) {
                collabMessage.polylist = Utils1.DeepCopy(polyObject.polylist);
              }
              if (polyObject.VertexArray) {
                collabMessage.VertexArray = Utils1.DeepCopy(polyObject.VertexArray);
              }
            }
            break;

          case ConstantData.ActionTriggerType.DIMENSION_LINE_ADJ:
            if (shouldSendCollabMessage) {
              collabMessage.dimensionDeflectionH = this.dimensionDeflectionH;
              collabMessage.dimensionDeflectionV = this.dimensionDeflectionV;
            }
            break;

          case ConstantData.ActionTriggerType.CONTAINER_ADJ:
            if (shouldSendCollabMessage) {
              collabMessage.theActionTableLastY = GlobalData.optManager.theActionTableLastY;
            }
            break;
        }

        if (shouldSendCollabMessage && collabMessage) {
          Collab.BuildMessage(ConstantData.CollabMessages.Action_Shape, collabMessage, false);
        }

        storedObject.SetDimensionLinesVisibility(GlobalData.optManager.theActionSVGObject, false);
      } else if (GlobalData.optManager.theActionTriggerID === ConstantData.ActionTriggerType.MOVEPOLYSEG) {
        shouldUpdateGeometry = true;
      }

      if (GlobalData.optManager.theActionTriggerID === ConstantData.ActionTriggerType.CONTAINER_ADJ) {
        GlobalData.optManager.theMoveList = [];
        GlobalData.optManager.theDragElementList.length = 0;
        GlobalData.optManager.theDragBBoxList.length = 0;
        GlobalData.optManager.theActionOldExtra = 0;
        this.Pr_UpdateExtra(GlobalData.optManager.theActionTableLastY);
      } else if (GlobalData.optManager.theActionTriggerID === ConstantData.ActionTriggerType.ROTATE) {
        GlobalData.optManager.theRotateEndRotation %= 360;
        GlobalData.optManager.SetObjectAttributes(GlobalData.optManager.theActionStoredObjectID, {
          RotationAngle: GlobalData.optManager.theRotateEndRotation
        });

        const visioTextChild = GlobalData.optManager.SD_GetVisioTextChild(this.BlockID);
        if (visioTextChild >= 0) {
          const visioTextChildObj = GlobalData.optManager.GetObjectPtr(visioTextChild, true);
          if (visioTextChildObj) {
            let rotationDiff = 0;
            if (visioTextChildObj.VisioRotationDiff) {
              rotationDiff = -visioTextChildObj.VisioRotationDiff;
            }
            GlobalData.optManager.SetObjectAttributes(visioTextChild, {
              RotationAngle: GlobalData.optManager.theRotateEndRotation + rotationDiff
            });
            GlobalData.optManager.SetObjectFrame(visioTextChild, visioTextChildObj.Frame);
          }
        }

        GlobalData.optManager.SetObjectFrame(GlobalData.optManager.theActionStoredObjectID, storedObject.Frame);
        this.UpdateDimensionLines(GlobalData.optManager.theActionSVGObject);
      } else if (!shouldUpdateGeometry) {
        const newFrame = $.extend(true, {}, storedObject.Frame);
        GlobalData.optManager.SetObjectFrame(GlobalData.optManager.theActionStoredObjectID, newFrame);

        if (this.polylist && this.ShapeType === ConstantData.ShapeType.POLYGON) {
          this.ScaleObject(0, 0, 0, 0, 0, 0);
        }
        shouldUpdateGeometry = true;
      }

      this.LM_ActionPostRelease(GlobalData.optManager.theActionStoredObjectID);

      if (shouldUpdateGeometry) {
        if (isGanttChart) {
          GlobalData.optManager.PlanningTableUpdateGeometry(this, true);
        } else if (isTimeline) {
          GlobalData.optManager.Timeline_SetScale(this);
        }
      }

      if (!triggerData) {
        storedObject.SetDimensionLinesVisibility(GlobalData.optManager.theActionSVGObject, true);
      }

      if (this.HyperlinkText || this.NoteID !== -1 || this.HasFieldData()) {
        GlobalData.optManager.AddToDirtyList(GlobalData.optManager.theActionStoredObjectID);
      }

      GlobalData.optManager.theActionStoredObjectID = -1;
      GlobalData.optManager.theActionSVGObject = null;
      GlobalData.optManager.theActionTable = null;
      GlobalData.optManager.ShowOverlayLayer();
      GlobalData.optManager.CompleteOperation(null);

      console.log('= S.BaseShape - LM_ActionRelease output');
    } catch (error) {
      this.LM_ActionClick_ExceptionCleanup(error);
      GlobalData.optManager.ExceptionCleanup(error);
      throw error;
    }
  }

  LM_ActionPreTrack(e, t) {
    console.log("= S.BaseShape - LM_ActionPreTrack input:", { e, t });

    // Check and update rflags
    if (this.rflags) {
      this.rflags = Utils2.SetFlag(this.rflags, ConstantData.FloatingPointDim.SD_FP_Width, false);
      this.rflags = Utils2.SetFlag(this.rflags, ConstantData.FloatingPointDim.SD_FP_Height, false);
    }

    console.log("= S.BaseShape - LM_ActionPreTrack output:", { rflags: this.rflags });
  }

  LM_ActionDuringTrack(e) {
    return e
  }

  LM_ActionPostRelease(e) {
    var t = function () {
      if (
        GlobalData.optManager.currentModalOperation === ListManager.ModalOperations.FORMATPAINTER
      ) {
        if (
          GlobalData.optManager.FormatPainterMode === ListManager.FormatPainterModes.TABLE ||
          GlobalData.optManager.FormatPainterMode === ListManager.FormatPainterModes.OBJECT
        ) {
          var e = GlobalData.optManager.Table_GetActiveID();
          GlobalData.optManager.Table_PasteFormat(e, GlobalData.optManager.FormatPainterStyle, !1)
        }
        !0 !== GlobalData.optManager.FormatPainterSticky &&
          GlobalData.optManager.SetFormatPainter(!0, !1)
      }
    };
    this.objecttype !== ConstantData.ObjectTypes.SD_OBJT_TABLE_WITH_SHAPECONTAINER &&
      GlobalData.optManager.UpdateLinks(),
      GlobalData.optManager.LinkParams = null;
    var a = this.GetTable(!1);
    switch (
    GlobalData.optManager.SetEditMode(ConstantData.EditState.DEFAULT),
    GlobalData.optManager.theActionTriggerID
    ) {
      case ConstantData.ActionTriggerType.TABLE_ROW:
        GlobalData.optManager.theActionTable &&
          a &&
          GlobalData.optManager.theActionTable.ht != a.ht &&
          (this.sizedim.height = this.Frame.height),
          GlobalData.optManager.SetLinkFlag(this.BlockID, ConstantData.LinkFlags.SED_L_MOVE),
          t();
        break;
      case ConstantData.ActionTriggerType.TABLE_COL:
        GlobalData.optManager.theActionTable &&
          a &&
          GlobalData.optManager.theActionTable.wd != a.wd &&
          (this.sizedim.width = this.Frame.width),
          GlobalData.optManager.SetLinkFlag(this.BlockID, ConstantData.LinkFlags.SED_L_MOVE),
          t();
        break;
      case ConstantData.ActionTriggerType.TABLE_SELECT:
      case ConstantData.ActionTriggerType.TABLE_ROWSELECT:
      case ConstantData.ActionTriggerType.TABLE_COLSELECT:
        if (
          GlobalData.optManager.currentModalOperation === ListManager.ModalOperations.FORMATPAINTER
        ) {
          if (
            GlobalData.optManager.FormatPainterMode === ListManager.FormatPainterModes.TABLE ||
            GlobalData.optManager.FormatPainterMode === ListManager.FormatPainterModes.OBJECT
          ) {
            var r = GlobalData.optManager.Table_GetActiveID();
            GlobalData.optManager.Table_PasteFormat(r, GlobalData.optManager.FormatPainterStyle, !1)
          }
          !0 !== GlobalData.optManager.FormatPainterSticky &&
            GlobalData.optManager.SetFormatPainter(!0, !1)
        }
        break;
      case ConstantData.ActionTriggerType.TABLE_EDIT:
        GlobalData.optManager.SetLinkFlag(this.BlockID, ConstantData.LinkFlags.SED_L_MOVE);
        break;
      case ConstantData.ActionTriggerType.CENTERLEFT:
      case ConstantData.ActionTriggerType.CENTERRIGHT:
        this.sizedim.width = this.Frame.width;
        break;
      case ConstantData.ActionTriggerType.TOPCENTER:
      case ConstantData.ActionTriggerType.BOTTOMCENTER:
        this.sizedim.height = this.Frame.height,
          this.GetGanttInfo() &&
          GlobalData.optManager.GanttFormat(this.BlockID, !1, !1, !1, null);
        break;
      default:
        this.sizedim.width = this.Frame.width,
          this.sizedim.height = this.Frame.height,
          this.GetGanttInfo() &&
          GlobalData.optManager.GanttFormat(this.BlockID, !1, !1, !1, null)
    }
  }

  LM_SetupActionClick(e, t, a, r, i) {

    console.log('LM_SetupActionClick', e, t, a, r, i);

    GlobalData.optManager.theEventTimestamp = Date.now(),
      GlobalData.optManager.SetUIAdaptation(e);
    var n,
      o,
      s,
      l = GlobalData.optManager.svgDoc.ConvertWindowToDocCoords(e.gesture.center.clientX, e.gesture.center.clientY),
      S = (
        GlobalData.optManager.OverrideSnaps(e),
        (l = GlobalData.optManager.DoAutoGrowDrag(l)).x
      ),
      c = l.y;
    if (r) {
      n = a,
        o = r,
        s = i;
      var u = 0,
        p = !1;
      switch (
      obj = GlobalData.optManager.GetObjectPtr(a, !1),
      obj &&
      (
        (u = obj.RotationAngle) > 180 &&
        (u = 360 - u),
        u >= 90 &&
        (u = 180 - u),
        u > 45 &&
        (p = !0)
      ),
      r
      ) {
        case ConstantData.ActionTriggerType.TABLE_ROW:
          p ? GlobalData.optManager.SetEditMode(
            ConstantData.EditState.DRAGCONTROL,
            Element.CursorType.COL_RESIZE
          ) : GlobalData.optManager.SetEditMode(
            ConstantData.EditState.DRAGCONTROL,
            Element.CursorType.ROW_RESIZE
          );
          break;
        case ConstantData.ActionTriggerType.TABLE_COL:
          p ? GlobalData.optManager.SetEditMode(
            ConstantData.EditState.DRAGCONTROL,
            Element.CursorType.ROW_RESIZE
          ) : GlobalData.optManager.SetEditMode(
            ConstantData.EditState.DRAGCONTROL,
            Element.CursorType.COL_RESIZE
          )
      }
    } else {
      var d = GlobalData.optManager.svgOverlayLayer.FindElementByDOMElement(e.currentTarget);
      if (null === d) return !1;
      var D = d.GetID();
      n = parseInt(
        D.substring(ConstantData.Defines.Action.length, D.length),
        10
      );
      var g = d.GetTargetForEvent(e);
      if (null == g) return !1;
      o = g.GetID(),
        s = g.GetUserData(),
        GlobalData.optManager.SetControlDragMode(g)
    }
    GlobalData.optManager.theActionStoredObjectID = n;
    var h = GlobalData.optManager.GetObjectPtr(n, !0);
    GlobalData.optManager.theActionTriggerID = o,
      GlobalData.optManager.theActionTriggerData = s;
    var m = ConstantData.ActionTriggerType;
    switch (o) {
      case m.CONNECTOR_PERP:
      case m.CONNECTOR_ADJ:
      case m.CONNECTOR_HOOK:
      case m.LINESTART:
      case m.LINEEND:
        var C = function (e) {
          if (e.hooks.length) {
            var t = e.hooks[0].objid;
            return GlobalData.optManager.GetObjectPtr(t, !1)
          }
          return null
        }(this);
        return C &&
          (
            GlobalData.optManager.theActionStoredObjectID = C.BlockID,
            // ListManager.Connector.prototype.LM_ActionClick.call(C, e, !0)
            // Double ===
            this.Connector_LM_ActionClick(e, !0)
          ),
          !1
    }
    o === ConstantData.ActionTriggerType.MOVEPOLYSEG &&
      (
        GlobalData.optManager.theActionTriggerData = {
          hitSegment: s,
          moveAngle: 9999
        }
      ),
      GlobalData.optManager.theActionSVGObject = GlobalData.optManager.svgObjectLayer.GetElementByID(n),
      h.SetDimensionLinesVisibility(GlobalData.optManager.theActionSVGObject, !1),
      this.LM_ActionPreTrack(n, o),
      (
        '' !== this.HyperlinkText ||
        - 1 != this.NoteID ||
        this.HasFieldData()
      ) &&
      this.HideAllIcons(GlobalData.optManager.svgDoc, GlobalData.optManager.theActionSVGObject),
      GlobalData.optManager.theActionLockAspectRatio = e.gesture.srcEvent.shiftKey,
      this.ResizeAspectConstrain &&
      (
        GlobalData.optManager.theActionLockAspectRatio = !GlobalData.optManager.theActionLockAspectRatio
      );
    var y = h.Frame;
    GlobalData.optManager.theActionLockAspectRatio &&
      (
        0 === y.height ? GlobalData.optManager.theActionLockAspectRatio = !1 : (
          GlobalData.optManager.theActionAspectRatioWidth = y.width,
          GlobalData.optManager.theActionAspectRatioHeight = y.height
        )
      ),
      GlobalData.optManager.theActionBBox = $.extend(!0, {
      }, y),
      GlobalData.optManager.theActionNewBBox = $.extend(!0, {
      }, y);
    var f = this.GetTable(!1);
    f &&
      (GlobalData.optManager.theActionTable = Utils1.DeepCopy(f)),
      GlobalData.optManager.HideOverlayLayer();
    var L = {},
      I = {},
      T = {};
    if (
      GlobalData.optManager.theRotateObjectRadians = - this.RotationAngle / (180 / ConstantData.Geometry.PI),
      GlobalData.optManager.theActionTriggerID == ConstantData.ActionTriggerType.CONTAINER_ADJ
    ) {
      L.x = S,
        L.y = c,
        GlobalData.optManager.theActionStartX = L.x,
        GlobalData.optManager.theActionStartY = L.y;
      var b = this.Pr_GetAdjustShapeList();
      if (!b) return !1;
      GlobalData.optManager.theMoveList = b.list,
        GlobalData.optManager.theDragElementList = b.svglist,
        GlobalData.optManager.theDragBBoxList = b.framelist,
        GlobalData.optManager.theActionTableLastY = 0,
        GlobalData.optManager.theActionOldExtra = b.oldextra,
        GlobalData.optManager.theActionContainerArrangement = b.arrangement
    } else GlobalData.optManager.theActionTriggerID == ConstantData.ActionTriggerType.ROTATE ? (
      GlobalData.optManager.theRotateKnobCenterDivisor = this.RotateKnobCenterDivisor(),
      GlobalData.optManager.theRotateStartRotation = this.RotationAngle,
      GlobalData.optManager.theRotateEndRotation = GlobalData.optManager.theRotateStartRotation,
      GlobalData.optManager.theRotatePivotX = y.x + y.width / GlobalData.optManager.theRotateKnobCenterDivisor.x,
      GlobalData.optManager.theRotatePivotY = y.y + y.height / GlobalData.optManager.theRotateKnobCenterDivisor.y,
      GlobalData.optManager.theActionStartX = S,
      GlobalData.optManager.theActionStartY = c
    ) : (
      L.x = S,
      L.y = c,
      I.x = y.x + y.width / 2,
      I.y = y.y + y.height / 2,
      T = GlobalData.optManager.RotatePointAroundPoint(I, L, GlobalData.optManager.theRotateObjectRadians),
      GlobalData.optManager.theActionStartX = T.x,
      GlobalData.optManager.theActionStartY = T.y,
      GlobalData.optManager.theActionTableLastX = T.x,
      GlobalData.optManager.theActionTableLastY = T.y
    );
    return !0
  }

  Connector_LM_ActionClick(e, t) {
    // ListManager.BaseLine.prototype.LM_ActionClick.call(this, e, t)

    this.BaseLine_LM_ActionClick(e, t)
  }

  BaseLine_LM_ActionClick(e, t) {
    // debugger
    try {
      var a = this.BlockID,
        r = GlobalData.optManager.GetObjectPtr(a, !1);
      // if (!(r && r instanceof ListManager.BaseDrawingObject)) return !1;
      // Double === TODO
      if (!(r && r instanceof BaseDrawingObject)) return !1;
      if (
        GlobalData.optManager.DoAutoGrowDragInit(0, this.BlockID),
        !this.LM_SetupActionClick(e, t)
      ) return;
      Collab.BeginSecondaryEdit();
      var i = GlobalData.optManager.GetObjectPtr(this.BlockID, !1);
      GlobalData.optManager.WorkAreaHammer.on('drag', DefaultEvt.Evt_ActionTrackHandlerFactory(i)),

        // GlobalData.optManager.WorkAreaHammer.on('drag', function(ee){
        //   console.log("0000011120200030========================= ee",ee);
        // }),


        GlobalData.optManager.WorkAreaHammer.on('dragend', DefaultEvt.Evt_ActionReleaseHandlerFactory(i))
    } catch (e) {
      this.LM_ActionClick_ExceptionCleanup(e);
      GlobalData.optManager.ExceptionCleanup(e);
      throw e;
    }
  }

  LM_ActionClick_ExceptionCleanup(e) {
    GlobalData.optManager.unbindActionClickHammerEvents(),
      this.ResetAutoScrollTimer(),
      GlobalData.optManager.ob = {},
      GlobalData.optManager.LinkParams = null,
      GlobalData.optManager.theActionTriggerID = - 1,
      GlobalData.optManager.theActionTriggerData = null,
      GlobalData.optManager.theActionStoredObjectID = - 1,
      GlobalData.optManager.theActionSVGObject = null,
      GlobalData.optManager.HideOverlayLayer()
  }

  LM_ActionClick(e, t, a, r, i) {
    Utils2.StopPropagationAndDefaults(e);
    try {
      var n = this.BlockID,
        o = GlobalData.optManager.GetObjectPtr(n, !1);
      // if (!(o && o instanceof ListManager.BaseDrawingObject)) return !1;
      if (!(o && o instanceof BaseDrawingObject)) return !1;
      if (
        GlobalData.optManager.DoAutoGrowDragInit(r),
        !this.LM_SetupActionClick(e, t, a, r, i)
      ) return;
      Collab.BeginSecondaryEdit();
      var s = GlobalData.optManager.GetObjectPtr(this.BlockID, !1);
      GlobalData.optManager.WorkAreaHammer.on('drag', DefaultEvt.Evt_ActionTrackHandlerFactory(s)),
        GlobalData.optManager.WorkAreaHammer.on('dragend', DefaultEvt.Evt_ActionReleaseHandlerFactory(s))
    } catch (e) {
      this.LM_ActionClick_ExceptionCleanup(e);
      GlobalData.optManager.ExceptionCleanup(e);
      throw e;
    }
  }

  RightClick(e) {
    var t,
      a = GlobalData.optManager.svgDoc.ConvertWindowToDocCoords(e.gesture.center.clientX, e.gesture.center.clientY),
      r = (ConstantData.ObjectSubTypes, ConstantData.ShapeType),
      i = GlobalData.optManager.svgObjectLayer.FindElementByDOMElement(e.currentTarget),
      n = i.GetID();
    if (
      (t = GlobalData.optManager.GetObjectPtr(n, !1)) &&
      // t instanceof ListManager.BaseDrawingObject
      t instanceof BaseDrawingObject
    ) {
      if (
        t &&
        t.objecttype === ConstantData.ObjectTypes.SD_OBJT_SHAPECONTAINER
      ) {
        if (
          SDUI.AppSettings.Application === Resources.Application.Builder
        ) return GlobalData.optManager.SelectObjectFromClick(e, i),
          ConstantData.DocumentContext.CurrentContainerList = t.ContainerList,
          GlobalData.optManager.RightClickParams = new RightClickData(),
          GlobalData.optManager.RightClickParams.TargetID = i.GetID(),
          GlobalData.optManager.RightClickParams.HitPt.x = a.x,
          GlobalData.optManager.RightClickParams.HitPt.y = a.y,
          GlobalData.optManager.RightClickParams.Locked = (this.flags & ConstantData.ObjFlags.SEDO_Lock) > 0,
          void Commands.MainController.ShowContextualMenu(
            Resources.Controls.ContextMenus.BuilderSmartContainer.Id.toLowerCase(),
            e.gesture.center.clientX,
            e.gesture.center.clientY
          );
        var o = GlobalData.optManager.ContainerIsInCell(t);
        if (o) return GlobalData.optManager.RightClickParams = new RightClickData(),
          GlobalData.optManager.RightClickParams.TargetID = i.GetID(),
          GlobalData.optManager.RightClickParams.HitPt.x = a.x,
          GlobalData.optManager.RightClickParams.HitPt.y = a.y,
          GlobalData.optManager.RightClickParams.Locked = (this.flags & ConstantData.ObjFlags.SEDO_Lock) > 0,
          void GlobalData.optManager.Table_ShowContainerMenu(o, e)
      }
      if (!GlobalData.optManager.SelectObjectFromClick(e, i)) return !1;
      if (GlobalData.docHandler.IsReadOnly()) return GlobalData.optManager.RightClickParams = new RightClickData(),
        GlobalData.optManager.RightClickParams.TargetID = i.GetID(),
        GlobalData.optManager.RightClickParams.HitPt.x = a.x,
        GlobalData.optManager.RightClickParams.HitPt.y = a.y,
        GlobalData.optManager.RightClickParams.Locked = (this.flags & ConstantData.ObjFlags.SEDO_Lock) > 0,
        Commands.MainController.ShowContextualMenu(
          Resources.Controls.ContextMenus.DefaultReadOnly.Id.toLowerCase(),
          e.gesture.center.clientX,
          e.gesture.center.clientY
        ),
        !1;
      var s = GlobalData.optManager.Table_GetActiveID(),
        l = this.GetTable(!1),
        S = i.GetID(),
        c = i.GetTargetForEvent(e).GetID(),
        u = !1;
      if (
        l &&
        l.flags & ListManager.Table.TableFlags.SDT_TF_LOCK &&
        (u = !0),
        t = GlobalData.optManager.GetObjectPtr(S, !1)
      ) {
        var p = (t.TextFlags & ConstantData.TextFlags.SED_TF_OneClick) > 0 &&
          s < 0 &&
          c !== ConstantData.SVGElementClass.SLOP;
        if (t.AllowTextEdit() || (p = !1), this.IsSwimlane()) switch (u = !0, c) {
          case ConstantData.Defines.TableColHit:
          case ConstantData.Defines.TableRowHit:
            p = !1
        }
        if (t.GetTextObject(e, !0) >= 0 || p) {
          var d = i.textElem;
          (d || p) &&
            (
              d &&
              (
                g = d.GetSpellAtLocation(e.gesture.center.clientX, e.gesture.center.clientY)
              ),
              (g >= 0 || p) &&
              (
                GlobalData.optManager.ActivateTextEdit(i, e, !0),
                s = GlobalData.optManager.Table_GetActiveID()
              )
            )
        }
      }
      if (
        GlobalData.optManager.RightClickParams = new RightClickData(),
        GlobalData.optManager.RightClickParams.TargetID = i.GetID(),
        GlobalData.optManager.RightClickParams.HitPt.x = a.x,
        GlobalData.optManager.RightClickParams.HitPt.y = a.y,
        GlobalData.optManager.RightClickParams.Locked = (this.flags & ConstantData.ObjFlags.SEDO_Lock) > 0,
        - 1 === s &&
        l &&
        (l.select = - 1, t.DataID = - 1),
        null != GlobalData.optManager.GetActiveTextEdit()
      ) {
        var D = GlobalData.optManager.svgDoc.GetActiveEdit(),
          g = - 1,
          h = D.GetSelectedRange(),
          m = this.HasFieldData() ? Resources.Controls.ContextMenus.TextMenuData : Resources.Controls.ContextMenus.TextMenu;
        D &&
          (
            g = D.GetSpellAtLocation(e.gesture.center.clientX, e.gesture.center.clientY)
          ),
          g >= 0 ? GlobalData.optManager.svgDoc.GetSpellCheck().ShowSpellMenu(D, g, e.gesture.center.clientX, e.gesture.center.clientY) : h.end > h.start ? Commands.MainController.ShowContextualMenu(
            m.Id.toLowerCase(),
            e.gesture.center.clientX,
            e.gesture.center.clientY
          ) : this.objecttype === ConstantData.ObjectTypes.SD_OBJT_UIELEMENT ? Commands.MainController.ShowContextualMenu(
            Resources.Controls.ContextMenus.Wireframe.Id.toLowerCase(),
            e.gesture.center.clientX,
            e.gesture.center.clientY
          ) : this.objecttype === ConstantData.ObjectTypes.SD_OBJT_GANTT_CHART ? Commands.MainController.ShowContextualMenu(
            Resources.Controls.ContextMenus.Gantt.Id.toLowerCase(),
            e.gesture.center.clientX,
            e.gesture.center.clientY
          ) : l &&
            this.BlockID === s ? t.objecttype === ConstantData.ObjectTypes.SD_OBJT_TABLE_WITH_SHAPECONTAINER &&
              SDUI.AppSettings.Application !== Resources.Application.Builder ? GlobalData.optManager.Table_ShowContainerMenu(null, e) : GlobalData.optManager.Table_HideUI(this) ||
                GlobalData.optManager.Table_NoTableUI(l) ||
                u ? Commands.MainController.ShowContextualMenu(
                  m.Id.toLowerCase(),
                  e.gesture.center.clientX,
                  e.gesture.center.clientY
                ) : Commands.MainController.ShowContextualMenu(
                  Resources.Controls.ContextMenus.Table.Id.toLowerCase(),
                  e.gesture.center.clientX,
                  e.gesture.center.clientY
                ) : Commands.MainController.ShowContextualMenu(
                  m.Id.toLowerCase(),
                  e.gesture.center.clientX,
                  e.gesture.center.clientY
                )
      } else if (l && this.BlockID === s) {
        this.DataID >= 0 &&
          (this.DataID = - 1);
        var C = this.objecttype;
        switch (
        t.objecttype === ConstantData.ObjectTypes.SD_OBJT_TABLE_WITH_SHAPECONTAINER &&
        SDUI.AppSettings.Application === Resources.Application.Builder &&
        (C = 0),
        C
        ) {
          case ConstantData.ObjectTypes.SD_OBJT_TABLE_WITH_SHAPECONTAINER:
            GlobalData.optManager.Table_ShowContainerMenu(null, e);
            break;
          case ConstantData.ObjectTypes.SD_OBJT_UIELEMENT:
          case ConstantData.ObjectTypes.SD_OBJT_UIELEMENT:
            Commands.MainController.ShowContextualMenu(
              Resources.Controls.ContextMenus.Wireframe.Id.toLowerCase(),
              e.gesture.center.clientX,
              e.gesture.center.clientY
            );
            break;
          case ConstantData.ObjectTypes.SD_OBJT_GANTT_CHART:
            Commands.MainController.ShowContextualMenu(
              Resources.Controls.ContextMenus.Gantt.Id.toLowerCase(),
              e.gesture.center.clientX,
              e.gesture.center.clientY
            );
            break;
          case ConstantData.ObjectTypes.SD_OBJT_SWIMLANE_COLS:
          case ConstantData.ObjectTypes.SD_OBJT_SWIMLANE_ROWS:
          case ConstantData.ObjectTypes.SD_OBJT_SWIMLANE_GRID:
            Commands.MainController.ShowContextualMenu(
              Resources.Controls.ContextMenus.Swimlane.Id.toLowerCase(),
              e.gesture.center.clientX,
              e.gesture.center.clientY
            );
            break;
          case ConstantData.ObjectTypes.SD_OBJT_FRAME_CONTAINER:
            Commands.MainController.ShowContextualMenu(
              Resources.Controls.ContextMenus.Frame.Id.toLowerCase(),
              e.gesture.center.clientX,
              e.gesture.center.clientY
            );
            break;
          default:
            if (
              GlobalData.optManager.Table_HideUI(this) ||
              GlobalData.optManager.Table_NoTableUI(l) ||
              u
            ) switch (this.ShapeType) {
              case r.RECT:
              case r.RRECT:
                this.ImageURL &&
                  this.ImageURL.length ||
                  this.EMFHash &&
                  this.EMFHash.length ? Commands.MainController.ShowContextualMenu(
                    Resources.Controls.ContextMenus.Default.Id.toLowerCase(),
                    e.gesture.center.clientX,
                    e.gesture.center.clientY
                  ) : Commands.MainController.ShowContextualMenu(
                    Resources.Controls.ContextMenus.RectContextMenu.Id.toLowerCase(),
                    e.gesture.center.clientX,
                    e.gesture.center.clientY
                  );
                break;
              default:
                Commands.MainController.ShowContextualMenu(
                  Resources.Controls.ContextMenus.Default.Id.toLowerCase(),
                  e.gesture.center.clientX,
                  e.gesture.center.clientY
                )
            } else Commands.MainController.ShowContextualMenu(
              Resources.Controls.ContextMenus.Table.Id.toLowerCase(),
              e.gesture.center.clientX,
              e.gesture.center.clientY
            )
        }
      } else switch (
      S = GlobalData.optManager.SD_GetVisioTextParent(S),
      GlobalData.optManager.RightClickParams.TargetID = S,
      (t = GlobalData.optManager.GetObjectPtr(S, !1)).objecttype
      ) {
        case ConstantData.ObjectTypes.SD_OBJT_D3SYMBOL:
          switch (t.codeLibID) {
            case 'RadialGauge':
            case 'LinearGauge':
              Commands.MainController.ShowContextualMenu(
                Resources.Controls.ContextMenus.Gauge.Id.toLowerCase(),
                e.gesture.center.clientX,
                e.gesture.center.clientY
              );
              break;
            case 'BarChart':
            case 'PieChart':
            case 'LineChart':
            case 'SankeyChart':
              Commands.MainController.ShowContextualMenu(
                Resources.Controls.ContextMenus.Graph.Id.toLowerCase(),
                e.gesture.center.clientX,
                e.gesture.center.clientY
              )
          }
          break;
        case ConstantData.ObjectTypes.SD_OBJT_UIELEMENT:
          Commands.MainController.ShowContextualMenu(
            Resources.Controls.ContextMenus.Wireframe.Id.toLowerCase(),
            e.gesture.center.clientX,
            e.gesture.center.clientY
          );
          break;
        case ConstantData.ObjectTypes.SD_OBJT_BPMN_ACTIVITY:
          Commands.MainController.ShowContextualMenu(
            Resources.Controls.ContextMenus.BPMN_Activity.Id.toLowerCase(),
            e.gesture.center.clientX,
            e.gesture.center.clientY
          );
          break;
        case ConstantData.ObjectTypes.SD_OBJT_BPMN_EVENT_START:
        case ConstantData.ObjectTypes.SD_OBJT_BPMN_EVENT_INTERMEDIATE:
        case ConstantData.ObjectTypes.SD_OBJT_BPMN_EVENT_END:
        case ConstantData.ObjectTypes.SD_OBJT_BPMN_EVENT_START_NI:
        case ConstantData.ObjectTypes.SD_OBJT_BPMN_EVENT_INTERMEDIATE_NI:
        case ConstantData.ObjectTypes.SD_OBJT_BPMN_EVENT_INTERMEDIATE_THROW:
          gLineDrawBPMNEventManager.GetLineRightClickMenuID(t.objecttype),
            Commands.MainController.ShowContextualMenu(
              Resources.Controls.ContextMenus.BPMN_Event.Id.toLowerCase(),
              e.gesture.center.clientX,
              e.gesture.center.clientY
            );
          break;
        case ConstantData.ObjectTypes.SD_OBJT_BPMN_GATEWAY:
          Commands.MainController.ShowContextualMenu(
            Resources.Controls.ContextMenus.BPMN_Gateway.Id.toLowerCase(),
            e.gesture.center.clientX,
            e.gesture.center.clientY
          );
          break;
        case ConstantData.ObjectTypes.SD_OBJT_BPMN_DATAOBJECT:
          Commands.MainController.ShowContextualMenu(
            Resources.Controls.ContextMenus.BPMN_Data.Id.toLowerCase(),
            e.gesture.center.clientX,
            e.gesture.center.clientY
          );
          break;
        case ConstantData.ObjectTypes.SD_OBJT_BPMN_CHOREOGRAPHY:
          Commands.MainController.ShowContextualMenu(
            Resources.Controls.ContextMenus.BPMN_Choreo.Id.toLowerCase(),
            e.gesture.center.clientX,
            e.gesture.center.clientY
          );
          break;
        case ConstantData.ObjectTypes.SD_OBJT_SWIMLANE_COLS:
        case ConstantData.ObjectTypes.SD_OBJT_SWIMLANE_ROWS:
        case ConstantData.ObjectTypes.SD_OBJT_SWIMLANE_GRID:
          Commands.MainController.ShowContextualMenu(
            Resources.Controls.ContextMenus.Swimlane.Id.toLowerCase(),
            e.gesture.center.clientX,
            e.gesture.center.clientY
          );
          break;
        case ConstantData.ObjectTypes.SD_OBJT_FRAME_CONTAINER:
          Commands.MainController.ShowContextualMenu(
            Resources.Controls.ContextMenus.Frame.Id.toLowerCase(),
            e.gesture.center.clientX,
            e.gesture.center.clientY
          );
          break;
        case ConstantData.ObjectTypes.SD_OBJT_MULTIPLICITY:
          Commands.MainController.ShowContextualMenu(
            Resources.Controls.ContextMenus.Multiplicity.Id.toLowerCase(),
            e.gesture.center.clientX,
            e.gesture.center.clientY
          );
          break;
        case ConstantData.ObjectTypes.SD_OBJT_SHAPECONTAINER:
          if (
            SDUI.AppSettings.Application === Resources.Application.Builder
          ) {
            Commands.MainController.ShowContextualMenu(
              Resources.Controls.ContextMenus.SmartContainer.Id.toLowerCase(),
              e.gesture.center.clientX,
              e.gesture.center.clientY
            );
            break
          }
        default:
          switch (t.ShapeType) {
            case r.RECT:
            case r.RRECT:
              t.ImageURL &&
                t.ImageURL.length ||
                t.EMFHash &&
                t.EMFHash.length ? Commands.MainController.ShowContextualMenu(
                  Resources.Controls.ContextMenus.Default.Id.toLowerCase(),
                  e.gesture.center.clientX,
                  e.gesture.center.clientY
                ) : Commands.MainController.ShowContextualMenu(
                  Resources.Controls.ContextMenus.RectContextMenu.Id.toLowerCase(),
                  e.gesture.center.clientX,
                  e.gesture.center.clientY
                );
              break;
            default:
              Commands.MainController.ShowContextualMenu(
                Resources.Controls.ContextMenus.Default.Id.toLowerCase(),
                e.gesture.center.clientX,
                e.gesture.center.clientY
              )
          }
      }
    }
  }

  StartNewObjectDrawTrackCommon(e, t, a) {
    var r = e - GlobalData.optManager.theActionStartX,
      i = t - GlobalData.optManager.theActionStartY,
      n = {},
      o = (
        Math.sqrt(r * r + i * i),
        $.extend(!0, {
        }, GlobalData.optManager.theActionBBox)
      );
    o.width = o.width + r,
      o.height = o.height + i,
      n.x = o.x + o.width,
      n.y = o.y + o.height;
    var s = GlobalData.optManager.OverrideSnaps(a);
    GlobalData.docHandler.documentConfig.enableSnap &&
      !s &&
      (
        n = GlobalData.docHandler.SnapToGrid(n),
        o.width = n.x - o.x,
        o.height = n.y - o.y
      ),
      o.width < 0 &&
      (o.x = e, o.width = - o.width),
      o.height < 0 &&
      (o.y = t, o.height = - o.height),
      GlobalData.optManager.theActionNewBBox = $.extend(!0, {
      }, o),
      this.UpdateFrame(GlobalData.optManager.theActionNewBBox),
      this.Resize(GlobalData.optManager.theActionSVGObject, o, this)
  }

  StartNewObjectDrawDoAutoScroll() {
    GlobalData.optManager.autoScrollTimerID = GlobalData.optManager.autoScrollTimer.setTimeout('StartNewObjectDrawDoAutoScroll', 100);
    var e = GlobalData.optManager.svgDoc.ConvertWindowToDocCoords(GlobalData.optManager.autoScrollXPos, GlobalData.optManager.autoScrollYPos);
    e = GlobalData.optManager.DoAutoGrowDrag(e),
      GlobalData.docHandler.ScrollToPosition(e.x, e.y),
      this.StartNewObjectDrawTrackCommon(e.x, e.y, null)
  }

  LM_DrawTrack(e) {
    if (- 1 == GlobalData.optManager.theActionStoredObjectID) return !1;
    var t = GlobalData.optManager.svgDoc.ConvertWindowToDocCoords(e.gesture.center.clientX, e.gesture.center.clientY),
      a = GlobalData.optManager.OverrideSnaps(e);
    GlobalData.docHandler.documentConfig.enableSnap &&
      !a &&
      (t = GlobalData.docHandler.SnapToGrid(t));
    var r = (t = GlobalData.optManager.DoAutoGrowDrag(t)).x,
      i = t.y;
    this.AutoScrollCommon(e, !0, 'StartNewObjectDrawDoAutoScroll') &&
      (
        this.LM_DrawDuringTrack(r, i),
        this.StartNewObjectDrawTrackCommon(r, i, e)
      )
  }

  LM_DrawRelease(e) {
    GlobalData.optManager.unbindActionClickHammerEvents(),
      this.ResetAutoScrollTimer();
    var t = {};
    var Collab_Data = {};
    t.x = GlobalData.optManager.theActionNewBBox.x,
      t.y = GlobalData.optManager.theActionNewBBox.y,
      t.width = GlobalData.optManager.theActionNewBBox.width,
      t.height = GlobalData.optManager.theActionNewBBox.height,
      GlobalData.optManager.SetObjectFrame(GlobalData.optManager.theActionStoredObjectID, t),
      this.LM_DrawPostRelease(GlobalData.optManager.theActionStoredObjectID),
      Collab_Data = {},
      GlobalData.optManager.BuildCreateMessage(Collab_Data, !0),
      GlobalData.optManager.PostObjectDraw()
  }

  LM_DrawPreTrack() {
    return !0
  }

  LM_DrawDuringTrack(e, t) {
  }

  LM_DrawPostRelease() {
  }

  LM_DrawClick_ExceptionCleanup(e) {
    GlobalData.optManager.unbindActionClickHammerEvents(),
      this.ResetAutoScrollTimer(),
      GlobalData.optManager.LinkParams = null,
      GlobalData.optManager.theActionStoredObjectID = - 1,
      GlobalData.optManager.theActionSVGObject = null,
      GlobalData.optManager.WorkAreaHammer.on('dragstart', DefaultEvt.Evt_WorkAreaHammerDragStart)
  }

  LM_DrawClick(event: any, triggerData: any) {
    console.log('= S.BaseShape - LM_DrawClick input:', { event, triggerData });

    try {
      this.Frame.x = event;
      this.Frame.y = triggerData;
      this.prevBBox = $.extend(true, {}, this.Frame);

      GlobalData.optManager.WorkAreaHammer.on('drag', DefaultEvt.Evt_DrawTrackHandlerFactory(this));
      GlobalData.optManager.WorkAreaHammer.on('dragend', DefaultEvt.Evt_DrawReleaseHandlerFactory(this));

      console.log('= S.BaseShape - LM_DrawClick output:', { Frame: this.Frame, prevBBox: this.prevBBox });
    } catch (error) {
      this.LM_DrawClick_ExceptionCleanup(error);
      GlobalData.optManager.ExceptionCleanup(error);
      throw error;
    }
  }

  RotateKnobCenterDivisor() {
    console.log("= S.BaseShape - RotateKnobCenterDivisor input");

    const divisor = {
      x: 2,
      y: 2
    };

    console.log("= S.BaseShape - RotateKnobCenterDivisor output:", divisor);
    return divisor;
  }

  OffsetShape(offsetX: number, offsetY: number, childShapes: any[], linkFlags: any) {
    console.log("= S.BaseShape - OffsetShape input:", { offsetX, offsetY, childShapes, linkFlags });

    if (this.moreflags & ConstantData.ObjMoreFlags.SED_MF_Container && childShapes) {
      for (let i = 0; i < childShapes.length; i++) {
        const childShapeId = childShapes[i];
        const childShape = GlobalData.optManager.GetObjectPtr(childShapeId, true);
        if (childShape) {
          const childLinkFlag = linkFlags ? linkFlags[childShape.BlockID] : null;
          childShape.OffsetShape(offsetX, offsetY, childLinkFlag);
          GlobalData.optManager.SetLinkFlag(childShapeId, ConstantData.LinkFlags.SED_L_MOVE);
          GlobalData.optManager.AddToDirtyList(childShapeId);
        }
      }
    }

    this.Frame.x += offsetX;
    this.Frame.y += offsetY;
    this.r.x += offsetX;
    this.r.y += offsetY;
    this.inside.x += offsetX;
    this.inside.y += offsetY;
    this.trect.x += offsetX;
    this.trect.y += offsetY;

    if (this.GetGraph(true)) {
      GlobalData.optManager.GraphShift(this, offsetX, offsetY);
    }

    console.log("= S.BaseShape - OffsetShape output:", { Frame: this.Frame, r: this.r, inside: this.inside, trect: this.trect });
  }

  SetShapeOrigin(newX: number, newY: number, childShapes: any[]) {
    console.log("= S.BaseShape - SetShapeOrigin input:", { newX, newY, childShapes });

    let offsetX = 0;
    let offsetY = 0;

    if (newX != null) {
      offsetX = newX - this.Frame.x;
    }

    if (newY != null) {
      offsetY = newY - this.Frame.y;
    }

    this.OffsetShape(offsetX, offsetY, childShapes);

    console.log("= S.BaseShape - SetShapeOrigin output:", { offsetX, offsetY });
  }

  SetShapeIndent(applyIndents: boolean) {
    console.log("= S.BaseShape - SetShapeIndent input:", { applyIndents });

    let width = this.inside.width;
    let height = this.inside.height;
    let leftRatio = 1;
    let topRatio = 1;
    let rightRatio = 1;
    let bottomRatio = 1;

    if (applyIndents) {
      leftRatio = 1 - (this.left_sindent + this.right_sindent);
      topRatio = 1 - (this.bottom_sindent + this.top_sindent);
      rightRatio = 1 - (this.left_sindent + this.right_sindent);
      bottomRatio = 1 - (this.bottom_sindent + this.top_sindent);
    }

    this.tindent.left = this.left_sindent * width / leftRatio;
    this.tindent.top = this.top_sindent * height / topRatio;
    this.tindent.right = this.right_sindent * width / rightRatio;
    this.tindent.bottom = this.bottom_sindent * height / bottomRatio;

    console.log("= S.BaseShape - SetShapeIndent output:", this.tindent);
  }

  UpdateFrame(newFrame) {
    console.log("= S.BaseShape - UpdateFrame input:", newFrame);

    let lineThickness = 0;
    let halfLineThickness = 0;

    if (newFrame) {
      super.UpdateFrame(newFrame);
    }

    Utils2.CopyRect(this.r, this.Frame);

    if (this.StyleRecord) {
      if (this.objecttype !== ConstantData.ObjectTypes.SD_OBJT_FLOORPLAN_WALL) {
        this.StyleRecord.Line.BThick = 0;
      }

      if (this.StyleRecord.Line.BThick) {
        if (this.polylist == null) {
          lineThickness = 0;
        } else {
          halfLineThickness = this.StyleRecord.Line.Thickness / 2;
        }
      } else {
        halfLineThickness = lineThickness = this.StyleRecord.Line.Thickness / 2;
      }

      this.CalcEffectSettings(this.Frame, this.StyleRecord, false);
    }

    GlobalData.optManager.SetShapeR(this);

    Utils2.CopyRect(this.inside, this.Frame);
    Utils2.InflateRect(this.inside, -lineThickness, -lineThickness);

    Utils2.CopyRect(this.trect, this.Frame);
    Utils2.InflateRect(this.trect, -halfLineThickness, -halfLineThickness);

    this.SetShapeIndent(false);

    Utils2.SubRect(this.trect, this.tindent);

    if (this.GetTable(false) == null) {
      Utils2.SubRect(this.trect, this.TMargins);
    }

    console.log("= S.BaseShape - UpdateFrame output:", {
      r: this.r,
      inside: this.inside,
      trect: this.trect,
      Frame: this.Frame
    });
  }

  GetSVGFrame(frame = this.Frame) {
    console.log("= S.BaseShape - GetSVGFrame input:", frame);

    const svgFrame = {};
    Utils2.CopyRect(svgFrame, frame);

    if (this.StyleRecord.Line.BThick && this.polylist == null) {
      Utils2.InflateRect(svgFrame, this.StyleRecord.Line.BThick, this.StyleRecord.Line.BThick);
    }

    console.log("= S.BaseShape - GetSVGFrame output:", svgFrame);
    return svgFrame;
  }

  GetSnapRect() {
    console.log("= S.BaseShape - GetSnapRect input");

    const snapRect = {};

    if (this.RotationAngle !== 0) {
      const polyPoints = this.GetPolyPoints(ConstantData.Defines.NPOLYPTS, false, false, true, null);
      const rotationRadians = -this.RotationAngle / (180 / ConstantData.Geometry.PI);
      Utils3.RotatePointsAboutCenter(this.Frame, rotationRadians, polyPoints);
      Utils2.GetPolyRect(snapRect, polyPoints);
    } else {
      Utils2.CopyRect(snapRect, this.Frame);
    }

    console.log("= S.BaseShape - GetSnapRect output:", snapRect);
    return snapRect;
  }

  CanSnapToShapes() {
    console.log("= S.BaseShape - CanSnapToShapes input");

    const objectTypes = ConstantData.ObjectTypes;
    let result;

    switch (this.objecttype) {
      case objectTypes.SD_OBJT_SWIMLANE_ROWS:
      case objectTypes.SD_OBJT_SWIMLANE_COLS:
      case objectTypes.SD_OBJT_SWIMLANE_GRID:
      case objectTypes.SD_OBJT_BPMN_POOL:
      case objectTypes.SD_OBJT_SHAPECONTAINER:
      case objectTypes.SD_OBJT_TABLE_WITH_SHAPECONTAINER:
        result = -1;
        break;
      default:
        result = this.BlockID;
    }

    console.log("= S.BaseShape - CanSnapToShapes output:", result);
    return result;
  }

  IsSnapTarget() {
    console.log("= S.BaseShape - IsSnapTarget input");

    const objectTypes = ConstantData.ObjectTypes;
    let result;

    switch (this.objecttype) {
      case objectTypes.SD_OBJT_SWIMLANE_ROWS:
      case objectTypes.SD_OBJT_SWIMLANE_COLS:
      case objectTypes.SD_OBJT_SWIMLANE_GRID:
      case objectTypes.SD_OBJT_BPMN_POOL:
      case objectTypes.SD_OBJT_SHAPECONTAINER:
      case objectTypes.SD_OBJT_TABLE_WITH_SHAPECONTAINER:
        result = false;
        break;
      default:
        result = !this.hooks.length && !(GlobalData.optManager.FindChildArray(this.BlockID, -1) >= 0);
    }

    console.log("= S.BaseShape - IsSnapTarget output:", result);
    return result;
  }

  GetAlignRect() {
    console.log("= S.BaseShape - GetAlignRect input");

    const alignRect = $.extend(true, {}, this.Frame);

    if (this.RotationAngle !== 0) {
      const polyPoints = this.GetPolyPoints(ConstantData.Defines.NPOLYPTS, false, false, true, null);
      const rotationRadians = -this.RotationAngle / (180 / ConstantData.Geometry.PI);
      Utils3.RotatePointsAboutCenter(this.Frame, rotationRadians, polyPoints);
      Utils2.GetPolyRect(alignRect, polyPoints);
    }

    console.log("= S.BaseShape - GetAlignRect output:", alignRect);
    return alignRect;
  }

  GetCustomConnectPointsDirection(direction: number) {
    console.log("= S.BaseShape - GetCustomConnectPointsDirection input:", { direction });

    let closestIndex = -1;
    let closestDistance: number | null = null;
    let currentDistance: number;
    let connectPoints = this.flags & ConstantData.ObjFlags.SEDO_UseConnect && this.ConnectPoints;
    let targetPoints = this.GetTargetPoints(
      null,
      ConstantData.HookFlags.SED_LC_NoSnaps | ConstantData.HookFlags.SED_LC_ForceEnd,
      null
    );
    let topCount = 1, bottomCount = 1, leftCount = 1, rightCount = 1;
    const dimension = ConstantData.Defines.SED_CDim;
    let isSinglePoint = false;
    const ActionArrow = ConstantData.ActionArrow;
    let boundingRect = { x: 0, y: 0, width: dimension, height: dimension };

    if (this.RotationAngle) {
      const rotationRadians = -this.RotationAngle / (180 / ConstantData.Geometry.PI);
      Utils3.RotatePointsAboutCenter(boundingRect, rotationRadians, targetPoints);
    }

    const updateClosestIndex = (coordinate: number, index: number) => {
      if (closestDistance === null) {
        closestIndex = index;
        closestDistance = Math.abs(coordinate - dimension / 2);
      } else {
        currentDistance = Math.abs(coordinate - dimension / 2);
        if (currentDistance < closestDistance) {
          closestIndex = index;
          closestDistance = currentDistance;
        }
      }
    };

    if (targetPoints.length < 2) {
      isSinglePoint = true;
    }

    if (connectPoints) {
      topCount = bottomCount = leftCount = rightCount = 0;
      boundingRect = new Rectangle(0, 0, 0, 0);
      const pointCount = targetPoints.length;
      Utils2.GetPolyRect(boundingRect, targetPoints);

      for (let i = 0; i < pointCount; i++) {
        targetPoints[i].x -= boundingRect.x;
        targetPoints[i].y -= boundingRect.y;
      }

      if (boundingRect.width < 1000) {
        Utils2.InflateRect(boundingRect, 1000, 0);
      }
      if (boundingRect.height < 1000) {
        Utils2.InflateRect(boundingRect, 0, 1000);
      }

      if (boundingRect.height > boundingRect.width) {
        for (let i = 0; i < pointCount; i++) {
          if (targetPoints[i].y < boundingRect.height / 6) {
            topCount++;
            if (direction === ActionArrow.UP) updateClosestIndex(targetPoints[i].x, i);
          } else if (targetPoints[i].y >= 5 * boundingRect.height / 6) {
            bottomCount++;
            if (direction === ActionArrow.DOWN) updateClosestIndex(targetPoints[i].x, i);
          } else if (targetPoints[i].x < boundingRect.width / 6) {
            leftCount++;
            if (direction === ActionArrow.LEFT) updateClosestIndex(targetPoints[i].y, i);
          } else if (targetPoints[i].x >= 5 * boundingRect.width / 6) {
            rightCount++;
            if (direction === ActionArrow.RIGHT) updateClosestIndex(targetPoints[i].y, i);
          }
        }
      } else {
        for (let i = 0; i < pointCount; i++) {
          if (targetPoints[i].x < boundingRect.width / 6) {
            leftCount++;
            if (direction === ActionArrow.LEFT) updateClosestIndex(targetPoints[i].y, i);
          } else if (targetPoints[i].x >= 5 * boundingRect.width / 6) {
            rightCount++;
            if (direction === ActionArrow.RIGHT) updateClosestIndex(targetPoints[i].y, i);
          } else if (targetPoints[i].y < boundingRect.height / 6) {
            topCount++;
            if (direction === ActionArrow.UP) updateClosestIndex(targetPoints[i].x, i);
          } else if (targetPoints[i].y >= 5 * boundingRect.height / 6) {
            bottomCount++;
            if (direction === ActionArrow.DOWN) updateClosestIndex(targetPoints[i].x, i);
          }
        }
      }
    }

    const result = {
      left: leftCount,
      right: rightCount,
      top: topCount,
      bottom: bottomCount,
      index: closestIndex
    };

    console.log("= S.BaseShape - GetCustomConnectPointsDirection output:", result);
    return result;
  }

  AdjustAutoInsertShape(event, isVertical, isRotated) {
    console.log("= S.BaseShape - AdjustAutoInsertShape input:", { event, isVertical, isRotated });

    let connectPoints = this.flags & ConstantData.ObjFlags.SEDO_UseConnect && this.ConnectPoints;
    let topCount = 0, bottomCount = 0, leftCount = 0, rightCount = 0;
    let singlePoint = false;
    let targetPoints = this.GetTargetPoints(null, ConstantData.HookFlags.SED_LC_NoSnaps | ConstantData.HookFlags.SED_LC_ForceEnd, null);
    let isSinglePoint = targetPoints.length < 2;
    let shouldRotate = false;
    let blockIDs = [this.BlockID];

    if (isSinglePoint) {
      GlobalData.optManager.LinkParams && (GlobalData.optManager.LinkParams.AutoSinglePoint = true);
      singlePoint = true;
    } else {
      GlobalData.optManager.LinkParams && (GlobalData.optManager.LinkParams.AutoSinglePoint = false);
      singlePoint = false;
    }

    if (connectPoints) {
      let boundingRect = new Rectangle(0, 0, 0, 0);
      let pointCount = targetPoints.length;
      Utils2.GetPolyRect(boundingRect, targetPoints);

      for (let i = 0; i < pointCount; i++) {
        targetPoints[i].x -= boundingRect.x;
        targetPoints[i].y -= boundingRect.y;
      }

      if (boundingRect.width < 1000) {
        Utils2.InflateRect(boundingRect, 1000, 0);
      }
      if (boundingRect.height < 1000) {
        Utils2.InflateRect(boundingRect, 0, 1000);
      }

      if (boundingRect.height > boundingRect.width) {
        for (let i = 0; i < pointCount; i++) {
          if (targetPoints[i].y < boundingRect.height / 6) {
            topCount++;
          } else if (targetPoints[i].y >= 5 * boundingRect.height / 6) {
            bottomCount++;
          } else if (targetPoints[i].x < boundingRect.width / 6) {
            leftCount++;
          } else if (targetPoints[i].x >= 5 * boundingRect.width / 6) {
            rightCount++;
          }
        }
        if (leftCount === 0 && rightCount === 0 && topCount && bottomCount) {
          shouldRotate = true;
        } else if (leftCount === 0 && rightCount === 0 && singlePoint && (topCount || bottomCount)) {
          shouldRotate = true;
        }
      } else {
        for (let i = 0; i < pointCount; i++) {
          if (targetPoints[i].x < boundingRect.width / 6) {
            leftCount++;
          } else if (targetPoints[i].x >= 5 * boundingRect.width / 6) {
            rightCount++;
          } else if (targetPoints[i].y < boundingRect.height / 6) {
            topCount++;
          } else if (targetPoints[i].y >= 5 * boundingRect.height / 6) {
            bottomCount++;
          }
        }
        if (topCount === 0 && bottomCount === 0 && leftCount && rightCount) {
          shouldRotate = true;
        } else if (topCount === 0 && bottomCount === 0 && singlePoint && (leftCount || rightCount)) {
          shouldRotate = true;
        }
      }

      if (!singlePoint) {
        if (shouldRotate) {
          if (isVertical) {
            if (this.RotationAngle !== 0 && this.RotationAngle !== 180) {
              if (!isRotated) {
                GlobalData.optManager.RotateShapes(0, blockIDs);
                let svgElement = GlobalData.optManager.svgObjectLayer.GetElementByID(this.BlockID);
                svgElement && this.Rotate(svgElement, 0);
              }
              shouldRotate = true;
            }
          } else if (this.RotationAngle !== -90 && this.RotationAngle !== 90) {
            if (!isRotated) {
              GlobalData.optManager.RotateShapes(-90, blockIDs);
              let svgElement = GlobalData.optManager.svgObjectLayer.GetElementByID(this.BlockID);
              svgElement && this.Rotate(svgElement, -90);
            }
            shouldRotate = true;
          }
        } else if (isVertical) {
          if (this.RotationAngle !== -90 && this.RotationAngle !== 90) {
            if (!isRotated) {
              GlobalData.optManager.RotateShapes(-90, blockIDs);
              let svgElement = GlobalData.optManager.svgObjectLayer.GetElementByID(this.BlockID);
              svgElement && this.Rotate(svgElement, -90);
            }
            shouldRotate = true;
          }
        } else if (this.RotationAngle !== 0 && this.RotationAngle !== 180) {
          if (!isRotated) {
            GlobalData.optManager.RotateShapes(0, blockIDs);
            let svgElement = GlobalData.optManager.svgObjectLayer.GetElementByID(this.BlockID);
            svgElement && this.Rotate(svgElement, 0);
          }
          shouldRotate = true;
        }
      }
    }

    console.log("= S.BaseShape - AdjustAutoInsertShape output:", shouldRotate);
    return shouldRotate;
  }

  TRectToFrame(rect: any, maintainSize: boolean) {
    console.log("= S.BaseShape - TRectToFrame input:", { rect, maintainSize });

    let lineThickness = 0;
    let halfLineThickness = 0;
    let widthAdjustment = 0;
    let heightAdjustment = 0;

    if (this.StyleRecord.Line.BThick && this.polylist == null) {
      lineThickness = this.StyleRecord.Line.Thickness;
      halfLineThickness = 0;
    } else {
      halfLineThickness = this.StyleRecord.Line.Thickness / 2;
    }

    this.trect = Utils1.DeepCopy(rect);
    const originalFrame = Utils1.DeepCopy(this.Frame);
    this.inside = new Rectangle(rect.x, rect.y, rect.width, rect.height);

    if (this.GetTable(false) == null) {
      Utils2.Add2Rect(this.inside, this.TMargins);
    }

    this.SetShapeIndent(true);
    Utils2.Add2Rect(this.inside, this.tindent);
    this.Frame = Utils1.DeepCopy(this.inside);
    Utils2.InflateRect(this.Frame, halfLineThickness, halfLineThickness);

    if (!maintainSize) {
      if (this.Frame.width < this.sizedim.width) {
        widthAdjustment = this.sizedim.width - this.Frame.width;
        this.Frame.x = originalFrame.x;
      }
      if (this.Frame.height < this.sizedim.height) {
        heightAdjustment = this.sizedim.height - this.Frame.height;
        this.Frame.y = originalFrame.y;
      }
    }

    if (widthAdjustment > 0 || heightAdjustment > 0) {
      const adjustedFrame = Utils1.DeepCopy(this.Frame);
      adjustedFrame.width += widthAdjustment;
      adjustedFrame.height += heightAdjustment;
      this.UpdateFrame(adjustedFrame);
    } else {
      Utils2.CopyRect(this.r, this.Frame);
      GlobalData.optManager.SetShapeR(this);
    }

    console.log("= S.BaseShape - TRectToFrame output:", { Frame: this.Frame, r: this.r, inside: this.inside });
  }

  SetSize(newWidth: number, newHeight: number, actionType: number) {
    console.log("= S.BaseShape - SetSize input:", { newWidth, newHeight, actionType });

    let originalFrame = {
      x: this.Frame.x,
      y: this.Frame.y,
      width: this.Frame.width,
      height: this.Frame.height
    };

    const isGanttChart = this.objecttype === ConstantData.ObjectTypes.SD_OBJT_GANTT_CHART;
    let sizeChanged = false;

    if (newWidth) {
      originalFrame.width = newWidth;
    }
    if (newHeight) {
      originalFrame.height = newHeight;
    }

    if (newWidth || newHeight) {
      const prevActionBBox = GlobalData.optManager.theActionBBox;
      const newActionBBox = GlobalData.optManager.theActionNewBBox;

      GlobalData.optManager.theActionBBox = Utils1.DeepCopy(this.Frame);
      GlobalData.optManager.theActionNewBBox = Utils1.DeepCopy(this.Frame);

      this.HandleActionTriggerCallResize(originalFrame, actionType, null);

      GlobalData.optManager.theActionBBox = prevActionBBox;
      GlobalData.optManager.theActionNewBBox = newActionBBox;

      if (actionType !== ConstantData.ActionTriggerType.TABLE_EDIT && actionType !== ConstantData.ActionTriggerType.LINE_THICKNESS) {
        if (newWidth) {
          this.sizedim.width = this.Frame.width;
          sizeChanged = true;
        }
        if (newHeight) {
          this.sizedim.height = this.Frame.height;
          sizeChanged = true;
        }
      }

      GlobalData.optManager.SetLinkFlag(this.BlockID, ConstantData.LinkFlags.SED_L_MOVE);

      if (sizeChanged && isGanttChart) {
        GlobalData.optManager.PlanningTableUpdateGeometry(this, true);
      }

      for (let i = 0; i < this.hooks.length; i++) {
        GlobalData.optManager.SetLinkFlag(this.hooks[i].objid, ConstantData.LinkFlags.SED_L_MOVE);
      }

      if (this instanceof Instance.Shape.Polygon) {
        const newVertexArray = this.RegenerateVectors(originalFrame.width, originalFrame.height);
        if (newVertexArray) {
          this.VertexArray = newVertexArray;
        }
        if (this.polylist && this.ShapeType === ConstantData.ShapeType.POLYGON) {
          this.ScaleObject(0, 0, 0, 0, 0, 0);
        }
      }

      GlobalData.optManager.AddToDirtyList(this.BlockID);
      GlobalData.optManager.theActionTable = null;

      if (this.rflags) {
        if (newWidth) {
          this.rflags = Utils2.SetFlag(this.rflags, ConstantData.FloatingPointDim.SD_FP_Width, false);
        }
        if (newHeight) {
          this.rflags = Utils2.SetFlag(this.rflags, ConstantData.FloatingPointDim.SD_FP_Height, false);
        }
      }
    }

    console.log("= S.BaseShape - SetSize output:", { Frame: this.Frame, sizedim: this.sizedim, rflags: this.rflags });
  }

  UpdateDimensions(newWidth: number, newHeight: number, maintainAspectRatio: boolean) {
    console.log("= S.BaseShape - UpdateDimensions input:", { newWidth, newHeight, maintainAspectRatio });

    const updatedFrame = {
      x: this.Frame.x,
      y: this.Frame.y,
      width: this.Frame.width,
      height: this.Frame.height
    };

    if (newWidth) {
      updatedFrame.width = newWidth;
    }

    if (newHeight) {
      updatedFrame.height = newHeight;
    }

    this.UpdateFrame(updatedFrame);

    console.log("= S.BaseShape - UpdateDimensions output:", updatedFrame);
  }

  GetHookFlags() {
    console.log("= S.BaseShape - GetHookFlags input");

    const hookFlags = ConstantData.HookFlags.SED_LC_Shape |
      ConstantData.HookFlags.SED_LC_ArrayMod |
      ConstantData.HookFlags.SED_LC_AttachToLine;

    console.log("= S.BaseShape - GetHookFlags output:", hookFlags);
    return hookFlags;
  }

  AllowLink() {
    console.log("= S.BaseShape - AllowLink input");

    let sessionObject = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, false);
    let dropOnTableFlag = this.flags & ConstantData.ObjFlags.SEDO_DropOnTable;
    let result;

    if (sessionObject) {
      result = (sessionObject.flags & ConstantData.SessionFlags.SEDS_SLink) ||
        (sessionObject.flags & ConstantData.SessionFlags.SEDS_AttLink) ||
        dropOnTableFlag;
    }

    console.log("= S.BaseShape - AllowLink output:", result);
    return result;
  }

  IsSwimlane() {
    console.log("= S.BaseShape - IsSwimlane input");

    const objectTypes = ConstantData.ObjectTypes;
    let result;

    switch (this.objecttype) {
      case objectTypes.SD_OBJT_SWIMLANE_COLS:
      case objectTypes.SD_OBJT_SWIMLANE_ROWS:
      case objectTypes.SD_OBJT_SWIMLANE_GRID:
      case objectTypes.SD_OBJT_FRAME_CONTAINER:
        result = true;
        break;
      default:
        result = false;
    }

    console.log("= S.BaseShape - IsSwimlane output:", result);
    return result;
  }

  IsOKFlowChartShape(objectID: number): number {
    console.log("= S.BaseShape - IsOKFlowChartShape input:", { objectID });

    const object = GlobalData.optManager.GetObjectPtr(objectID, false);
    let result: number;

    if (object && (object.flags & ConstantData.ObjFlags.SEDO_TextOnly || object.IsSwimlane())) {
      result = 0;
    } else {
      result = objectID;
    }

    console.log("= S.BaseShape - IsOKFlowChartShape output:", { result });
    return result;
  }

  PreventLink() {
    console.log("= S.BaseShape - PreventLink input");

    const result = !!this.IsSwimlane();

    console.log("= S.BaseShape - PreventLink output:", result);
    return result;
  }

  GetHookPoints() {
    console.log("= S.BaseShape - GetHookPoints input");

    let connectPoints = this.flags & ConstantData.ObjFlags.SEDO_UseConnect && this.ConnectPoints;
    let table = this.GetTable(false);
    let isTableRows = this.hookflags & ConstantData.HookFlags.SED_LC_TableRows && table;

    if (connectPoints || isTableRows) {
      let points = connectPoints ? this.ConnectPoints : GlobalData.optManager.Table_GetRowConnectPoints(this, table);
      let hookPoints = [];

      for (let i = 0; i < points.length; i++) {
        hookPoints.push({
          x: points[i].x,
          y: points[i].y,
          id: ConstantData.HookPts.SED_CustomBase + i
        });
      }

      console.log("= S.BaseShape - GetHookPoints output:", hookPoints);
      return hookPoints;
    }

    let defaultHookPoints = [
      { x: ConstantData.Defines.SED_CDim / 2, y: 0, id: ConstantData.HookPts.SED_KTC },
      { x: ConstantData.Defines.SED_CDim, y: ConstantData.Defines.SED_CDim / 2, id: ConstantData.HookPts.SED_KRC },
      { x: ConstantData.Defines.SED_CDim / 2, y: ConstantData.Defines.SED_CDim, id: ConstantData.HookPts.SED_KBC },
      { x: 0, y: ConstantData.Defines.SED_CDim / 2, id: ConstantData.HookPts.SED_KLC }
    ];

    console.log("= S.BaseShape - GetHookPoints output:", defaultHookPoints);
    return defaultHookPoints;
  }

  SetHookAlign(hookPoint, alignType) {
    console.log("= S.BaseShape - SetHookAlign input:", { hookPoint, alignType });

    let childArrayIndex, childObject, isFlowConnection;

    switch (hookPoint) {
      case ConstantData.HookPts.SED_AKCL:
        childArrayIndex = GlobalData.optManager.FindChildArray(this.BlockID, -1);
        if (childArrayIndex >= 0) {
          childObject = GlobalData.optManager.GetObjectPtr(childArrayIndex, false);
          if (childObject) {
            isFlowConnection = childObject.arraylist.styleflags & ConstantData.SEDA_Styles.SEDA_FlowConn &&
              !(childObject.arraylist.styleflags & ConstantData.SEDA_Styles.SEDA_Linear);
            if (childObject.hooks.length && childObject.hooks[0].connect.x === 0 && !isFlowConnection) {
              childObject._SetDirection(true, false, false);
            }
          }
        }
        break;

      case ConstantData.HookPts.SED_AKCR:
        childArrayIndex = GlobalData.optManager.FindChildArray(this.BlockID, -1);
        if (childArrayIndex >= 0) {
          childObject = GlobalData.optManager.GetObjectPtr(childArrayIndex, false);
          if (childObject) {
            isFlowConnection = childObject.arraylist.styleflags & ConstantData.SEDA_Styles.SEDA_FlowConn &&
              !(childObject.arraylist.styleflags & ConstantData.SEDA_Styles.SEDA_Linear);
            if (childObject.hooks.length && childObject.hooks[0].connect.x === ConstantData.Defines.SED_CDim && !isFlowConnection) {
              childObject._SetDirection(true, false, false);
            }
          }
        }
        break;
    }

    console.log("= S.BaseShape - SetHookAlign output");
  }

  HookToPoint(hookId: number, hookFlags: any) {
    console.log("= S.BaseShape - HookToPoint input:", { hookId, hookFlags });

    let hookPoints = [];
    let point = [{ x: 0, y: 0 }];
    let perimeterPoints = {};
    let hookIndex = -1;
    let isCustomHook = false;
    let connectionFlags = 0;
    const HookPts = ConstantData.HookPts;
    const SED_CDim = ConstantData.Defines.SED_CDim;
    const HookFlags = ConstantData.HookFlags;

    if (this.flags & ConstantData.ObjFlags.SEDO_Obj1 && this.Pr_Format && this.Pr_Format(this.BlockID)) {
      // Custom formatting logic
    }

    if (hookId === HookPts.SED_KAT) {
      point[0].x = this.attachpoint.x;
      point[0].y = this.attachpoint.y;
      if (this.extraflags & ConstantData.ExtraFlags.SEDE_FlipHoriz) {
        point[0].x = SED_CDim - point[0].x;
      }
      if (this.extraflags & ConstantData.ExtraFlags.SEDE_FlipVert) {
        point[0].y = SED_CDim - point[0].y;
      }
    } else if (hookId === HookPts.SED_KATD) {
      point[0].x = this.attachpoint.x;
      point[0].y = this.attachpoint.y;
    } else {
      switch (hookId) {
        case HookPts.SED_KCTL:
          point[0].x = 0;
          point[0].y = 0;
          break;
        case HookPts.SED_KCTR:
          point[0].x = SED_CDim;
          point[0].y = 0;
          break;
        case HookPts.SED_KCBL:
          point[0].x = 0;
          point[0].y = SED_CDim;
          break;
        case HookPts.SED_KCBR:
          point[0].x = SED_CDim;
          point[0].y = SED_CDim;
          break;
        case HookPts.SED_KCT:
          point[0].x = SED_CDim / 2;
          point[0].y = 0;
          connectionFlags = HookFlags.SED_LC_VOnly;
          break;
        case HookPts.SED_KCB:
          point[0].x = SED_CDim / 2;
          point[0].y = SED_CDim;
          connectionFlags = HookFlags.SED_LC_VOnly;
          break;
        case HookPts.SED_KCL:
          point[0].x = 0;
          point[0].y = SED_CDim / 2;
          connectionFlags = HookFlags.SED_LC_HOnly;
          break;
        case HookPts.SED_KCC:
          point[0].x = SED_CDim / 2;
          point[0].y = SED_CDim / 2;
          break;
        case HookPts.SED_KCR:
          point[0].x = SED_CDim;
          point[0].y = SED_CDim / 2;
          connectionFlags = HookFlags.SED_LC_HOnly;
          break;
        default:
          hookPoints = this.GetHookPoints();
          if (!hookPoints) return null;
          for (let i = 0; i < hookPoints.length; i++) {
            if (hookId === hookPoints[i].id) {
              hookIndex = i;
              point[0].x = hookPoints[i].x;
              point[0].y = hookPoints[i].y;
              break;
            }
          }
          if (hookIndex < 0) {
            switch (hookId) {
              case 1:
                hookIndex = 1;
                point[0].x = SED_CDim / 2;
                point[0].y = 0;
                break;
              case 2:
                hookIndex = 1;
                point[0].x = SED_CDim;
                point[0].y = SED_CDim / 2;
                break;
              case 3:
                hookIndex = 1;
                point[0].x = SED_CDim / 2;
                point[0].y = SED_CDim;
                break;
              case 4:
                hookIndex = 1;
                point[0].x = 0;
                point[0].y = SED_CDim / 2;
                break;
            }
          }
          if (hookIndex < 0) return null;
      }
    }

    if (
      (this.RotationAngle || this.extraflags & (ConstantData.ExtraFlags.SEDE_FlipHoriz | ConstantData.ExtraFlags.SEDE_FlipVert)) &&
      isCustomHook
    ) {
      perimeterPoints = this.GetPerimPts(-1, point, hookId, true, null, -1);
      point = this.PolyGetTargets(perimeterPoints[0], connectionFlags, this.Frame);
      if (!point) return perimeterPoints[0];
    }

    perimeterPoints = this.GetPerimPts(-1, point, hookId, false, null, -1);

    if (hookId === HookPts.SED_KATD) {
      if (this.moreflags & ConstantData.ObjMoreFlags.SED_MF_VisioText) {
        if (this.hookdisp.x || this.hookdisp.y) {
          const parentObject = GlobalData.optManager.GetObjectPtr(this.hooks[0].objid, false);
          if (parentObject) {
            const center = {
              x: parentObject.Frame.x + parentObject.Frame.width / 2,
              y: parentObject.Frame.y + parentObject.Frame.height / 2
            };
            const dispPoints = [{ x: center.x + this.hookdisp.x, y: center.y + this.hookdisp.y }];
            const rotationRadians = -parentObject.RotationAngle / (180 / ConstantData.Geometry.PI);
            Utils3.RotatePointsAboutCenter(parentObject.Frame, rotationRadians, dispPoints);
            dispPoints[0].x -= center.x;
            dispPoints[0].y -= center.y;
            perimeterPoints[0].x -= dispPoints[0].x;
            perimeterPoints[0].y -= dispPoints[0].y;
          }
        }
      } else {
        perimeterPoints[0].x -= this.hookdisp.x;
        perimeterPoints[0].y -= this.hookdisp.y;
      }
    }

    console.log("= S.BaseShape - HookToPoint output:", perimeterPoints[0]);
    return perimeterPoints[0];
  }

  IsCoManager(e: any): boolean {
    console.log("= S.BaseShape - IsCoManager input:", e);

    let isCoManager = false;
    if (this.hooks && this.hooks.length) {
      const hookedObject = GlobalData.optManager.GetObjectPtr(this.hooks[0].objid, false);
      if (hookedObject && hookedObject.DrawingObjectBaseClass === ConstantData.DrawingObjectBaseClass.CONNECTOR) {
        isCoManager = hookedObject.IsCoManager(e);
      }
    }

    console.log("= S.BaseShape - IsCoManager output:", isCoManager);
    return isCoManager;
  }

  RRect_GetCornerSize(customSize) {
    console.log("= S.BaseShape - RRect_GetCornerSize input:", { customSize });

    let width = this.Frame.width;
    let height = this.Frame.height;
    let minDimension = width;

    if (height < minDimension) {
      minDimension = height;
    }

    if (customSize) {
      minDimension = customSize;
    }

    if (this.moreflags & ConstantData.ObjMoreFlags.SED_MF_FixedRR) {
      let fixedSize = ConstantData.Defines.RRectFixedDim * this.shapeparam;
      let maxSize = 0.4 * minDimension;

      if (fixedSize > maxSize) {
        fixedSize = maxSize;
      }

      console.log("= S.BaseShape - RRect_GetCornerSize output:", fixedSize);
      return fixedSize;
    }

    let result = minDimension * this.shapeparam;
    console.log("= S.BaseShape - RRect_GetCornerSize output:", result);
    return result;
  }

  GetPerimPts(points, targetPoints, hookId, rotate, table, needRotate) {
    console.log("= S.BaseShape - GetPerimPts input:", { points, targetPoints, hookId, rotate, table, needRotate });

    let cornerSize = 0;
    let perimeterPoints = [];
    let coManagerPoint = {};
    let isCoManager = false;
    let tablePoints = null;

    if (this.ShapeType === ConstantData.ShapeType.RECT) {
      cornerSize = this.RRect_GetCornerSize();
      if (cornerSize > 0) {
        return this.RRect_GetPerimPts(points, targetPoints, hookId, rotate, table, needRotate);
      }
    }

    if (targetPoints.length === 1 && targetPoints[0].y === -ConstantData.SEDA_Styles.SEDA_CoManager && this.IsCoManager(coManagerPoint)) {
      perimeterPoints.push(new Point(coManagerPoint.x, coManagerPoint.y));
      if (targetPoints[0].id != null) {
        perimeterPoints[0].id = targetPoints[0].id;
      }
      console.log("= S.BaseShape - GetPerimPts output:", perimeterPoints);
      return perimeterPoints;
    }

    const tableObject = this.GetTable(false);
    if (table != null && tableObject) {
      tablePoints = GlobalData.optManager.Table_GetPerimPts(this, tableObject, table, targetPoints);
      if (tablePoints) {
        perimeterPoints = tablePoints;
        isCoManager = true;
      }
    }

    if (!isCoManager) {
      for (let i = 0; i < targetPoints.length; i++) {
        perimeterPoints[i] = {
          x: targetPoints[i].x / ConstantData.Defines.SED_CDim * this.Frame.width + this.Frame.x,
          y: targetPoints[i].y / ConstantData.Defines.SED_CDim * this.Frame.height + this.Frame.y,
          id: targetPoints[i].id != null ? targetPoints[i].id : 0
        };
      }
    }

    if (!rotate) {
      const rotationRadians = -this.RotationAngle / (180 / ConstantData.Geometry.PI);
      Utils3.RotatePointsAboutCenter(this.Frame, rotationRadians, perimeterPoints);
    }

    console.log("= S.BaseShape - GetPerimPts output:", perimeterPoints);
    return perimeterPoints;
  }

  RRect_GetPerimPts(e, targetPoints, hookId, rotate, table, needRotate) {
    console.log("= S.BaseShape - RRect_GetPerimPts input:", { e, targetPoints, hookId, rotate, table, needRotate });

    let cornerSize, polyPoints, intersectCount, intersectPoints = [0, 0];
    const dimension = ConstantData.Defines.SED_CDim;
    let perimeterPoints = [];
    let coManagerPoint = {};

    if (targetPoints.length === 1 && targetPoints[0].y === -ConstantData.SEDA_Styles.SEDA_CoManager && this.IsCoManager(coManagerPoint)) {
      perimeterPoints.push(new Point(coManagerPoint.x, coManagerPoint.y));
      if (targetPoints[0].id != null) {
        perimeterPoints[0].id = targetPoints[0].id;
      }
      console.log("= S.BaseShape - RRect_GetPerimPts output:", perimeterPoints);
      return perimeterPoints;
    }

    if (hookId === ConstantData.HookPts.SED_KAT && table == null) {
      perimeterPoints = new BaseDrawingObject(this).GetPerimPts(e, targetPoints, hookId, false, table, needRotate);
      console.log("= S.BaseShape - RRect_GetPerimPts output:", perimeterPoints);
      return perimeterPoints;
    }

    const tableObject = this.GetTable(false);
    if (table != null && tableObject) {
      const tablePerimPts = GlobalData.optManager.Table_GetPerimPts(this, tableObject, table, targetPoints);
      if (tablePerimPts) {
        perimeterPoints = tablePerimPts;
        if (!rotate) {
          const rotationRadians = -this.RotationAngle / (180 / ConstantData.Geometry.PI);
          Utils3.RotatePointsAboutCenter(this.Frame, rotationRadians, perimeterPoints);
        }
        console.log("= S.BaseShape - RRect_GetPerimPts output:", perimeterPoints);
        return perimeterPoints;
      }
    }

    const useConnect = this.flags & ConstantData.ObjFlags.SEDO_UseConnect;
    const tableRows = this.hookflags & ConstantData.HookFlags.SED_LC_TableRows && tableObject;

    if (useConnect || tableRows) {
      for (let i = 0; i < targetPoints.length; i++) {
        perimeterPoints[i] = {
          x: targetPoints[i].x / dimension * this.Frame.width + this.Frame.x,
          y: targetPoints[i].y / dimension * this.Frame.height + this.Frame.y,
          id: targetPoints[i].id != null ? targetPoints[i].id : 0
        };
      }
    } else {
      perimeterPoints = new BaseDrawingObject(this).GetPerimPts(e, targetPoints, hookId, true, table, needRotate);
      cornerSize = this.GetCornerSize() * ConstantData.Defines.SED_RoundFactor;
      polyPoints = this.GetPolyPoints(ConstantData.Defines.NPOLYPTS, false, false, false, null);

      for (let i = 0; i < perimeterPoints.length; i++) {
        if (targetPoints[i].x === 0 && targetPoints[i].y === 0) {
          perimeterPoints[i].x += cornerSize;
          perimeterPoints[i].y += cornerSize;
        } else if (targetPoints[i].x === 0 && targetPoints[i].y === dimension) {
          perimeterPoints[i].x += cornerSize;
          perimeterPoints[i].y -= cornerSize;
        } else if (targetPoints[i].x === dimension && targetPoints[i].y === 0) {
          perimeterPoints[i].x -= cornerSize;
          perimeterPoints[i].y += cornerSize;
        } else if (targetPoints[i].x === dimension && targetPoints[i].y === dimension) {
          perimeterPoints[i].x -= cornerSize;
          perimeterPoints[i].y -= cornerSize;
        } else if (targetPoints[i].x < dimension / 4) {
          intersectCount = GlobalData.optManager.PolyGetIntersect(polyPoints, perimeterPoints[i].y, intersectPoints, null, false);
          if (intersectCount) {
            perimeterPoints[i].x = intersectPoints[0];
            if (intersectCount > 1 && intersectPoints[1] < perimeterPoints[i].x) {
              perimeterPoints[i].x = intersectPoints[1];
            }
          }
        } else if (targetPoints[i].x > 3 * dimension / 4) {
          intersectCount = GlobalData.optManager.PolyGetIntersect(polyPoints, perimeterPoints[i].y, intersectPoints, null, false);
          if (intersectCount) {
            perimeterPoints[i].x = intersectPoints[0];
            if (intersectCount > 1 && intersectPoints[1] > perimeterPoints[i].x) {
              perimeterPoints[i].x = intersectPoints[1];
            }
          }
        } else if (targetPoints[i].y < dimension / 4) {
          intersectCount = GlobalData.optManager.PolyGetIntersect(polyPoints, perimeterPoints[i].x, intersectPoints, null, true);
          if (intersectCount) {
            perimeterPoints[i].y = intersectPoints[0];
            if (intersectCount > 1 && intersectPoints[1] < perimeterPoints[i].y) {
              perimeterPoints[i].y = intersectPoints[1];
            }
          }
        } else if (targetPoints[i].y > 3 * dimension / 4) {
          intersectCount = GlobalData.optManager.PolyGetIntersect(polyPoints, perimeterPoints[i].x, intersectPoints, null, true);
          if (intersectCount) {
            perimeterPoints[i].y = intersectPoints[0];
            if (intersectCount > 1 && intersectPoints[1] > perimeterPoints[i].y) {
              perimeterPoints[i].y = intersectPoints[1];
            }
          }
        }
        if (targetPoints[i].id != null) {
          perimeterPoints[i].id = targetPoints[i].id;
        }
      }
    }

    if (!rotate) {
      const rotationRadians = -this.RotationAngle / (180 / ConstantData.Geometry.PI);
      Utils3.RotatePointsAboutCenter(this.Frame, rotationRadians, perimeterPoints);
    }

    console.log("= S.BaseShape - RRect_GetPerimPts output:", perimeterPoints);
    return perimeterPoints;
  }

  ChangeTarget(eventType: number, targetID: number, additionalData: any, flag: number, coordinates: { x: number; y: number }, needChangeTarget: boolean) {
    console.log("= S.BaseShape - ChangeTarget input:", { eventType, targetID, additionalData, flag, coordinates, needChangeTarget });

    if (needChangeTarget) {
      let businessMgr = Business.GetSelectionBusinessManager(this.BlockID);

      if (businessMgr === null) {
        businessMgr = GlobalData.gBusinessManager;
      }

      businessMgr.ChangeTarget(targetID);
    }

    console.log("= S.BaseShape - ChangeTarget output");
  }

  GetTargetPoints(event, triggerType, objectID) {
    console.log("= S.BaseShape - GetTargetPoints input:", { event, triggerType, objectID });

    const defaultPoints = [
      { x: 0, y: 0 },
      { x: ConstantData.Defines.SED_CDim / 4, y: 0 },
      { x: ConstantData.Defines.SED_CDim / 2, y: 0 },
      { x: 3 * ConstantData.Defines.SED_CDim / 4, y: 0 },
      { x: ConstantData.Defines.SED_CDim, y: 0 },
      { x: ConstantData.Defines.SED_CDim, y: ConstantData.Defines.SED_CDim / 4 },
      { x: ConstantData.Defines.SED_CDim, y: ConstantData.Defines.SED_CDim / 2 },
      { x: ConstantData.Defines.SED_CDim, y: 3 * ConstantData.Defines.SED_CDim / 4 },
      { x: ConstantData.Defines.SED_CDim, y: ConstantData.Defines.SED_CDim },
      { x: 3 * ConstantData.Defines.SED_CDim / 4, y: ConstantData.Defines.SED_CDim },
      { x: ConstantData.Defines.SED_CDim / 2, y: ConstantData.Defines.SED_CDim },
      { x: ConstantData.Defines.SED_CDim / 4, y: ConstantData.Defines.SED_CDim },
      { x: 0, y: ConstantData.Defines.SED_CDim },
      { x: 0, y: 3 * ConstantData.Defines.SED_CDim / 4 },
      { x: 0, y: ConstantData.Defines.SED_CDim / 2 },
      { x: 0, y: ConstantData.Defines.SED_CDim / 4 }
    ];

    let targetPoints = [];
    const isContinuousConnection = this.flags & ConstantData.ObjFlags.SEDO_ContConn && event !== null;
    const useConnectPoints = this.flags & ConstantData.ObjFlags.SEDO_UseConnect && this.ConnectPoints;
    const table = this.GetTable(false);
    const isTableRows = this.hookflags & ConstantData.HookFlags.SED_LC_TableRows && table;
    const isGanttChart = this.objecttype === ConstantData.ObjectTypes.SD_OBJT_GANTT_CHART;
    let customTargetPoint = {};
    let hasCustomTargetPoint = false;
    const dimension = ConstantData.Defines.SED_CDim;

    if (isGanttChart && table && event) {
      hasCustomTargetPoint = GlobalData.optManager.Table_GetTargetPoints(this, table, event, triggerType, customTargetPoint, objectID);
    }

    if (objectID >= 0) {
      const targetObject = GlobalData.optManager.GetObjectPtr(objectID, false);
      if (targetObject && targetObject.moreflags & ConstantData.ObjMoreFlags.SED_MF_VisioText) {
        const visioTextPoint = [{ x: dimension / 2, y: dimension / 2 }];
        console.log("= S.BaseShape - GetTargetPoints output:", visioTextPoint);
        return visioTextPoint;
      }
    }

    if (hasCustomTargetPoint) {
      targetPoints.push(customTargetPoint);
      console.log("= S.BaseShape - GetTargetPoints output:", targetPoints);
      return targetPoints;
    }

    if (isContinuousConnection) {
      const polyTargets = this.PolyGetTargets(event, triggerType, this.Frame);
      console.log("= S.BaseShape - GetTargetPoints output:", polyTargets);
      return polyTargets;
    }

    if (useConnectPoints || isTableRows) {
      const connectPoints = useConnectPoints ? this.ConnectPoints : GlobalData.optManager.Table_GetRowConnectPoints(this, table);
      for (let i = 0; i < connectPoints.length; i++) {
        targetPoints.push({ x: connectPoints[i].x, y: connectPoints[i].y });
      }

      if (this.extraflags & (ConstantData.ExtraFlags.SEDE_FlipHoriz | ConstantData.ExtraFlags.SEDE_FlipVert)) {
        const rect = new Rectangle(0, 0, dimension, dimension);
        GlobalData.optManager.FlipPoints(rect, this.extraflags, targetPoints);
      }

      console.log("= S.BaseShape - GetTargetPoints output:", targetPoints);
      return targetPoints;
    }

    console.log("= S.BaseShape - GetTargetPoints output:", defaultPoints);
    return defaultPoints;
  }

  GetSegLFace(point: { x: number; y: number }, table: any, hookFlags: any) {
    console.log("= S.BaseShape - GetSegLFace input:", { point, table, hookFlags });

    const m = ConstantData.Defines.SED_CDim;
    const distanceSquared = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      return dx * dx + dy * dy;
    };

    let rotationAngle = this.RotationAngle;
    let rotatedPoint = { ...point };
    if (rotationAngle) {
      const rotationRadians = -rotationAngle / (180 / ConstantData.Geometry.PI);
      const frame = { x: 0, y: 0, width: m, height: m };
      Utils3.RotatePointsAboutCenter(frame, rotationRadians, [rotatedPoint]);
    }

    const useConnectPoints = this.flags & ConstantData.ObjFlags.SEDO_UseConnect;
    const isTableRows = this.hookflags & ConstantData.HookFlags.SED_LC_TableRows && table;
    let connectPoints = [];

    if (useConnectPoints || isTableRows) {
      connectPoints = useConnectPoints ? this.ConnectPoints : GlobalData.optManager.Table_GetRowConnectPoints(this, table);
      if (rotationAngle) {
        const rotationRadians = -rotationAngle / (180 / ConstantData.Geometry.PI);
        const frame = { x: 0, y: 0, width: m, height: m };
        Utils3.RotatePointsAboutCenter(frame, rotationRadians, connectPoints);
      }

      const boundingRect = new Rectangle(0, 0, 0, 0);
      Utils2.GetPolyRect(boundingRect, connectPoints);

      const defaultPoints = [
        { x: m / 2, y: 0 },
        { x: m / 2, y: m },
        { x: 0, y: m / 2 },
        { x: m, y: m / 2 }
      ];

      const extendedPoints = [
        { x: boundingRect.x + boundingRect.width / 2, y: boundingRect.y },
        { x: boundingRect.x + boundingRect.width / 2, y: boundingRect.y + boundingRect.height },
        { x: boundingRect.x, y: boundingRect.y + boundingRect.height / 2 },
        { x: boundingRect.x + boundingRect.width, y: boundingRect.y + boundingRect.height / 2 }
      ];

      const pointsToCheck = boundingRect.height < 1000 || boundingRect.width < 1000 ? defaultPoints : extendedPoints;

      let minDistance = m * m * m;
      let closestPointIndex = 0;
      for (let i = 0; i < pointsToCheck.length; i++) {
        const distance = distanceSquared(pointsToCheck[i], rotatedPoint);
        if (distance < minDistance) {
          minDistance = distance;
          closestPointIndex = i;
        }
      }

      const result = ConstantData.HookPts.SED_KTC + closestPointIndex;
      console.log("= S.BaseShape - GetSegLFace output:", result);
      return result;
    }

    const distances = {
      left: rotatedPoint.x,
      right: m - rotatedPoint.x,
      top: rotatedPoint.y,
      bottom: m - rotatedPoint.y
    };

    let result = ConstantData.SegLDir.SED_KLC;
    if (distances.right < distances.left) {
      result = ConstantData.SegLDir.SED_KRC;
      if (distances.top < distances.right) {
        result = ConstantData.SegLDir.SED_KTC;
        if (distances.bottom < distances.top) {
          result = ConstantData.SegLDir.SED_KBC;
        }
      } else if (distances.bottom < distances.right) {
        result = ConstantData.SegLDir.SED_KBC;
      }
    } else {
      if (distances.top < distances.left) {
        result = ConstantData.SegLDir.SED_KTC;
        if (distances.bottom < distances.top) {
          result = ConstantData.SegLDir.SED_KBC;
        }
      } else if (distances.bottom < distances.left) {
        result = ConstantData.SegLDir.SED_KBC;
      }
    }

    console.log("= S.BaseShape - GetSegLFace output:", result);
    return result;
  }

  Resize(element, newSize, drawingObject, actionType, previousBBox) {
    console.log('= S.BaseShape - Resize input:', { element, newSize, drawingObject, actionType, previousBBox });

    if (element != null) {
      drawingObject.SetDimensionLinesVisibility(element, false);
      const rotation = element.GetRotation();
      if (previousBBox == null) {
        previousBBox = this.prevBBox;
      }

      const eventDetails = {
        action: actionType,
        prevBBox: previousBBox,
        trect: $.extend(true, {}, this.trect)
      };

      Collab.SendSVGEvent(this.BlockID, ConstantData.CollabSVGEventTypes.Shape_Grow, newSize, eventDetails);

      const originalBBox = $.extend(true, {}, previousBBox);
      const updatedBBox = $.extend(true, {}, newSize);
      const inflatedBBox = $.extend(true, {}, newSize);
      const offset = GlobalData.optManager.svgDoc.CalculateRotatedOffsetForResize(originalBBox, updatedBBox, rotation);

      if (this.StyleRecord.Line.BThick && this.polylist == null) {
        Utils2.InflateRect(inflatedBBox, this.StyleRecord.Line.BThick, this.StyleRecord.Line.BThick);
      }

      if (actionType !== ConstantData.ActionTriggerType.MOVEPOLYSEG) {
        element.SetSize(inflatedBBox.width, inflatedBBox.height);
        element.SetPos(inflatedBBox.x + offset.x, inflatedBBox.y + offset.y);

        let cornerSize = 0;
        if (this.ShapeType === ConstantData.ShapeType.RECT) {
          cornerSize = this.RRect_GetCornerSize();
        }

        const shapeElement = element.GetElementByID(ConstantData.SVGElementClass.SHAPE);
        shapeElement.SetSize(inflatedBBox.width, inflatedBBox.height);

        const slopElement = element.GetElementByID(ConstantData.SVGElementClass.SLOP);
        if (slopElement) {
          slopElement.SetSize(inflatedBBox.width, inflatedBBox.height);
        }

        const hatchElement = element.GetElementByID(ConstantData.SVGElementClass.HATCH);
        if (hatchElement) {
          hatchElement.SetSize(inflatedBBox.width, inflatedBBox.height);
        }

        if (cornerSize > 0 && shapeElement.SetRRectSize) {
          shapeElement.SetRRectSize(inflatedBBox.width, inflatedBBox.height, cornerSize, cornerSize);
          if (slopElement && slopElement.SetRRectSize) {
            slopElement.SetRRectSize(inflatedBBox.width, inflatedBBox.height, cornerSize, cornerSize);
          }
          if (hatchElement && hatchElement.SetRRectSize) {
            hatchElement.SetRRectSize(inflatedBBox.width, inflatedBBox.height, cornerSize, cornerSize);
          }
        }
      }

      const table = this.GetTable(false);
      const graph = this.GetGraph(true);

      if (table) {
        GlobalData.optManager.Table_ResizeSVGTableObject(element, drawingObject, newSize);
      } else if (graph) {
        GlobalData.optManager.GraphFormat(this, graph, this.Frame, true);
        GlobalData.optManager.AddToDirtyList(this.BlockID);
        GlobalData.optManager.RenderDirtySVGObjects();
      } else {
        this.LM_ResizeSVGTextObject(element, drawingObject, newSize);
      }

      element.SetRotation(rotation);
      this.UpdateDimensionLines(element);

      console.log('= S.BaseShape - Resize output:', offset);
      return offset;
    }
  }

  ResizeInTextEdit(element, newSize) {
    console.log('= S.BaseShape - ResizeInTextEdit input:', { element, newSize });

    const rotation = element.GetRotation();
    this.SetDimensionLinesVisibility(element, false);

    const originalFrame = $.extend(true, {}, this.Frame);
    const updatedFrame = $.extend(true, {}, newSize);
    const inflatedFrame = $.extend(true, {}, newSize);

    const offset = GlobalData.optManager.svgDoc.CalculateRotatedOffsetForResize(originalFrame, updatedFrame, rotation);

    if (this.StyleRecord.Line.BThick && this.polylist == null) {
      Utils2.InflateRect(inflatedFrame, this.StyleRecord.Line.BThick, this.StyleRecord.Line.BThick);
    }

    element.SetSize(inflatedFrame.width, inflatedFrame.height);
    element.SetPos(inflatedFrame.x + offset.x, inflatedFrame.y + offset.y);

    let cornerSize = 0;
    if (this.ShapeType === ConstantData.ShapeType.RECT) {
      cornerSize = this.RRect_GetCornerSize();
    }

    const shapeElement = element.GetElementByID(ConstantData.SVGElementClass.SHAPE);
    if (shapeElement) {
      shapeElement.SetSize(inflatedFrame.width, inflatedFrame.height);
    }

    const slopElement = element.GetElementByID(ConstantData.SVGElementClass.SLOP);
    if (slopElement) {
      slopElement.SetSize(inflatedFrame.width, inflatedFrame.height);
    }

    const table = this.GetTable(false);
    if (table) {
      GlobalData.optManager.Table_ResizeSVGTableObject(element, this, newSize, true);
    }

    const hatchElement = element.GetElementByID(ConstantData.SVGElementClass.HATCH);
    if (hatchElement) {
      hatchElement.SetSize(newSize.width, newSize.height);
    }

    if (cornerSize > 0) {
      if (shapeElement && shapeElement.SetRRectSize) {
        shapeElement.SetRRectSize(inflatedFrame.width, inflatedFrame.height, cornerSize, cornerSize);
      }
      if (slopElement && slopElement.SetRRectSize) {
        slopElement.SetRRectSize(inflatedFrame.width, inflatedFrame.height, cornerSize, cornerSize);
      }
      if (hatchElement && hatchElement.SetRRectSize) {
        hatchElement.SetRRectSize(inflatedFrame.width, inflatedFrame.height, cornerSize, cornerSize);
      }
    }

    element.SetRotation(rotation);
    GlobalData.optManager.UpdateDisplayCoordinates(newSize, null, null, this);
    this.UpdateDimensionLines(element);

    console.log('= S.BaseShape - ResizeInTextEdit output:', offset);
    return offset;
  }

  Rotate(element, angle) {
    console.log("= S.BaseShape - Rotate input:", { element, angle });
    element.SetRotation(angle);
    console.log("= S.BaseShape - Rotate output");
  }

  ApplyStyles(element, styleRecord) {
    console.log("= S.BaseShape - ApplyStyles input:", { element, styleRecord });

    let fillType = styleRecord.Fill.Paint.FillType;
    let strokeType = styleRecord.Line.Paint.FillType;
    const hasImageURL = this.ImageURL !== '';
    let fillColor = styleRecord.Fill.Paint.Color;
    let strokeColor = styleRecord.Line.Paint.Color;
    const fieldDataStyleOverride = this.GetFieldDataStyleOverride();

    if (fieldDataStyleOverride) {
      if (fieldDataStyleOverride.fillColor && fillType !== ConstantData.FillTypes.SDFILL_TRANSPARENT) {
        fillType = ConstantData.FillTypes.SDFILL_SOLID;
        fillColor = fieldDataStyleOverride.fillColor;
      }
      if (fieldDataStyleOverride.strokeColor) {
        strokeType = ConstantData.FillTypes.SDFILL_SOLID;
        strokeColor = fieldDataStyleOverride.strokeColor;
      }
    }

    if (!this.SymbolURL) {
      if (hasImageURL) {
        let scaleType = 'PROPFILL';
        const cropRect = { x: 0, y: 0, width: 0, height: 0 };

        if (this.ImageHeader) {
          if (this.ImageHeader.croprect) {
            cropRect.x = this.ImageHeader.croprect.left;
            cropRect.y = this.ImageHeader.croprect.top;
            cropRect.width = this.ImageHeader.croprect.right - this.ImageHeader.croprect.left;
            cropRect.height = this.ImageHeader.croprect.bottom - this.ImageHeader.croprect.top;
          }
          if (this.ImageHeader.imageflags !== undefined) {
            if (this.ImageHeader.imageflags === ConstantData.ImageScales.SDIMAGE_ALWAYS_FIT) {
              scaleType = 'NOPROP';
            } else if (this.ImageHeader.imageflags === ConstantData.ImageScales.SDIMAGE_PROP_FIT) {
              scaleType = 'PROPFIT';
            }
          }
        }

        if (this.BlobBytesID !== -1) {
          const blob = GlobalData.optManager.GetObjectPtr(this.BlobBytesID, false);
          if (blob && blob.ImageDir === FileParser.Image_Dir.dir_svg) {
            if (this.SVGDim.width == null) {
              this.SVGDim = Utils2.ParseSVGDimensions(blob.Bytes);
            }
            element.SetImageFill(this.ImageURL, {
              scaleType,
              cropRect,
              imageWidth: this.SVGDim.width,
              imageHeight: this.SVGDim.height
            });
          } else {
            element.SetImageFill(this.ImageURL, { scaleType, cropRect });
          }
        } else {
          if (this.ImageURL.slice(-3).toUpperCase() === 'SVG') {
            element.SetImageFill(this.ImageURL, {
              scaleType,
              cropRect,
              imageWidth: this.SVGDim.width,
              imageHeight: this.SVGDim.height
            });
          } else {
            element.SetImageFill(this.ImageURL, { scaleType, cropRect });
          }
        }

        const flipHorizontally = (this.extraflags & ConstantData.ExtraFlags.SEDE_FlipHoriz) > 0;
        const flipVertically = (this.extraflags & ConstantData.ExtraFlags.SEDE_FlipVert) > 0;
        if (flipHorizontally) {
          element.SetMirror(flipHorizontally);
        }
        if (flipVertically) {
          element.SetFlip(flipVertically);
        }
        element.SetFillOpacity(styleRecord.Fill.Paint.Opacity);
      } else {
        switch (fillType) {
          case ConstantData.FillTypes.SDFILL_GRADIENT:
            element.SetGradientFill(this.CreateGradientRecord(
              styleRecord.Fill.Paint.GradientFlags,
              fillColor,
              styleRecord.Fill.Paint.Opacity,
              styleRecord.Fill.Paint.EndColor,
              styleRecord.Fill.Paint.EndOpacity
            ));
            break;
          case ConstantData.FillTypes.SDFILL_RICHGRADIENT:
            element.SetGradientFill(this.CreateRichGradientRecord(styleRecord.Fill.Paint.GradientFlags));
            break;
          case ConstantData.FillTypes.SDFILL_TEXTURE:
            const texture = {
              url: '',
              scale: 1,
              alignment: styleRecord.Fill.Paint.TextureScale.AlignmentScalar
            };
            const textureIndex = styleRecord.Fill.Paint.Texture;
            if (GlobalData.optManager.TextureList.Textures[textureIndex]) {
              texture.dim = GlobalData.optManager.TextureList.Textures[textureIndex].dim;
              texture.url = GlobalData.optManager.TextureList.Textures[textureIndex].ImageURL;
              texture.scale = GlobalData.optManager.CalcTextureScale(styleRecord.Fill.Paint.TextureScale, texture.dim.x);
              styleRecord.Fill.Paint.TextureScale.Scale = texture.scale;
              if (!texture.url) {
                texture.url = Constants.FilePath_CMSRoot + Constants.FilePath_Textures + GlobalData.optManager.TextureList.Textures[textureIndex].filename;
              }
              element.SetTextureFill(texture);
              element.SetFillOpacity(styleRecord.Fill.Paint.Opacity);
            }
            break;
          case ConstantData.FillTypes.SDFILL_TRANSPARENT:
            element.SetFillColor('none');
            break;
          default:
            if (styleRecord.Fill.Paint.Color.indexOf('#0102') === 0) {
              element.SetFillColor('none');
              GlobalData.optManager.Test3DGraph(element.parent, this.Frame.width, this.Frame.height, styleRecord.Fill.Paint.Color);
            } else {
              element.SetFillColor(fillColor);
              element.SetFillOpacity(styleRecord.Fill.Paint.Opacity);
            }
            break;
        }

        switch (strokeType) {
          case ConstantData.FillTypes.SDFILL_GRADIENT:
            element.SetGradientStroke(this.CreateGradientRecord(
              styleRecord.Line.Paint.GradientFlags,
              strokeColor,
              styleRecord.Line.Paint.Opacity,
              styleRecord.Line.Paint.EndColor,
              styleRecord.Line.Paint.EndOpacity
            ));
            break;
          case ConstantData.FillTypes.SDFILL_RICHGRADIENT:
            element.SetGradientStroke(this.CreateRichGradientRecord(styleRecord.Line.Paint.GradientFlags));
            break;
          case ConstantData.FillTypes.SDFILL_TEXTURE:
            const strokeTexture = {
              url: '',
              scale: styleRecord.Line.Paint.TextureScale.Scale,
              alignment: styleRecord.Line.Paint.TextureScale.AlignmentScalar
            };
            const strokeTextureIndex = styleRecord.Line.Paint.Texture;
            strokeTexture.dim = GlobalData.optManager.TextureList.Textures[strokeTextureIndex].dim;
            strokeTexture.url = GlobalData.optManager.TextureList.Textures[strokeTextureIndex].ImageURL;
            if (!strokeTexture.url) {
              strokeTexture.url = Constants.FilePath_CMSRoot + Constants.FilePath_Textures + GlobalData.optManager.TextureList.Textures[strokeTextureIndex].filename;
            }
            element.SetTextureStroke(strokeTexture);
            element.SetStrokeOpacity(styleRecord.Line.Paint.Opacity);
            break;
          default:
            element.SetStrokeColor(strokeColor);
            element.SetStrokeOpacity(styleRecord.Line.Paint.Opacity);
            break;
        }
      }
    }

    console.log("= S.BaseShape - ApplyStyles output");
  }

  SetFillHatch(element, hatchType, color) {
    console.log("= S.BaseShape - SetFillHatch input:", { element, hatchType, color });

    if (hatchType !== -1 && hatchType !== 0) {
      let hatchIndex = hatchType - 1;
      const texture = {};
      const effects = [];

      if (hatchIndex < 10) {
        hatchIndex = '0' + hatchIndex;
      }

      texture.url = Constants.FilePath_Hatches + Constants.HatchName + hatchIndex + '.png';
      texture.scale = 1;
      texture.alignment = 0;
      texture.dim = { x: 128, y: 128 };

      element.SetTextureFill(texture);

      let lineColor = this.StyleRecord.Line.Paint.Color;
      if (color) {
        lineColor = color;
      }

      effects.push({
        type: Effects.EffectType.RECOLOR,
        params: { color: lineColor }
      });

      element.Effects().SetEffects(effects, this.Frame);
    } else {
      element.SetFillColor('none');
    }

    console.log("= S.BaseShape - SetFillHatch output");
  }

  IsTransparent() {
    console.log("= S.BaseShape - IsTransparent input");

    const isTransparent = this.StyleRecord.Fill.Paint.FillType === ConstantData.FillTypes.SDFILL_TRANSPARENT;

    console.log("= S.BaseShape - IsTransparent output:", isTransparent);
    return isTransparent;
  }

  GetTargetRect() {
    console.log("= S.BaseShape - GetTargetRect input");

    const targetRect = {};
    Utils2.CopyRect(targetRect, this.Frame);

    console.log("= S.BaseShape - GetTargetRect output:", targetRect);
    return targetRect;
  }

  Hit(point, isBorderOnly, isTransparent, hitResult) {
    console.log("= S.BaseShape - Hit input:", { point, isBorderOnly, isTransparent, hitResult });

    let rotationRadians, polyPoints, hitCode;
    const transformedPoint = [{ x: point.x, y: point.y }];
    const frameWithThickness = {};
    const borderThickness = this.StyleRecord.Line.Thickness / 2;

    if (this.flags & ConstantData.ObjFlags.SEDO_UseConnect && this.ConnectPoints) {
      isBorderOnly = false;
    }

    if (this.RotationAngle !== 0) {
      rotationRadians = this.RotationAngle / (180 / ConstantData.Geometry.PI);
      Utils3.RotatePointsAboutCenter(this.Frame, rotationRadians, transformedPoint);
    }

    const transformedCoords = { x: transformedPoint[0].x, y: transformedPoint[0].y };
    Utils2.CopyRect(frameWithThickness, this.Frame);
    Utils2.InflateRect(frameWithThickness, borderThickness, borderThickness);

    hitCode = Utils2.pointInRect(frameWithThickness, transformedCoords) ? ConstantData.HitCodes.SED_Border : 0;

    if (hitCode) {
      polyPoints = this.GetPolyPoints(ConstantData.Defines.NPOLYPTS, false, false, true, null);
      if (GlobalData.optManager.FromOverlayLayer || GlobalData.optManager.PolyPtInPolygon(polyPoints, transformedCoords)) {
        hitCode = ConstantData.HitCodes.SED_Inside;
        if (this.IsTransparent() || isBorderOnly) {
          hitCode = 0;
          isBorderOnly = true;
        }
        polyPoints = this.GetPolyPoints(ConstantData.Defines.NPOLYPTS, false, false, false, null);
        if (isBorderOnly && Utils3.LineDStyleHit(polyPoints, transformedCoords, borderThickness, 0, null)) {
          hitCode = ConstantData.HitCodes.SED_Border;
        }
      } else {
        hitCode = 0;
      }
    }

    if (hitResult) {
      hitResult.hitcode = hitCode;
    }

    console.log("= S.BaseShape - Hit output:", hitCode);
    return hitCode;
  }

  AllowMaintainLink() {
    console.log("= S.BaseShape - AllowMaintainLink input");

    const result = !!(
      this instanceof Instance.Shape.Polygon &&
      this.hookflags & ConstantData.HookFlags.SED_LC_AttachToLine
    );

    console.log("= S.BaseShape - AllowMaintainLink output:", result);
    return result;
  }

  PolyGetTargetPointList(rotationAngle: number) {
    console.log("= S.BaseShape - PolyGetTargetPointList input:", { rotationAngle });

    let polyPoints = this.GetPolyPoints(ConstantData.Defines.NPOLYPTS, false, false, true, null);
    let angleInRadians = 0;

    if (rotationAngle !== 0) {
      angleInRadians = -rotationAngle / (180 / ConstantData.Geometry.PI);
      Utils3.RotatePointsAboutCenter(this.Frame, angleInRadians, polyPoints);
    }

    console.log("= S.BaseShape - PolyGetTargetPointList output:", polyPoints);
    return polyPoints;
  }

  PolyGetTargets(event, hookFlags, frame) {
    console.log("= S.BaseShape - PolyGetTargets input:", { event, hookFlags, frame });

    let closestPointIndex = -1;
    let minDistance = ConstantData.Defines.LongIntMax;
    const targetPoints = [{ x: 0, y: 0 }];
    const resultPoints = [];
    const rotatedEvent = { x: event.x, y: event.y };
    const rotatedFrame = { ...frame };
    const polyPoints = this.PolyGetTargetPointList(hookFlags);

    if (!event) return null;

    if (GlobalData.docHandler.documentConfig.enableSnap && !(hookFlags & ConstantData.HookFlags.SED_LC_NoSnaps)) {
      rotatedEvent.x = GlobalData.docHandler.SnapToGrid(rotatedEvent).x;
      rotatedEvent.y = GlobalData.docHandler.SnapToGrid(rotatedEvent).y;
      rotatedEvent.y = Math.max(rotatedEvent.y, frame.y);
      rotatedEvent.y = Math.min(rotatedEvent.y, frame.y + frame.height);
      rotatedEvent.x = Math.max(rotatedEvent.x, frame.x);
      rotatedEvent.x = Math.min(rotatedEvent.x, frame.x + frame.width);
    }

    for (let i = 1; i < polyPoints.length; i++) {
      const startPoint = polyPoints[i - 1];
      const endPoint = polyPoints[i];

      if (Utils2.EqualPt(startPoint, endPoint)) continue;

      const deltaX = endPoint.x - startPoint.x || 1;
      const deltaY = endPoint.y - startPoint.y || 1;

      let intersectionX, intersectionY, distance;

      if (Math.abs(deltaY / deltaX) > 1) {
        intersectionY = rotatedEvent.y;
        intersectionX = startPoint.x + (intersectionY - startPoint.y) * (deltaX / deltaY);
        distance = Math.abs(intersectionX - rotatedEvent.x);
      } else {
        intersectionX = rotatedEvent.x;
        intersectionY = startPoint.y + (intersectionX - startPoint.x) * (deltaY / deltaX);
        distance = Math.abs(intersectionY - rotatedEvent.y);
      }

      const boundingRect = Utils2.Pt2Rect(startPoint, endPoint);
      Utils2.InflateRect(boundingRect, 1, 1);

      if (Utils2.pointInRect(boundingRect, { x: intersectionX, y: intersectionY }) && distance < minDistance) {
        minDistance = distance;
        closestPointIndex = i;
        targetPoints[0].x = intersectionX;
        targetPoints[0].y = intersectionY;
      }
    }

    if (closestPointIndex >= 0) {
      if (this.RotationAngle !== 0) {
        const rotationRadians = this.RotationAngle / (180 / ConstantData.Geometry.PI);
        Utils3.RotatePointsAboutCenter(rotatedFrame, rotationRadians, targetPoints);
      }

      const normalizedX = (targetPoints[0].x - frame.x) / frame.width * ConstantData.Defines.SED_CDim;
      const normalizedY = (targetPoints[0].y - frame.y) / frame.height * ConstantData.Defines.SED_CDim;
      resultPoints.push(new Point(normalizedX, normalizedY));

      console.log("= S.BaseShape - PolyGetTargets output:", resultPoints);
      return resultPoints;
    }

    console.log("= S.BaseShape - PolyGetTargets output: null");
    return null;
  }

  LM_AddSVGTextObject(e, t) {
    var a,
      r = $.extend(!0, {
      }, this.Frame),
      i = Utils1.DeepCopy(this.trect),
      n = - 1,
      o = this.GetTable(!1);
    if (o) {
      if (!(o.select >= 0)) return;
      var s = o.cells[o.select];
      if (s.DataID !== this.DataID) {
        var l = GlobalData.optManager.Table_CellFromDataID(o, this.DataID);
        l >= 0 &&
          (s = o.cells[l])
      }
      a = s.trect,
        s.nextra &&
        (a = GlobalData.optManager.Table_GetJoinedCellFrame(o, o.select, !0, !1)),
        i.x = this.trect.x + a.x,
        i.y = this.trect.y + a.y,
        i.width = a.width,
        i.height = a.height,
        n = s.DataID
    }
    var S = GlobalData.objectStore.GetObject(this.DataID);
    if (null != S) {
      var c = e.CreateShape(ConstantData.CreateShapeType.TEXT);
      c.SetRenderingEnabled(!1),
        c.SetID(ConstantData.SVGElementClass.TEXT),
        c.SetUserData(n);
      var u = this.StyleRecord;
      u.Line.BThick &&
        null == this.polylist &&
        Utils2.InflateRect(r, u.Line.BThick, u.Line.BThick),
        c.SetSpellCheck(this.AllowSpell()),
        c.InitDataSettings(
          this.fieldDataTableID,
          this.fieldDataElemID,
          this.dataStyleOverride
        ),
        this.TextFlags & ConstantData.TextFlags.SED_TF_AttachA ||
        this.TextFlags & ConstantData.TextFlags.SED_TF_AttachB ||
        (c.SetPos(i.x - r.x, i.y - r.y), c.SetSize(i.width, i.height)),
        t &&
        (t.AddElement(c), t.isText = !0, t.textElem = c),
        S.Data.runtimeText ? c.SetRuntimeText(S.Data.runtimeText) : (
          c.SetText(''),
          c.SetParagraphAlignment(this.TextAlign),
          c.SetVerticalAlignment('middle')
        ),
        S.Data.runtimeText ||
        (S.Data.runtimeText = c.GetRuntimeText());
      var p = null;
      if (
        this.bInGroup &&
        c.DisableHyperlinks(!0),
        this.TextFlags & ConstantData.TextFlags.SED_TF_AttachA
      ) switch (
        c.SetRenderingEnabled(!0),
        c.SetConstraints(GlobalData.optManager.theContentHeader.MaxWorkDim.x, 0, 0),
        (p = c.GetTextMinDimensions()).width,
        p.height,
        this.TextAlign
        ) {
          case ConstantData.TextAlign.TOPLEFT:
          case ConstantData.TextAlign.LEFT:
          case ConstantData.TextAlign.BOTTOMLEFT:
            c.SetPos(0, - p.height - this.TMargins.top),
              c.SetParagraphAlignment(ConstantData.TextAlign.LEFT);
            break;
          case ConstantData.TextAlign.TOPRIGHT:
          case ConstantData.TextAlign.RIGHT:
          case ConstantData.TextAlign.BOTTOMRIGHT:
            c.SetPos(this.Frame.width - p.width, - p.height - this.TMargins.top),
              c.SetParagraphAlignment(ConstantData.TextAlign.RIGHT);
            break;
          default:
            c.SetPos(this.Frame.width / 2 - p.width / 2, - p.height - this.TMargins.top),
              c.SetParagraphAlignment(ConstantData.TextAlign.CENTER)
        } else if (this.TextFlags & ConstantData.TextFlags.SED_TF_AttachB) switch (
          c.SetRenderingEnabled(!0),
          c.SetConstraints(GlobalData.optManager.theContentHeader.MaxWorkDim.x, 0, 0),
          (p = c.GetTextMinDimensions()).width,
          this.TextAlign
        ) {
            case ConstantData.TextAlign.TOPLEFT:
            case ConstantData.TextAlign.LEFT:
            case ConstantData.TextAlign.BOTTOMLEFT:
              c.SetPos(0, this.Frame.height + this.TMargins.bottom),
                c.SetParagraphAlignment(ConstantData.TextAlign.LEFT);
              break;
            case ConstantData.TextAlign.TOPRIGHT:
            case ConstantData.TextAlign.RIGHT:
            case ConstantData.TextAlign.BOTTOMRIGHT:
              c.SetPos(
                this.Frame.width - p.width,
                this.Frame.height + this.TMargins.bottom
              ),
                c.SetParagraphAlignment(ConstantData.TextAlign.RIGHT);
              break;
            default:
              c.SetPos(
                this.Frame.width / 2 - p.width / 2,
                this.Frame.height + this.TMargins.bottom
              ),
                c.SetParagraphAlignment(ConstantData.TextAlign.CENTER)
          } else this.TextGrow == ConstantData.TextGrowBehavior.HORIZONTAL ? c.SetConstraints(GlobalData.optManager.theContentHeader.MaxWorkDim.x, i.width, i.height) : c.SetConstraints(i.width, i.width, i.height);
      c.SetRenderingEnabled(!0),
        c.SetEditCallback(GlobalData.optManager.TextCallback, t)
    }
  }

  LM_ResizeSVGTextObject(e, t, a) {
    if (- 1 != t.DataID) {
      var r = e.GetElementByID(ConstantData.SVGElementClass.TEXT);
      if (r) {
        var i = t.trect,
          n = null;
        if (this.TextFlags & ConstantData.TextFlags.SED_TF_AttachA) {
          switch ((n = r.GetTextMinDimensions()).width, n.height, this.TextAlign) {
            case ConstantData.TextAlign.TOPLEFT:
            case ConstantData.TextAlign.LEFT:
            case ConstantData.TextAlign.BOTTOMLEFT:
              r.SetPos(0, - n.height - this.TMargins.top),
                r.SetParagraphAlignment(ConstantData.TextAlign.LEFT);
              break;
            case ConstantData.TextAlign.TOPRIGHT:
            case ConstantData.TextAlign.RIGHT:
            case ConstantData.TextAlign.BOTTOMRIGHT:
              r.SetPos(a.width - n.width, - n.height - this.TMargins.top),
                r.SetParagraphAlignment(ConstantData.TextAlign.RIGHT);
              break;
            default:
              r.SetPos(a.width / 2 - n.width / 2, - n.height - this.TMargins.top),
                r.SetParagraphAlignment(ConstantData.TextAlign.CENTER)
          }
          r.SetConstraints(GlobalData.optManager.theContentHeader.MaxWorkDim.x, 0, 0)
        } else if (this.TextFlags & ConstantData.TextFlags.SED_TF_AttachB) {
          switch ((n = r.GetTextMinDimensions()).width, this.TextAlign) {
            case ConstantData.TextAlign.TOPLEFT:
            case ConstantData.TextAlign.LEFT:
            case ConstantData.TextAlign.BOTTOMLEFT:
              r.SetPos(0, a.height + this.TMargins.bottom),
                r.SetParagraphAlignment(ConstantData.TextAlign.LEFT);
              break;
            case ConstantData.TextAlign.TOPRIGHT:
            case ConstantData.TextAlign.RIGHT:
            case ConstantData.TextAlign.BOTTOMRIGHT:
              r.SetPos(a.width - n.width, a.height + this.TMargins.bottom),
                r.SetParagraphAlignment(ConstantData.TextAlign.RIGHT);
              break;
            default:
              r.SetPos(a.width / 2 - n.width / 2, a.height + this.TMargins.bottom),
                r.SetParagraphAlignment(ConstantData.TextAlign.CENTER)
          }
          r.SetConstraints(GlobalData.optManager.theContentHeader.MaxWorkDim.x, 0, 0)
        } else {
          r.SetPos(i.x - a.x, i.y - a.y);
          var o = i.width;
          this.TextGrow == ConstantData.TextGrowBehavior.HORIZONTAL &&
            (o = GlobalData.optManager.theContentHeader.MaxWorkDim.x),
            r.SetConstraints(o, i.width, i.height)
        }
      }
    }
  }

  WriteSDFAttributes(e, t) {
    var a,
      r,
      i = this.DataID,
      n = this.GetTable(!1),
      o = this.GetGraph(!1),
      s = this.GetGanttInfo(!1),
      l = !1;
    if (
      (
        this.TextFlags & ConstantData.TextFlags.SED_TF_AttachB ||
        this.TextFlags & ConstantData.TextFlags.SED_TF_AttachA
      ) &&
      (t.WriteBlocks || t.WriteVisio || (i = - 1)),
      SDF.WriteTextParams(e, this, i, t),
      n
    ) {
      var S = t.WriteGroupBlock &&
        this.objecttype === ConstantData.ObjectTypes.SD_OBJT_TABLE_WITH_SHAPECONTAINER;
      t.noTables ||
        t.WriteBlocks ||
        t.WriteGroupBlock &&
        !S ? (t.WriteBlocks || t.WriteGroupBlock) &&
      (
        SDF.WriteTableID(e, this.TableID, t),
        s &&
        SDF.WriteGanttInfoID(e, this.GanttInfoID, t)
      ) : (SDF.WriteTable(e, n, t), s && SDF.WriteGanttInfo(e, s, t))
    } else o ? /*!SDFWResult.noTables &&*/ t.WriteBlocks ||
      t.WriteGroupBlock ? (t.WriteBlocks || t.WriteGroupBlock) &&
    SDF.WriteGraphID(e, this.GraphID, t) : SDF.WriteGraph(e, o, t) : i >= 0 &&
    !t.WriteBlocks &&
    !t.WriteGroupBlock &&
    SDF.WriteText(e, this, null, null, !1, t);
    if (
      // this instanceof ListManager.SVGFragmentSymbol &&
      // Double === TODO
      // this instanceof GlobalDataShape.SVGFragmentSymbol &&
      this instanceof Instance.Shape.SVGFragmentSymbol &&
      this.EMFHash &&
      (
        SDF.WriteString8(
          e,
          this.EMFHash,
          FileParser.SDROpCodesByName.SDF_C_EMFHASH,
          t
        ),
        l = !0
      ),
      (r = this.GetEMFBlobBytes()) &&
      !t.noTables
    ) SDF.WriteImageHeader(e, this, t),
      this.EMFHash &&
      !l &&
      SDF.WriteString8(
        e,
        this.EMFHash,
        FileParser.SDROpCodesByName.SDF_C_EMFHASH,
        t
      ),
      t.WriteBlocks ||
        t.WriteGroupBlock ? SDF.WriteEMFBlobBytesID(e, this.EMFBlobBytesID, FileParser.Image_Dir.dir_meta, t) : SDF.WriteBlob(e, r.Bytes, FileParser.SDROpCodesByName.SDF_C_DRAWMETA),
      (a = this.GetBlobBytes()) &&
      (
        t.WriteBlocks ||
          t.WriteGroupBlock ? SDF.WriteBlobBytesID(e, this.BlobBytesID, FileParser.Image_Dir.dir_png, t) : SDF.WriteBlob(
            e,
            a.Bytes,
            FileParser.SDROpCodesByName.SDF_C_DRAWPREVIEWPNG
          )
      );
    else if ((a = this.GetBlobBytes()) && !t.noTables) switch (SDF.WriteImageHeader(e, this, t), a.ImageDir) {
      case FileParser.Image_Dir.dir_jpg:
        SDF.WriteImageHeader(e, this, t),
          t.WriteBlocks ||
            t.WriteGroupBlock ? SDF.WriteBlobBytesID(e, this.BlobBytesID, FileParser.Image_Dir.dir_jpg, t) : SDF.WriteBlob(e, a.Bytes, FileParser.SDROpCodesByName.SDF_C_DRAWJPG);
        break;
      case FileParser.Image_Dir.dir_png:
        SDF.WriteImageHeader(e, this, t),
          t.WriteBlocks ||
            t.WriteGroupBlock ? SDF.WriteBlobBytesID(e, this.BlobBytesID, FileParser.Image_Dir.dir_png, t) : SDF.WriteBlob(e, a.Bytes, FileParser.SDROpCodesByName.SDF_C_DRAWPNG);
        break;
      case FileParser.Image_Dir.dir_svg:
        SDF.WriteImageHeader(e, this, t),
          t.WriteBlocks ? SDF.WriteBlobBytesID(e, this.BlobBytesID, FileParser.Image_Dir.dir_svg, t) : SDF.WriteBlob(e, a.Bytes, FileParser.SDROpCodesByName.SDF_C_DRAWSVG)
    } else if (
      null != this.ImageID &&
      this.ImageID.length > 0 &&
      !t.noTables &&
      this.ImageDir === FileParser.Image_Dir.dir_svg
    ) SDF.WriteString(
      e,
      this.ImageID,
      FileParser.SDROpCodesByName.SDF_C_SVGIMAGEID,
      t
    ),
      l = !0;
    if (
      this.EMFHash &&
      !l &&
      (
        SDF.WriteString8(
          e,
          this.EMFHash,
          FileParser.SDROpCodesByName.SDF_C_EMFHASH,
          t
        ),
        l = !0
      ),
      this.OleHeader &&
      SDF.WriteOleHeader(e, this.OleHeader, t),
      this.OleBlobBytesID >= 0 &&
      (
        a = this.GetOleBlobBytes(),
        t.WriteBlocks ? SDF.WriteOleBlobBytesID(e, this.OleBlobBytesID, FileParser.Image_Dir.dir_store, t) : SDF.WriteBlob(e, a.Bytes, FileParser.SDROpCodesByName.SDF_C_OLESTORAGE)
      ),
      this.NativeID >= 0
    ) if (t.WriteBlocks) SDF.WriteNativeID(e, this.NativeID, t);
      else {
        var c = GlobalData.optManager.GetObjectPtr(this.NativeID, !1);
        if (c) {
          var u = SDF.Write_CODE(e, FileParser.SDROpCodesByName.SDF_C_NATIVESTORAGE);
          FileParser.write_nativesdfbuffer(e, c),
            SDF.Write_LENGTH(e, u)
        }
      }
    if (this.ExpandedViewID >= 0) {
      var p = GlobalData.optManager.GetObjectPtr(this.ExpandedViewID, !1);
      t.WriteBlocks ||
        t.WriteGroupBlock ? (t.WriteBlocks || t.WriteGroupBlock) &&
      SDF.WriteExpandedViewID(e, this.ExpandedViewID, t) : SDF.WriteExpandedView(e, p, t)
    }
    this.ContainerList &&
      SDF.WriteContainerList(e, this.ContainerList, t)
  }

  GetIconShape() {
    var e = this.GetTable(!1);
    if (e) {
      var t = e.cells[e.cells.length - 1];
      if (t.childcontainer >= 0) return t.childcontainer
    }
    return this.BlockID
  }

  PostCreateShapeCallback(e, t, a, r) {

    console.log('= S.BaseShape PostCreateShapeCallback e,t,a,r', e, t, a, r)

    if (this.UpdateDimensionLines(t), this.HasIcons()) {
      var i = this.GetTable(!1);
      if (i) if (i.cells[i.cells.length - 1].childcontainer >= 0) return
    } else if

      // (this instanceof ListManager.ShapeContainer)
      // (this instanceof GlobalDataShape.ShapeContainer) {
      (this instanceof Instance.Shape.ShapeContainer) {
      var n = GlobalData.optManager.ContainerIsInCell(this);
      if (n && n.cellindex === n.theTable.cells.length - 1) return void n.obj.AddIcons(e, t)
    }
    this.AddIcons(e, t)
  }

  GetDimensionPoints() {
    //'use strict';
    var e = [],
      t = 0;
    e.push(new Point(this.Frame.x, this.Frame.y)),
      this.Frame.width > 0 &&
      e.push(
        new Point(this.Frame.x + this.Frame.width, this.Frame.y)
      ),
      this.Frame.height > 0 &&
      e.push(
        new Point(this.Frame.x + this.Frame.width, this.Frame.y + this.Frame.height)
      );
    var a = 360 - this.RotationAngle;
    Math.PI;
    for (t = 0; t < e.length; t++) e[t].x -= this.Frame.x,
      e[t].y -= this.Frame.y;
    return e
  }

  GetDimensionLineDeflection(e, t, a, r) {
    var i,
      n,
      o = 0,
      s = [],
      l = new Point(0, 0),
      S = this.GetDimensionPoints();
    for (i = S.length, o = 0; o < i; o++) S[o].x += this.inside.x,
      S[o].y += this.inside.y;
    return l.x = r.knobPoint.x + this.Frame.x - r.adjustForKnob,
      l.y = r.knobPoint.y + this.Frame.y - r.adjustForKnob,
      s.push(S[r.segmentIndex - 1]),
      s.push(S[r.segmentIndex]),
      s.push(new Point(l.x, l.y)),
      s.push(new Point(t, a)),
      Utils3.RotatePointsAboutCenter(this.Frame, - r.ccAngleRadians, s),
      Utils3.RotatePointsAboutCenter(this.Frame, Math.PI, s),
      n = s[3].y - s[2].y,
      r.originalDeflection + n
  }

  DimensionLineDeflectionAdjust(e, t, a, r, i) {

    console.log('== track UpdateDimensionsLines Shape.BaseShape-> DimensionLineDeflectionAdjust')


    var n = this.GetDimensionLineDeflection(e, t, a, i);
    1 === i.segmentIndex ? this.dimensionDeflectionH = n : this.dimensionDeflectionV = n,
      this.UpdateDimensionLines(e),
      this.Dimensions & ConstantData.DimensionFlags.SED_DF_Select &&
      this.HideOrShowSelectOnlyDimensions(!0)
  }

  MaintainProportions(e, t) {
    var a,
      r;
    if (this.ResizeAspectConstrain) {
      if (r = this.Frame.height, a = this.Frame.width, null != e && a > 0) return e * (r / a);
      if (null != t && r > 0) return t * (a / r)
    }
    return null
  }

  UpdateDimensionFromTextObj(e, t) {
    //'use strict';
    GlobalData.objectStore.PreserveBlock(this.BlockID);
    var a,
      r,
      i,
      n = 0,
      o = - 1,
      s = null,
      l = null;
    if (t) var S = t.text,
      c = t.userData;
    else S = e.GetText(),
      c = e.GetUserData();
    if (
      a = c.segment,
      (i = this.GetDimensionValueFromString(S, a)) >= 0 &&
      (o = this.GetDimensionLengthFromValue(i)),
      o < 0
    ) return GlobalData.optManager.AddToDirtyList(this.BlockID),
      void GlobalData.optManager.RenderDirtySVGObjects();
    1 === a ? (
      s = this.MaintainProportions(o, null),
      this.SetSize(o, s, ConstantData.ActionTriggerType.LINELENGTH),
      this.GetDimensionsForDisplay().width === o &&
      (
        this.rwd = i,
        this.rflags = Utils2.SetFlag(this.rflags, ConstantData.FloatingPointDim.SD_FP_Width, !0)
      )
    ) : (
      l = this.MaintainProportions(null, o),
      this.SetSize(l, o, ConstantData.ActionTriggerType.LINELENGTH),
      this.GetDimensionsForDisplay().height === o &&
      (
        this.rht = i,
        this.rflags = Utils2.SetFlag(
          this.rflags,
          ConstantData.FloatingPointDim.SD_FP_Height,
          !0
        )
      )
    );
    for (
      GlobalData.optManager.SetLinkFlag(this.BlockID, ConstantData.LinkFlags.SED_L_MOVE),
      r = this.hooks.length,
      n = 0;
      n < r;
      n++
    ) GlobalData.optManager.SetLinkFlag(this.hooks[n].objid, ConstantData.LinkFlags.SED_L_MOVE);
    GlobalData.optManager.AddToDirtyList(this.BlockID),
      (this.Frame.x < 0 || this.Frame.y < 0) &&
      GlobalData.optManager.ScrollObjectIntoView(this.BlockID, !1),
      GlobalData.optManager.CompleteOperation(null)
  }

  DimensionEditCallback(e, t, a, r) {
    //'use strict';
    var i = r;
    switch (e) {
      case 'edit':
        break;
      case 'keyend':
        if (
          t.keyCode == Resources.Keys.Tab ||
          t.keyCode == Resources.Keys.Enter
        ) return GlobalData.optManager.CloseEdit(),
          !0;
        break;
      case 'charfilter':
        if (
          GlobalData.docHandler.rulerSettings.useInches &&
          GlobalData.docHandler.rulerSettings.units === ConstantData.RulerUnits.SED_Feet
        ) {
          if (- 1 === t.search(/(\d|\.|'|"| )/)) return !1
        } else if (- 1 === t.search(/(\d|\.)/)) return !1;
        break;
      case 'activate':
        var n = a.svgObj.SDGObj.svgObj.trans.rotation;
        if ((n += i.RotationAngle) >= 360 && (n -= 360), 0 !== n) {
          var o = i.GetDimensionPoints(),
            s = [],
            l = Utils1.CalcAngleFromPoints(o[a.userData.segment - 1], o[a.userData.segment]);
          i.GetDimensionTextInfo(
            o[a.userData.segment - 1],
            o[a.userData.segment],
            l,
            a,
            a.userData.segment,
            s,
            [],
            []
          );
          var S = 360 - i.RotationAngle,
            c = 2 * Math.PI * (S / 360);
          Utils3.RotatePointsAboutCenter(i.Frame, c, s);
          var u = {};
          Utils2.GetPolyRect(u, s);
          var p = {},
            d = [];
          p.x = u.x + u.width / 2 - a.lastFmtSize.width / 2,
            p.y = u.y + u.height / 2 - a.lastFmtSize.height / 2,
            d.push(new Point(p.x, p.y)),
            Utils3.RotatePointsAboutCenter(i.Frame, - c, d),
            a.SetPos(d[0].x, d[0].y),
            a.SetRotation(- i.RotationAngle, d[0].x, d[0].y)
        }
        break;
      case 'deactivate':
        if (GlobalData.optManager.bInDimensionEdit = !1, Collab.AllowMessage()) {
          Collab.BeginSecondaryEdit();
          r = Utils1.DeepCopy(a.GetUserData());
          var D = {
            BlockID: i.BlockID,
            text: a.GetText(),
            userData: r
          };
          GlobalData.optManager.GetObjectPtr(i.BlockID, !0),
            Collab.BuildMessage(
              ConstantData.CollabMessages.UpdateDimensionFromTextObj,
              D,
              !1,
              !1
            ),
            i = GlobalData.optManager.GetObjectPtr(i.BlockID, !1)
        }
        i.UpdateDimensionFromTextObj(a)
    }
  }

  NoFlip() {
    return this.hooks.length ? this.hooks[0].hookpt !== ConstantData.HookPts.SED_KAT &&
      !(this.hooks[0].hookpt > ConstantData.HookPts.SED_AK) : !!(this.extraflags & ConstantData.ExtraFlags.SEDE_NoRotate)
  }

  Flip(e) {
    '' == this.SymbolURL &&
      '' === this.ImageURL ||
      (
        e & ConstantData.ExtraFlags.SEDE_FlipHoriz &&
        (
          this.extraflags = Utils2.SetFlag(
            this.extraflags,
            ConstantData.ExtraFlags.SEDE_FlipHoriz,
            0 == (this.extraflags & ConstantData.ExtraFlags.SEDE_FlipHoriz)
          )
        ),
        e & ConstantData.ExtraFlags.SEDE_FlipVert &&
        (
          this.extraflags = Utils2.SetFlag(
            this.extraflags,
            ConstantData.ExtraFlags.SEDE_FlipVert,
            0 == (this.extraflags & ConstantData.ExtraFlags.SEDE_FlipVert)
          )
        )
      )
  }

  NoRotate() {
    var e,
      t,
      a,
      r = GlobalData.optManager.FindAllChildConnectors(this.BlockID);
    if (this.IsSwimlane()) return !0;
    if (
      this.objecttype === ConstantData.ObjectTypes.SD_OBJT_TABLE_WITH_SHAPECONTAINER
    ) return !0;
    if (
      this.hooks.length &&
      (a = GlobalData.optManager.GetObjectPtr(this.hooks[0].objid, !1)) &&
      a.objecttype === ConstantData.ObjectTypes.SD_OBJT_SHAPECONTAINER
    ) return !0;
    if (this.extraflags & ConstantData.ExtraFlags.SEDE_NoRotate) return !0;
    for (t = r.length, e = 0; e < t; e++) if (
      !(a = GlobalData.optManager.GetObjectPtr(r[e], !1))._IsFlowChartConnector() &&
      a.arraylist.hook.length - ConstantData.ConnectorDefines.SEDA_NSkip > 0
    ) return !0;
    return !1
  }

  MaintainPoint(e, t, a, r, i) {
    //'use strict';
    return !1
  }

  AddIcon(e, t, a) {
    if (t) {
      var r = t.GetID(),
        i = this.Frame;
      if (r !== this.BlockID) {
        var n = GlobalData.optManager.GetObjectPtr(r, !1);
        n &&
          (i = n.Frame)
      } else i = this.Frame;
      this.nIcons;
      a.x = i.width - this.iconShapeRightOffset - this.iconSize - this.nIcons * this.iconSize,
        a.y = i.height - this.iconShapeBottomOffset - this.iconSize;
      var o = this.GenericIcon(a);
      return this.nIcons++,
        t.AddElement(o),
        o
    }
  }

  GetActionButtons() {

    console.log(' ========== ListManager.BaseShape.prototype.GetActionButtons');

    var e,
      t = !1,
      a = !1,
      r = !1,
      i = !1,
      n = !1;
    if (
      GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSEDSessionBlockID, !1).moreflags & ConstantData.SessionMoreFlags.SEDSM_NoActionButton
    ) return null;
    if (this.flags & ConstantData.ObjFlags.SEDO_Lock) return null;
    var o = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theTEDSessionBlockID, !1);
    if (
      this.BlockID === o.theActiveTextEditObjectID ||
      this.BlockID === o.theActiveTableObjectID ||
      this.BlockID === o.theActiveOutlineObjectID
    ) return null;
    var s = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theLayersManagerBlockID, !1);
    if (
      s &&
      s.layers[s.activelayer].flags & ConstantData.LayerFlags.SDLF_UseEdges
    ) return null;
    var l = Business.GetSelectionBusinessManager(this.BlockID);
    (
      null == l &&
      (l = GlobalData.gBusinessManager),
      l &&
      !Business.ShapeCannotHaveActionButtons(this)
    ) &&
      (
        e = l.AllowActionButtons(this),
        GlobalData.optManager.SD_GetVisioTextChild(this.BlockID) >= 0 &&
        (e = !1),
        /*GlobalData.optManager.IsJiraIssueShape(this)*/false &&
        (e = !1),
        e &&
        (
          t = e.up,
          a = e.down,
          r = e.left,
          i = e.right,
          e.custom &&
          (n = !0),
          e.table &&
          (n = !0)
        )
      );
    return t ||
      a ||
      r ||
      i ||
      n ? {
      left: r,
      right: i,
      up: t,
      down: a,
      custom: n
    }
      : null
  }

  SetRolloverActions(e, t, a) {
    // debuggesr
    console.log('ListManager.BaseShape.prototype.SetRolloverActions e, t, a', e, t, a);

    var r = GlobalData.optManager.GetObjectPtr(this.BlockID, !1);
    // if (r && r instanceof ListManager.BaseDrawingObject) {
    // Doulbe === TODO
    if (r && r instanceof BaseDrawingObject) {
      var i = ConstantData.ObjectTypes;
      switch (this.objecttype) {
        case i.SD_OBJT_SWIMLANE_ROWS:
        case i.SD_OBJT_SWIMLANE_COLS:
        case i.SD_OBJT_SWIMLANE_GRID:
        case i.SD_OBJT_FRAME_CONTAINER:
          if (a) {
            var n = GlobalData.optManager.svgObjectLayer.FindElementByDOMElement(a.currentTarget).GetTargetForEvent(a);
            n.GetID() === ConstantData.SVGElementClass.SLOP &&
              // ListManager.BaseDrawingObject.prototype.SetRolloverActions.apply(this, [e,n]);
              // Double === TODO
              super.SetRolloverActions(
                e,
                n
              )
          }
          return void this.SetCursors();
        case i.SD_OBJT_SHAPECONTAINER:
          var o = GlobalData.optManager.ContainerIsInCell(this);
          if (o) return t = GlobalData.optManager.svgObjectLayer.GetElementByID(o.obj.BlockID),
            void o.obj.SetRolloverActions(e, t)
      }
      if (
        - 1 != GlobalData.optManager.curHiliteShape &&
        GlobalData.optManager.curHiliteShape != this.BlockID
      ) {
        var s = GlobalData.optManager.GetObjectPtr(GlobalData.optManager.curHiliteShape, !1);
        s &&
          (s.SetRuntimeEffects(!1), s.ClearCursors())
      }
      var l = 'actionArrow' + this.BlockID;
      this.actionArrowHideTimerID >= 0 &&
        GlobalData.optManager.ClearActionArrowTimer(this.BlockID),
        GlobalData.optManager.RemoveActionArrows(this.BlockID, !0);
      var S = this.GetActionButtons();
      if (S) {
        var c = !(S.up || S.left || S.down || S.right || S.custom);
        if (this.flags & ConstantData.ObjFlags.SEDO_TextOnly || c)
          //  ListManager.BaseDrawingObject.prototype.SetRolloverActions.apply(this, [e,t]);
          super.SetRolloverActions(
            e,
            t
          );
        else {
          var u = this.BlockID,
            p = this;
          GlobalData.optManager.isMobilePlatform ? this.SetRuntimeEffects(!1) : this.SetRuntimeEffects(!0),
            this.SetCursors(),
            GlobalData.optManager.curHiliteShape = this.BlockID;
          var d = [],
            D = e.docInfo.docToScreenScale;
          e.docInfo.docScale <= 0.5 &&
            (D *= 2);
          var g = ConstantData.Defines.baseArrowSlop / D,
            h = ConstantData.Defines.connectorArrowSlop / D,
            m = 0;
          - 1 !== GlobalData.optManager.GetObjectPtr(GlobalData.optManager.theSelectedListBlockID, !1).indexOf(u) &&
            (m = ConstantData.Defines.SED_KnobSize / 2);
          var C = 0,
            y = 0;
          if (
            - 1 !== GlobalData.optManager.theActionStoredObjectID ||
            0 !== GlobalData.optManager.theDragBBoxList.length ||
            GlobalData.optManager.theRubberBand
          ) t.svgObj.mouseout(
            (
              function () {
                p.SetRuntimeEffects(!1),
                  p.ClearCursors(),
                  GlobalData.optManager.curHiliteShape = - 1
              }
            )
          );
          else {
            for (
              var f = g,
              L = g,
              I = g,
              T = g,
              b = null,
              M = {
                lindex: - 1,
                id: - 1,
                hookpt: 0
              };
              GlobalData.optManager.FindChildArrayByIndex(this.BlockID, M) > 0;
            ) {
              var P = (
                (b = GlobalData.optManager.GetObjectPtr(M.id, !1)).arraylist.styleflags & ConstantData.SEDA_Styles.SEDA_CoManager
              ) > 0,
                R = b._IsChildOfAssistant(),
                A = b._IsFlowChartConnector(),
                _ = b.arraylist.hook.length - ConstantData.ConnectorDefines.SEDA_NSkip;
              if (_ < 0 && (_ = 0), 0 !== _ && !A && !P && !R && M.hookpt) switch (M.hookpt) {
                case ConstantData.HookPts.SED_LL:
                  I = h,
                    C += h - g;
                  break;
                case ConstantData.HookPts.SED_LR:
                  L = h,
                    C -= h - g;
                  break;
                case ConstantData.HookPts.SED_LT:
                  T = h,
                    y += h - g;
                  break;
                case ConstantData.HookPts.SED_LB:
                  f = h,
                    y -= h - g
              }
            }
            var E = e.CreateShape(ConstantData.CreateShapeType.GROUP);
            E.SetID(l),
              E.SetUserData(u);
            var w,
              F = GlobalData.optManager.SD_GetVisioTextParent(this.BlockID);
            w = GlobalData.optManager.GetObjectPtr(F, !1);
            var v = $.extend(!0, {
            }, w.Frame),
              G = ConstantData.Defines.ActionArrowSizeV / D,
              N = ConstantData.Defines.ActionArrowSizeH / D;
            v.x -= G + L + m,
              v.y -= G + f + m,
              v.width += 2 * G + (L + I) + 2 * m,
              v.height += 2 * G + (f + T) + 2 * m;
            var k = v.width / 2 - C / 2,
              U = v.height / 2 - y / 2,
              J = null;
            if (S.custom) {
              var x,
                O,
                B,
                H = gBusinessController.CreateCustomActionButtons(e, this, 0, this.BlockID);
              if (H) for (v = $.extend(!0, {
              }, this.Frame), O = H.length, x = 0; x < O; x++) (B = H[x]).SetID(ConstantData.ActionArrow.CUSTOM + x),
                B.SetUserData(u),
                E.AddElement(B),
                d.push(B.DOMElement())
            }
            if (S.left) {
              var V = gBusinessController.CreateActionButton(e, L, U, this.BlockID);
              null == V &&
                (
                  (
                    J = (V = e.CreateShape(ConstantData.CreateShapeType.PATH)).PathCreator()
                  ).BeginPath(),
                  J.MoveTo(0, U),
                  J.LineTo(G, U - N / 2),
                  J.LineTo(G, U + N / 2),
                  J.LineTo(0, U),
                  J.ClosePath(),
                  J.Apply(),
                  // V.SetFillColor('#FFD64A'),
                  V.SetFillColor('#FF0000'),
                  V.SetStrokeWidth(0),
                  V.SetCursor(Element.CursorType.ADD_LEFT)
                ),
                V.SetID(ConstantData.ActionArrow.LEFT),
                V.SetUserData(u),
                E.AddElement(V),
                d.push(V.DOMElement())
            }
            if (S.up) {
              var j = gBusinessController.CreateActionButton(e, k, f, this.BlockID);
              null == j &&
                (
                  (
                    J = (j = e.CreateShape(ConstantData.CreateShapeType.PATH)).PathCreator()
                  ).BeginPath(),
                  J.MoveTo(k, 0),
                  J.LineTo(k - N / 2, G),
                  J.LineTo(k + N / 2, G),
                  J.LineTo(k, 0),
                  J.ClosePath(),
                  J.Apply(),
                  j.SetFillColor('#FFD64A'),
                  j.SetStrokeWidth(0),
                  j.SetCursor(Element.CursorType.ADD_UP)
                ),
                j.SetID(ConstantData.ActionArrow.UP),
                j.SetUserData(u),
                E.AddElement(j),
                d.push(j.DOMElement())
            }
            if (S.right) {
              var z = gBusinessController.CreateActionButton(e, v.width - L, U, this.BlockID);
              null == z &&
                (
                  (
                    J = (z = e.CreateShape(ConstantData.CreateShapeType.PATH)).PathCreator()
                  ).BeginPath(),
                  J.MoveTo(v.width, U),
                  J.LineTo(v.width - G, U - N / 2),
                  J.LineTo(v.width - G, U + N / 2),
                  J.LineTo(v.width, U),
                  J.ClosePath(),
                  J.Apply(),
                  z.SetFillColor('#FFD64A'),
                  z.SetStrokeWidth(0),
                  z.SetCursor(Element.CursorType.ADD_RIGHT)
                ),
                z.SetID(ConstantData.ActionArrow.RIGHT),
                z.SetUserData(u),
                E.AddElement(z),
                d.push(z.DOMElement())
            }
            if (S.down) {
              var W = gBusinessController.CreateActionButton(e, k, v.height - f, this.BlockID);
              null == W &&
                (
                  (
                    J = (W = e.CreateShape(ConstantData.CreateShapeType.PATH)).PathCreator()
                  ).BeginPath(),
                  J.MoveTo(k, v.height),
                  J.LineTo(k - N / 2, v.height - G),
                  J.LineTo(k + N / 2, v.height - G),
                  J.LineTo(k, v.height),
                  J.ClosePath(),
                  J.Apply(),
                  W.SetFillColor('#FFD64A'),
                  W.SetStrokeWidth(0),
                  W.SetCursor(Element.CursorType.ADD_DOWN)
                ),
                W.SetID(ConstantData.ActionArrow.DOWN),
                W.SetUserData(u),
                E.AddElement(W),
                d.push(W.DOMElement())
            }
            E.SetSize(v.width, v.height),
              E.SetPos(v.x, v.y),
              gBusinessController.RotateActionButtons() &&
              E.SetRotation(this.RotationAngle),
              GlobalData.optManager.svgOverlayLayer.AddElement(E);
            var q,
              K = function (e) {
                Utils2.StopPropagationAndDefaults(e);
                var t = GlobalData.optManager.svgOverlayLayer.FindElementByDOMElement(e.currentTarget);
                if (t) {
                  var a = t.GetTargetForEvent(e);
                  if (a) var r = a.GetID(),
                    i = t.GetUserData()
                }
                var n = GlobalData.optManager.GetObjectPtr(i, !1);
                n &&
                  // n instanceof ListManager.BaseDrawingObject &&
                  n instanceof BaseDrawingObject &&
                  null != r &&
                  null != i &&
                  gBusinessController.ActionClick(e, i, r, null)
              },
              X = function (e) {
                if (
                  GlobalData.optManager.IsWheelClick(e) ||
                  ConstantData.DocumentContext.SpacebarDown
                ) return Evt_WorkAreaHammerDragStart(e),
                  Utils2.StopPropagationAndDefaults(e),
                  !1;
                var t;
                ConstantData.DocumentContext.HTMLFocusControl &&
                  ConstantData.DocumentContext.HTMLFocusControl.blur &&
                  ConstantData.DocumentContext.HTMLFocusControl.blur(),
                  SDUI.Commands.MainController.Dropdowns.HideAllDropdowns();
                var a = GlobalData.optManager.svgOverlayLayer.FindElementByDOMElement(e.currentTarget);
                if (a) {
                  var r = a.GetTargetForEvent(e);
                  if (r) {
                    GlobalData.optManager.isMobilePlatform &&
                      (
                        t = GlobalData.optManager.svgOverlayLayer.GetElementByID('actionArrow' + this.BlockID)
                      );
                    var i = r.GetID(),
                      n = a.GetUserData(),
                      o = GlobalData.optManager.GetObjectPtr(n, !1);
                    // if (!(o && o instanceof ListManager.BaseDrawingObject)) return !1;
                    if (!(o && o instanceof BaseDrawingObject)) return !1;
                    switch (
                    gBusinessController.StopActionEventPropagation(n) ||
                    (
                      Utils2.StopPropagationAndDefaults(e),
                      GlobalData.optManager.SelectObjects([n], !1, !1)
                    ),
                    i
                    ) {
                      case ConstantData.ActionArrow.UP:
                        gBusinessController.AddAbove(e, n);
                        break;
                      case ConstantData.ActionArrow.LEFT:
                        gBusinessController.AddLeft(e, n);
                        break;
                      case ConstantData.ActionArrow.DOWN:
                        gBusinessController.AddBelow(e, n);
                        break;
                      case ConstantData.ActionArrow.RIGHT:
                        gBusinessController.AddRight(e, n);
                        break;
                      default:
                        i >= ConstantData.ActionArrow.CUSTOM &&
                          gBusinessController.AddCustom(e, n, i - ConstantData.ActionArrow.CUSTOM)
                    }
                    return GlobalData.optManager.isMobilePlatform &&
                      (
                        GlobalData.optManager.svgOverlayLayer.AddElement(t),
                        setTimeout(
                          (
                            function () {
                              GlobalData.optManager.RemoveActionArrows(u);
                              var e = GlobalData.optManager.ZList(),
                                t = e.length;
                              if (t) {
                                GlobalData.optManager.SelectObjects([e[t - 1]], !1, !1);
                                var a = GlobalData.optManager.GetObjectPtr(e[t - 1], !1),
                                  r = GlobalData.optManager.svgObjectLayer.GetElementByID(a.BlockID);
                                a.SetRolloverActions(GlobalData.optManager.svgDoc, r)
                              }
                            }
                          ),
                          0
                        )
                      ),
                      !1
                  }
                }
              },
              Y = function (e) {
                GlobalData.optManager.SetActionArrowTimer(u)
              },
              Z = function (e) {
                GlobalData.optManager.ClearActionArrowTimer(u)
              },
              Q = null,
              ee = null;
            for (q = 0; q < d.length; ++q) Q = d[q],

              // Double ===
              (ee = Hammer(Q)).on('dragstart', X),
              ee.on('click', K),
              Q.onmouseout = Y,
              Q.onmouseover = Z;
            t.svgObj.mouseout(
              (
                function () {
                  GlobalData.optManager.SetActionArrowTimer(u),
                    p.SetRuntimeEffects(!1),
                    p.ClearCursors(),
                    GlobalData.optManager.curHiliteShape = - 1
                }
              )
            )
          }
        }
      } else
        // ListManager.BaseDrawingObject.prototype.SetRolloverActions.apply(this, [e,t]);
        // Double === TODO
        super.SetRolloverActions(
          e,
          t
        )
    }
  }

  UseEdges(e, t, a, r, i, n) {
    var o,
      s = 0,
      l = 0,
      S = 0,
      c = 0,
      u = 0,
      p = 0,
      d = !1;
    if (
      i.x !== n.x &&
      (
        e &&
          a ? (s = n.x - i.x, d = !0) : (
          o = this.Frame.x + this.Frame.width / 2,
          Math.abs(o - i.x / 2) < 100 ? (u = (n.x - i.x) / 2, d = !0) : this.Frame.x > i.x / 2 &&
            (u = n.x - i.x, d = !0)
        )
      ),
      i.y !== n.y &&
      (
        t &&
          r ? (l = n.y - i.y, d = !0) : (
          o = this.Frame.y + this.Frame.height / 2,
          Math.abs(o - i.y / 2) < 100 ? (p = (n.y - i.y) / 2, d = !0) : this.Frame.y > i.y / 2 &&
            (p = n.y - i.y, d = !0)
        )
      ),
      d
    ) {
      GlobalData.optManager.GetObjectPtr(this.BlockID, !0),
        (u || p) &&
        this.OffsetShape(u, p);
      r = this.Frame.y + this.Frame.height;
      if (s || l) if (
        s &&
        (S = this.Frame.width + s),
        l &&
        (c = this.Frame.height + l),
        this.SetSize(S, c, ConstantData.ActionTriggerType.LINELENGTH),
        this.objecttype === ConstantData.ObjectTypes.SD_OBJT_ANNOTATION
      ) p = r - (this.Frame.y + this.Frame.height),
        ((u = 0) || p) &&
        this.OffsetShape(u, p);
      return GlobalData.optManager.AddToDirtyList(this.BlockID),
        !0
    }
    return !1
  }

  ConvertToVisio(e, t) {
    var a = [
      this.BlockID
    ];
    if (
      this.moreflags & ConstantData.ObjMoreFlags.SED_MF_VisioText
    ) return a = [];
    var r = GlobalData.optManager.SD_GetVisioTextChild(this.BlockID),
      i = this.GetTable(!1),
      n = !1;
    if (i) {
      var o;
      if (n = !0, t) if ((o = t[this.BlockID]) && o.cellInfo && 0 != o.cellInfo.length) for (var s = o.cellInfo.length, l = 0; l < s; l++) {
        var S = o.cellInfo[l];
        if (S) {
          var c,
            u = S.cellIndex,
            p = S.imageURL,
            d = S.blobBytes;
          if (p && d) (c = i.cells[u]).ImageURL = p,
            GlobalData.optManager.Table_CellSetBlobBytes(c, d, FileParser.Image_Dir.dir_png),
            c.SVGDim = {}
        }
      }
      a = GlobalData.optManager.Table_ConvertToVisio(this, i),
        e &&
        (e[this.BlockID] = a[0])
    } else if (this.NativeID >= 0) {
      if (
        a = GlobalData.optManager.UngroupNative(this.BlockID, !1, !1),
        e &&
        (e[this.BlockID] = a[0]),
        a.length
      ) {
        var D = GlobalData.optManager.GetObjectPtr(a[0]);
        D &&
          (a = D.ConvertToVisio())
      }
    } else {
      if (r >= 0) {
        var g = GlobalData.optManager.GetObjectPtr(r, !1);
        g &&
          (
            this.DataID = g.DataID,
            this.trect = Utils1.DeepCopy(g.trect),
            this.TextAlign = g.TextAlign
          )
      } else this.DataID >= 0 &&
        this.TextFlags & ConstantData.TextFlags.SED_TF_AttachB &&
        (this.trect.y += this.Frame.height);
      if (
        GlobalData.optManager.ShapeToPolyLine(this.BlockID, !1, !0),
        GlobalData.optManager.PolyLineToShape(this.BlockID),
        r < 0 &&
        this.DataID >= 0 &&
        this.TextFlags & ConstantData.TextFlags.SED_TF_AttachB
      ) {
        var h = GlobalData.optManager.svgObjectLayer.GetElementByID(this.BlockID);
        if (h) {
          var m = h.GetElementByID(ConstantData.SVGElementClass.TEXT).GetTextMinDimensions();
          this.trect.y += this.Frame.height,
            this.trect.height = m.height
        }
      }
    }
    if (n) return a;
    if (!t) return a;
    if (!(o = t[this.BlockID])) return a;
    if (
      this.ImageURL &&
      - 1 != this.ImageURL.indexOf('/cmsstorage/symbols/svg')
    ) {
      var C = GlobalData.objectStore.PreserveBlock(this.BlockID);
      if (null == C) return a;
      var y = o.imageURL,
        f = o.blobBytes;
      y ||
        (f = null),
        f ||
        (y = null);
      var L = new ListManager.Rect;
      return L.Frame = Utils1.DeepCopy(this.Frame),
        L.r = Utils1.DeepCopy(this.r),
        L.trect = Utils1.DeepCopy(this.trect),
        L.trect.y += 10,
        L.inside = Utils1.DeepCopy(this.inside),
        L.RotationAngle = this.RotationAngle,
        L.flags = this.flags,
        L.extraflags = this.extraflags,
        L.StyleRecord = Utils1.DeepCopy(this.StyleRecord),
        L.DataID = this.DataID,
        L.TextFlags = this.TextFlags,
        y &&
        f &&
        (
          L.ImageURL = y,
          L.SetBlobBytes(f, FileParser.Image_Dir.dir_png)
        ),
        L.just = this.just,
        L.vjust = this.vjust,
        L.TextDirection = this.TextDirection,
        L.tstyleindex = this.tstyleindex,
        C.Data = L,
        a
    }
    y = o.imageURL,
      f = o.blobBytes;
    return y ||
      (f = null),
      f ||
      (y = null),
      y &&
      f &&
      (
        this.ImageURL = y,
        this.SetBlobBytes(f, FileParser.Image_Dir.dir_png),
        this.SVGDim = {}
      ),
      a
  }

  RasterizeSVGShapeForVisio(e) {
    var t = 0,
      a = function (e, t, a, r) {
        var i = new XMLHttpRequest;
        i.responseType = 'text',
          i.onload = function () {
            var e = i.response,
              n = (new DOMParser).parseFromString(e, 'text/html'),
              o = n.querySelector('svg').getAttribute('width'),
              s = n.querySelector('svg').getAttribute('height'),
              l = o &&
                - 1 != o.indexOf('%') ||
                s &&
                - 1 != s.indexOf('%');
            if (!o || !s || l) {
              var S = n.querySelector('svg'),
                c = S.getAttribute('viewBox');
              if (c) {
                var u = c.split(/\s+|,/);
                o = parseFloat(u[2]),
                  s = parseFloat(u[3]),
                  S.setAttribute('width', o),
                  S.setAttribute('height', s),
                  e = S.parentElement.innerHTML
              }
            }
            var p = new Image;
            p.onload = function () {
              var e = document.createElement('canvas'),
                i = t,
                n = a;
              e.width = i,
                e.height = n;
              var o = e.getContext('2d');
              o.fillStyle = '#fff',
                o.globalAlpha = 0,
                o.fillRect(0, 0, i, n),
                o.globalAlpha = 1,
                o.drawImage(p, 0, 0, i, n);
              e.toBlob(
                (
                  function (e) {
                    var t = URL.createObjectURL(e),
                      a = new FileReader;
                    a.onload = function (e) {
                      var a = new Uint8Array(e.target.result);
                      r(t, a)
                    },
                      a.readAsArrayBuffer(e)
                  }
                ),
                'image/png',
                0.8
              )
            },
              p.onerror = function (e) {
                r(null, null)
              },
              p.src = 'data:image/svg+xml,' + encodeURIComponent(e)
          },
          i.onerror = function () {
            r(null, null)
          },
          i.open('GET', e),
          i.send()
      },
      r = - 1 != this.TableID,
      i = this.BlockID;
    if (r) {
      var n,
        o,
        s,
        l = [],
        S = (
          t = 0,
          i = this.BlockID,
          GlobalData.optManager.GetObjectPtr(this.TableID, !1)
        );
      n = S.cells.length;
      var c = [],
        u = 0;
      for (o = 0; o < n; o++) if ((s = S.cells[o]).BlobBytesID >= 0) GlobalData.optManager.IsBlobURL(s.ImageURL) &&
        s.SVGDim &&
        s.SVGDim.width &&
        s.SVGDim.height &&
        (
          u++,
          c.push({
            cellIndex: o,
            imageURL: s.ImageURL,
            blobBytesID: s.BlobBytesID,
            width: s.frame.width,
            height: s.frame.height
          })
        );
      else if (s.Image && s.Image.iconid) {
        var p = s.Image.iconid;
        if (p >= ConstantData.Defines.SVGIconIndex) {
          g = Constants.FilePath_RSRC + p + '.icon.svg';
          g = Constants.URL_Cloud.replace('.com/', '.com') + g,
            u++,
            c.push({
              cellIndex: o,
              imageURL: g,
              blobBytesID: s.BlobBytesID,
              width: 18,
              height: 18
            })
        }
      }
      if (0 == u) return void e(i, null, null, null);
      g = c[t].imageURL,
        h = c[t].width,
        m = c[t].height;
      a(
        g,
        h,
        m,
        (
          function r(n, o) {
            if (
              l.push({
                cellIndex: c[t].cellIndex,
                imageURL: n,
                blobBytes: o
              }),
              ++t == u
            ) e(i, null, null, l);
            else {
              var s = c[t].imageURL,
                S = c[t].width,
                p = c[t].height;
              a(s, S, p, r)
            }
          }
        )
      )
    } else {
      var d = !1,
        D = this.ImageURL &&
          - 1 != this.ImageURL.indexOf('/cmsstorage/symbols/svg');
      if (
        (D || this.ImageURL && this.SVGDim.width && this.SVGDim.height) &&
        (d = !0),
        d
      ) {
        var g = this.ImageURL;
        D &&
          (g = Constants.URL_Cloud.replace('.com/', '.com') + g);
        var h = this.Frame.width,
          m = this.Frame.height;
        a(g, h, m, (function (t, a) {
          e(i, t, a, null)
        }))
      } else e(i, null, null, null)
    }
  }

  Pr_UpdateExtra(e) {
    var t = this.BlockID,
      a = GlobalData.optManager.GetObjectPtr(this.hooks[0].objid, !0);
    // if (a && a instanceof ListManager.ShapeContainer) {
    // if (a && a instanceof GlobalDataShape.ShapeContainer) {
    if (a && a instanceof Instance.Shape.ShapeContainer) {
      var r,
        i = a.ContainerList;
      if (!(i.flags & ConstantData.ContainerListFlags.Sparse)) for (len = i.List.length, r = 0; r < len; r++) if (i.List[r].id === t) return i.List[r].extra += e,
        i.List[r].extra < 0 &&
        (i.List[r].extra = 0),
        GlobalData.optManager.SetLinkFlag(a.BlockID, ConstantData.LinkFlags.SED_L_MOVE),
        void (
          a.flags = Utils2.SetFlag(a.flags, ConstantData.ObjFlags.SEDO_Obj1, !0)
        )
    }
  }

  Pr_GetAdjustShapeList() {
    var e,
      t,
      a,
      r,
      i = [],
      n = [],
      o = [],
      s = function (e) {
        (r = GlobalData.optManager.GetObjectPtr(e, !1)) &&
          (a = r.GetSVGFrame(), o.push(a), i.push(e), n.push(e))
      };
    if (this.hooks.length) {
      var l = this.BlockID,
        S = 0,
        c = !1,
        u = GlobalData.optManager.GetObjectPtr(this.hooks[0].objid, !1);
      // if (u && u instanceof ListManager.ShapeContainer) {
      // if (u && u instanceof GlobalDataShape.ShapeContainer) {
      if (u && u instanceof Instance.Shape.ShapeContainer) {
        var p = u.ContainerList;
        if (!(p.flags & ConstantData.ContainerListFlags.Sparse)) {
          for (t = p.List.length, e = 0; e < t; e++) p.List[e].id === l ? (S = p.List[e].extra, s(l), c = !0) : c &&
            s(p.List[e].id);
          return {
            list: i,
            svglist: n,
            framelist: o,
            framelist: o,
            oldextra: S,
            arrangement: p.Arrangement
          }
        }
      }
    }
    return null
  }

  OnDisconnect(e, t, a, r) {
    if (
      // t instanceof ListManager.ShapeContainer &&
      // t instanceof GlobalDataShape.ShapeContainer &&
      t instanceof Instance.Shape.ShapeContainer &&
      null != this.zListIndex &&
      this.zListIndex >= 0
    ) {
      var i = GlobalData.optManager.svgObjectLayer.GetElementByID(e);
      i &&
        (
          GlobalData.optManager.svgObjectLayer.RemoveElement(i),
          GlobalData.optManager.svgObjectLayer.AddElement(i, this.zListIndex),
          this.zListIndex = - 1
        )
    }
  }

}

export default BaseShape
