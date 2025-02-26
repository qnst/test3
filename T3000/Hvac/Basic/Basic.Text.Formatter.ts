

import HvacSVG from "../Helper/SVG.t2"
import $ from 'jquery';
import Utils1 from "../Helper/Utils1"
import Utils2 from "../Helper/Utils2"
import Utils3 from "../Helper/Utils3"
import Spell from './Basic.Text.Spell'
import ConstantData from "../Data/ConstantData"
import DefaultFmtText from '../Model/DefaultFmtText'
import DefaultRuntimeText from '../Model/DefaultRuntimeText'
import DefaultStyle from "../Model/DefaultStyle";
import Utils4 from "../Helper/Utils4";
import Instance from "../Data/Instance/Instance";

class Formatter {

  public parent: any;
  public limits: any;
  public fmtText: any;
  public rtData: any;
  public renderedLines: any;
  public wordList: any;
  public renderingEnabled: boolean;
  public deferredRenderNeeded: boolean;
  public contentVersion: number;
  public spellCheckEnabled: boolean;
  public dataNameEnabled: boolean;
  public renderedDataFields: any;

  constructor(parent) {
    this.parent = parent;
    this.limits = { minWidth: 0, maxWidth: 0 };
    this.fmtText = new DefaultFmtText();
    this.rtData = new DefaultRuntimeText();
    this.renderedLines = [];
    this.wordList = null;
    this.renderingEnabled = !0;
    this.deferredRenderNeeded = !1;
    this.contentVersion = 0;
    this.spellCheckEnabled = !1;
    this.dataNameEnabled = !1;
  }

  SetLimits(limits) {
    console.log("B.Text.Formatter: setLimits input:", limits);

    this.limits.minWidth = limits.minWidth !== undefined ? limits.minWidth : this.limits.minWidth;
    this.limits.maxWidth = limits.maxWidth !== undefined ? limits.maxWidth : this.limits.maxWidth;

    this.fmtText = this.CalcFromRuntime(this.rtData, this.limits);

    console.log("B.Text.Formatter: setLimits output:", this.fmtText);
  }

  SetRenderingEnabled(isEnabled: boolean) {
    console.log("B.Text.Formatter: setRenderingEnabled input:", isEnabled);

    let styleRunsCopy = [];
    this.renderingEnabled = isEnabled;

    if (isEnabled && this.deferredRenderNeeded) {
      for (let i = 0; i < this.rtData.styleRuns.length; i++) {
        styleRunsCopy.push({
          pStyle: Utils1.CopyObj(this.rtData.styleRuns[i].pStyle)
        });
      }
      this.BuildRuntimeRuns(this.rtData, styleRunsCopy);
      this.fmtText = this.CalcFromRuntime(this.rtData, this.limits);
      this.UpdateSpellCheckFormatting();
      this.deferredRenderNeeded = false;
    }

    console.log("B.Text.Formatter: setRenderingEnabled output:", this.renderingEnabled);
  }

  SetText(text: string, format?: any, start?: number, length?: number, skipCallback?: boolean) {
    console.log("B.Text.Formatter: SetText input:", { text, format, start, length, skipCallback });

    let newText = '';
    let paragraphInfo = this.DefaultPStyle();
    let paragraphStyles = [];
    let formatId = -1;
    let endFormatId = -1;
    let isNewFormat = false;
    let preText = '';
    let postText = '';

    text = String(text).replace(/(\r\n|\r|\u2028|\u2029)/g, '\n').replace(/([\u0000-\u0008]|[\u000B-\u001F])/g, '');

    if (start == null) {
      start = 0;
    } else if (start < 0 || start > this.rtData.text.length) {
      start = this.rtData.text.length;
    }

    if (length == null || length > this.rtData.text.length - start) {
      length = this.rtData.text.length - start;
    }

    if (typeof format === 'number') {
      formatId = format;
    } else if (!this.rtData.text.length || start >= this.rtData.text.length - 1) {
      formatId = Math.max(this.rtData.styles.length - 1, 0);
      isNewFormat = true;
    } else if (length > 0) {
      formatId = this.GetFormatAtOffset(start).id;
      endFormatId = this.GetFormatAtOffset(start + length).id;
    } else {
      formatId = this.GetFormatAtOffset(start - 1).id;
      endFormatId = this.GetFormatAtOffset(start).id;
    }

    if (start === 0) {
      isNewFormat = true;
    }

    if (endFormatId < 0) {
      endFormatId = formatId;
    }

    const paragraphCount = this.GetTextParagraphCount(text);
    const paragraphIndex = this.GetParagraphAtOffset(start);

    if (paragraphIndex >= 0) {
      paragraphInfo = this.rtData.styleRuns[paragraphIndex].pStyle;
    }

    for (let i = 0; i < paragraphCount; i++) {
      paragraphStyles.push({ pStyle: Utils1.CopyObj(paragraphInfo) });
    }

    paragraphStyles = this.MergeParagraphInfo(paragraphStyles, start, length);

    if (start === this.rtData.text.length) {
      newText = this.rtData.text + text;
    } else {
      if (start > 0) {
        preText = this.rtData.text.slice(0, start);
      }
      if (start + length < this.rtData.text.length) {
        postText = this.rtData.text.slice(start + length);
      }
      newText = preText + text + postText;
    }

    if (skipCallback || this.parent.CallEditCallback('onbeforeinsert', newText) !== false) {
      this.rtData.text = newText;
      this.contentVersion++;

      if (!this.rtData.styles.length) {
        this.rtData.styles = [new DefaultStyle()];
      }

      let startFormat = this.GetFormatByID(formatId);
      let endFormat = this.GetFormatByID(endFormatId);

      if (startFormat.hyperlink !== endFormat.hyperlink) {
        isNewFormat = true;
      }

      if (startFormat.dataField || isNewFormat) {
        startFormat = Utils1.CopyObj(startFormat);
        startFormat.dataField = null;
        if (isNewFormat) {
          startFormat.hyperlink = -1;
        }
        formatId = this.FindAddStyle(startFormat);
      }

      if (text.length) {
        const newCharStyles = new Array(text.length).fill(formatId);
        this.rtData.charStyles.splice(start, length, ...newCharStyles);

        if (format && typeof format === 'object') {
          this.SetFormat(format, start, text.length);
        }
      } else if (length) {
        this.rtData.charStyles.splice(start, length);

        if (!this.rtData.text.length) {
          if (format && typeof format === 'object') {
            format.hyperlink = -1;
            format.dataField = null;
            formatId = this.SetFormat(format, 0, 0);
          }
          const defaultFormat = this.GetFormatByID(formatId);
          this.rtData.styles = [Utils1.CopyObj(defaultFormat)];
        }
      }

      const wasRenderingEnabled = this.renderingEnabled;
      this.SetRenderingEnabled(false);
      this.BuildRuntimeRuns(this.rtData, paragraphStyles);
      this.AdjustSpellCheck(text);
      if (wasRenderingEnabled) {
        this.SetRenderingEnabled(true);
      }
    }

    console.log("B.Text.Formatter: SetText output:", this.rtData.text);
  }

  GetText(startIndex: number, length: number) {
    console.log("B.Text.Formatter: GetText input:", { startIndex, length });

    let result = '';
    if (this.rtData.text.length) {
      if (startIndex == null) {
        startIndex = 0;
      } else if (startIndex >= this.rtData.text.length) {
        startIndex = this.rtData.text.length - 1;
      }

      if (!length || startIndex + length > this.rtData.text.length) {
        length = this.rtData.text.length - startIndex;
      }

      result = this.rtData.text.substr(startIndex, length);
    }

    console.log("B.Text.Formatter: GetText output:", result);
    return result;
  }

  SetRuntimeText(newTextData, startIndex, length, skipCallback) {
    console.log("B.Text.Formatter: SetRuntimeText input:", { newTextData, startIndex, length, skipCallback });

    let newText = '';
    let preText = '';
    let postText = '';
    let hyperlinkIndices = [];
    let mergedParagraphInfo = [];

    if (newTextData.styles && newTextData.styles.length) {
      if (startIndex == null) {
        startIndex = 0;
      } else if (startIndex < 0 || startIndex > this.rtData.text.length) {
        startIndex = this.rtData.text.length;
      }

      if (length == null || length > this.rtData.text.length - startIndex) {
        length = this.rtData.text.length - startIndex;
      }

      const isFullReplace = startIndex === 0 && length === this.rtData.text.length;

      if (startIndex === this.rtData.text.length) {
        newText = this.rtData.text + newTextData.text;
      } else {
        if (startIndex > 0) {
          preText = this.rtData.text.slice(0, startIndex);
        }
        if (startIndex + length < this.rtData.text.length) {
          postText = this.rtData.text.slice(startIndex + length);
        }
        newText = preText + newTextData.text + postText;
      }

      if (this.parent.CallEditCallback('onbeforeinsert', newText) !== false) {
        this.rtData.text = newText;
        this.contentVersion++;

        mergedParagraphInfo = this.MergeParagraphInfo(newTextData.paraInfo, startIndex, length);

        newTextData.hyperlinks.forEach((hyperlink) => {
          this.rtData.hyperlinks.push(String(hyperlink));
          hyperlinkIndices.push(this.rtData.hyperlinks.length - 1);
        });

        newTextData.styles.forEach((style) => {
          if (style.hyperlink >= 0 && style.hyperlink < hyperlinkIndices.length) {
            style.hyperlink = hyperlinkIndices[style.hyperlink];
          } else {
            style.hyperlink = -1;
          }
        });

        if (newTextData.text.length) {
          let charStylesCopy = Utils1.CopyObj(newTextData.charStyles);
          let styleMap = new Array(newTextData.styles.length);
          let charStylesLength = charStylesCopy.length;

          for (let i = 0; i < charStylesLength; i++) {
            let styleIndex = charStylesCopy[i];
            let mappedStyleIndex = styleMap[styleIndex];

            if (mappedStyleIndex === undefined) {
              if (styleIndex < newTextData.styles.length) {
                mappedStyleIndex = this.FindAddStyle(newTextData.styles[styleIndex]);
                styleMap[styleIndex] = mappedStyleIndex;
              } else {
                mappedStyleIndex = 0;
                styleMap[styleIndex] = mappedStyleIndex;
              }
            }

            charStylesCopy[i] = mappedStyleIndex;
          }

          this.rtData.charStyles.splice(startIndex, length, ...charStylesCopy);
        } else if (length) {
          this.rtData.charStyles.splice(startIndex, length);
        } else {
          this.rtData.styles[0] = $.extend(true, {}, newTextData.styles[0]);
        }

        if (!skipCallback) {
          this.parent.vAlign = newTextData.vAlign;
        }

        if (!this.parent.internalID && newTextData.internalID) {
          this.parent.internalID = newTextData.internalID;
        }

        if (isFullReplace) {
          this.contentVersion = newTextData.contentVersion;
        }

        const wasRenderingEnabled = this.renderingEnabled;
        this.SetRenderingEnabled(false);
        this.BuildRuntimeRuns(this.rtData, mergedParagraphInfo);
        this.AdjustSpellCheck();
        if (wasRenderingEnabled) {
          this.SetRenderingEnabled(true);
        }
      }
    } else {
      this.SetText(newTextData.text, null, startIndex, length);
    }

    console.log("B.Text.Formatter: SetRuntimeText output:", this.rtData.text);
  }

  GetRuntimeText(startIndex: number, length: number) {
    console.log("B.Text.Formatter: GetRuntimeText input:", { startIndex, length });

    let result = {
      text: '',
      charStyles: [],
      styles: [],
      hyperlinks: [],
      paraInfo: [],
      vAlign: '',
      internalID: '',
      contentVersion: 0
    };

    if (startIndex == null) {
      startIndex = 0;
    } else if (startIndex >= this.rtData.text.length) {
      startIndex = this.rtData.text.length - 1;
    }

    if (!length || startIndex + length > this.rtData.text.length) {
      length = this.rtData.text.length - startIndex;
    }

    const endIndex = startIndex + length;
    const startParagraph = this.GetParagraphAtOffset(startIndex);
    const endParagraph = this.GetParagraphAtOffset(endIndex);

    this.rtData.styles.forEach(style => {
      result.styles.push(Utils1.CopyObj(style));
    });

    if (!result.styles.length) {
      result.styles.push(new DefaultStyle());
    }

    this.rtData.hyperlinks.forEach(link => {
      result.hyperlinks.push(Utils1.CopyObj(link));
    });

    result.text = this.rtData.text.substr(startIndex, length);
    result.charStyles = this.rtData.charStyles.slice(startIndex, startIndex + length);

    const bulletIndent = Math.max(this.GetBulletIndent(), 8);

    for (let i = startParagraph; i <= endParagraph; i++) {
      let paragraphStyle = Utils1.CopyObj(this.rtData.styleRuns[i].pStyle);
      paragraphStyle.bindent = paragraphStyle.bullet === 'none' ? 0 : bulletIndent;
      result.paraInfo.push({
        pStyle: paragraphStyle,
        offset: this.rtData.styleRuns[i].start
      });
    }

    for (let i = 0; i < result.styles.length; i++) {
      if (result.styles[i].spError) {
        let newStyle = Utils1.CopyObj(result.styles[i]);
        newStyle.spError = false;
        let newStyleIndex = this.FindAddStyle(newStyle, true);
        if (newStyleIndex < 0) {
          result.styles[i].spError = false;
        } else {
          for (let j = 0; j < result.charStyles.length; j++) {
            if (result.charStyles[j] === i) {
              result.charStyles[j] = newStyleIndex;
            }
          }
        }
      }
    }

    this.TrimUnusedStyles(result);

    result.vAlign = this.parent.GetVerticalAlignment();
    result.internalID = this.parent.internalID;
    result.contentVersion = this.contentVersion;

    console.log("B.Text.Formatter: GetRuntimeText output:", result);
    return result;
  }

  DeleteText(startIndex: number, length: number) {
    console.log("B.Text.Formatter: DeleteText input:", { startIndex, length });

    this.SetText('', null, startIndex, length);

    console.log("B.Text.Formatter: DeleteText output:", this.rtData.text);
  }

  GetTextLength() {
    console.log("B.Text.Formatter: GetTextLength input");

    const length = this.rtData.text.length;

    console.log("B.Text.Formatter: GetTextLength output:", length);
    return length;
  }

  GetTextFormatSize() {
    console.log("B.Text.Formatter: GetTextFormatSize input");

    let width = Math.max(this.fmtText.width, this.limits.minWidth);
    if (this.limits.maxWidth) {
      width = Math.min(width, this.limits.maxWidth);
    }

    const result = {
      width: width,
      height: this.fmtText.height
    };

    console.log("B.Text.Formatter: GetTextFormatSize output:", result);
    return result;
  }

  GetContentVersion() {
    console.log("B.Text.Formatter: GetContentVersion input");

    const version = this.contentVersion;

    console.log("B.Text.Formatter: GetContentVersion output:", version);
    return version;
  }

  GetSpellCheckEnabled() {
    console.log("B.Text.Formatter: GetSpellCheckEnabled input");

    const isEnabled = this.spellCheckEnabled;

    console.log("B.Text.Formatter: GetSpellCheckEnabled output:", isEnabled);
    return isEnabled;
  }

  SpellCheckValid() {
    console.log("B.Text.Formatter: SpellCheckValid input");

    const isValid = this.spellCheckEnabled &&
      this.parent.doc.spellChecker &&
      this.parent.doc.spellChecker.GetActive() &&
      this.parent.IsActive();

    console.log("B.Text.Formatter: SpellCheckValid output:", isValid);
    return isValid;
  }

  SetSpellCheck(isEnabled: boolean) {
    console.log("B.Text.Formatter: SetSpellCheck input:", isEnabled);

    this.spellCheckEnabled = isEnabled;

    if (!isEnabled) {
      this.UpdateSpellCheckFormatting();
    }

    console.log("B.Text.Formatter: SetSpellCheck output:", this.spellCheckEnabled);
  }

  UpdateSpellCheck(newWordList) {
    console.log("B.Text.Formatter: UpdateSpellCheck input:", newWordList);

    if (!this.SpellCheckValid()) {
      this.UpdateSpellCheckFormatting();
      this.parent.CallEditCallback('spellcheck');
      console.log("B.Text.Formatter: UpdateSpellCheck output: Spell check not valid");
      return;
    }

    const currentWordList = this.GetWordList();
    this.MergeWordLists(newWordList, currentWordList);
    this.UpdateSpellCheckFormatting();
    this.parent.CallEditCallback('spellcheck');

    console.log("B.Text.Formatter: UpdateSpellCheck output: Spell check updated");
  }

  UpdateSpellCheckFormatting() {
    console.log("B.Text.Formatter: UpdateSpellCheckFormatting input");

    if (!this.SpellCheckValid()) {
      this.SetFormat({ spError: false });
      this.wordList = null;
      console.log("B.Text.Formatter: UpdateSpellCheckFormatting output: Spell check not valid");
      return;
    }

    const wordList = this.GetWordList();
    const wordCount = wordList.list.length;

    this.SetFormat({ spError: false }, null, null, true);

    for (let i = 0; i < wordCount; i++) {
      const start = wordList.list[i].start;
      const end = wordList.list[i].end;

      if (wordList.list[i].status === Instance.Basic.Text.Spell.WordState.WRONG && !this.IsDataFieldInRange(start, end)) {
        this.SetFormat({ spError: true }, start, wordList.list[i].word.length, true);
      }
    }

    if (this.renderingEnabled) {
      const paragraphStyles = [];
      for (let i = 0; i < this.rtData.styleRuns.length; i++) {
        paragraphStyles.push({ pStyle: Utils1.CopyObj(this.rtData.styleRuns[i].pStyle) });
      }
      this.BuildRuntimeRuns(this.rtData, paragraphStyles);
      this.fmtText = this.CalcFromRuntime(this.rtData, this.limits);
    }

    console.log("B.Text.Formatter: UpdateSpellCheckFormatting output");
  }

  AdjustSpellCheck(newText?: string) {
    console.log("B.Text.Formatter: AdjustSpellCheck input:", newText);

    let needsSpellCheck = newText && newText.length === 1 && newText.search(/[^\u0000-\u2FFF]|[A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F\u0386-\u04FF\u1E00-\u1FFF]/) >= 0;
    let spellCheckRequired = false;

    if (this.SpellCheckValid() && this.parent.IsActive()) {
      let wordList = this.GetWordList();

      if (!needsSpellCheck) {
        for (let i = 0; i < wordList.list.length; i++) {
          if (wordList.list[i].status === Instance.Basic.Text.Spell.WordState.NOTPROCESSED) {
            spellCheckRequired = true;
            break;
          }
        }
      }

      if (spellCheckRequired) {
        this.parent.DoSpellCheck();
      } else {
        this.UpdateSpellCheckFormatting();
      }
    } else {
      this.wordList = null;
    }

    console.log("B.Text.Formatter: AdjustSpellCheck output:", this.wordList);
  }

  GetSpellAtPoint(point) {
    console.log("B.Text.Formatter: GetSpellAtPoint input:", point);

    let line = null;
    let run = null;
    let charIndex = -1;

    if (point.y < 0 || point.y > this.fmtText.height) {
      return -1;
    }

    for (let i = 0; i < this.renderedLines.length; i++) {
      if (point.y >= this.renderedLines[i].top && point.y <= this.renderedLines[i].bottom) {
        if (point.x < this.renderedLines[i].left || point.x > this.renderedLines[i].right) {
          break;
        }
        for (let j = 0; j < this.renderedLines[i].runs.length; j++) {
          if (point.x <= this.renderedLines[i].runs[j].right) {
            line = this.renderedLines[i];
            run = this.renderedLines[i].runs[j];
            break;
          }
        }
        break;
      }
    }

    if (line && run) {
      this.BuildRuntimeCharPos(line, run);
      let charPos = run.charPos;
      let left = run.left;
      charIndex = run.runRec.dispStart;

      for (let k = 0; k < charPos.length; k++) {
        if (charPos[k] > point.x) {
          if ((left + charPos[k]) / 2 < point.x) {
            charIndex++;
          }
          break;
        }
        left = charPos[k];
        charIndex++;
      }

      let format = this.GetFormatAtOffset(charIndex);
      if (!format || !format.style || !format.style.spError) {
        charIndex = -1;
      }
    }

    console.log("B.Text.Formatter: GetSpellAtPoint output:", charIndex);
    return charIndex;
  }

  CalcTextFit(maxWidth: number) {
    console.log("B.Text.Formatter: CalcTextFit input:", maxWidth);

    let calculatedText;
    let options = { maxWidth: 0 };

    if (maxWidth) {
      options.maxWidth = maxWidth;
    }

    calculatedText = this.CalcFromRuntime(this.rtData, options);

    const result = {
      width: calculatedText.dispMinWidth,
      height: calculatedText.height
    };

    console.log("B.Text.Formatter: CalcTextFit output:", result);
    return result;
  }

  CalcTextWrap(maxWidth: number) {
    console.log("B.Text.Formatter: CalcTextWrap input:", maxWidth);

    let options = { maxWidth: 0 };
    if (maxWidth) {
      options.maxWidth = maxWidth;
    }

    const formattedText = this.CalcFromRuntime(this.rtData, options);
    let paragraphIndex, lineIndex, startOffset;
    const wrapPoints = [];

    for (paragraphIndex = 0; paragraphIndex < formattedText.paragraphs.length; paragraphIndex++) {
      const paragraph = formattedText.paragraphs[paragraphIndex];
      if (!paragraph.lines.length) {
        startOffset = paragraph.start;
        wrapPoints.push(startOffset);
      }
      for (lineIndex = 0; lineIndex < paragraph.lines.length; lineIndex++) {
        startOffset = paragraph.lines[lineIndex].start;
        wrapPoints.push(startOffset);
      }
    }

    console.log("B.Text.Formatter: CalcTextWrap output:", wrapPoints);
    return wrapPoints;
  }

  CalcFormatChange(formatChange) {
    console.log("B.Text.Formatter: CalcFormatChange input:", formatChange);

    let updatedRuntimeData = Utils1.CopyObj(this.rtData);
    let paragraphStyles = [];

    // Merge the new format with existing styles
    for (let i = 0; i < updatedRuntimeData.styles.length; i++) {
      updatedRuntimeData.styles[i] = this.MergeStyles(formatChange, updatedRuntimeData.styles[i]);
    }

    // Adjust text and charStyles for line breaks
    for (let i = this.fmtText.paragraphs.length - 1; i >= 0; i--) {
      let paragraph = this.fmtText.paragraphs[i];
      for (let j = paragraph.lines.length - 1; j > 0; j--) {
        let lineStart = paragraph.lines[j].start;
        if (lineStart !== 0) {
          updatedRuntimeData.text = updatedRuntimeData.text.slice(0, lineStart) + '\n' + updatedRuntimeData.text.slice(lineStart);
          updatedRuntimeData.charStyles.splice(lineStart, 0, updatedRuntimeData.charStyles[lineStart - 1]);
        }
      }
    }

    // Copy paragraph styles
    for (let i = 0; i < this.rtData.styleRuns.length; i++) {
      paragraphStyles.push({ pStyle: Utils1.CopyObj(this.rtData.styleRuns[i].pStyle) });
    }

    // Build runtime runs with updated data
    this.BuildRuntimeRuns(updatedRuntimeData, paragraphStyles);

    // Calculate the new dimensions
    let formattedText = this.CalcFromRuntime(updatedRuntimeData, { maxWidth: 32000 });
    let result = {
      width: formattedText.width,
      height: formattedText.height
    };

    console.log("B.Text.Formatter: CalcFormatChange output:", result);
    return result;
  }

  GetHitInfo(point) {
    console.log("B.Text.Formatter: GetHitInfo input:", point);

    let x = point.x;
    let y = point.y;
    let lineIndex = -1;
    let runIndex = -1;
    let hitInfo = {
      index: 0,
      rLine: 0,
      rRun: 0,
      pRun: 0,
      fPara: 0,
      fLine: 0,
      fRun: 0,
      inDataField: false,
      dataFieldInfo: null
    };

    if (y < 0) {
      console.log("B.Text.Formatter: GetHitInfo output:", hitInfo);
      return hitInfo;
    }

    if (y > this.fmtText.height) {
      hitInfo.index = this.fmtText.text.length;
      hitInfo.rLine = this.renderedLines.length;
      hitInfo.fPara = this.fmtText.paragraphs.length;
      console.log("B.Text.Formatter: GetHitInfo output:", hitInfo);
      return hitInfo;
    }

    for (let i = 0; i < this.renderedLines.length; i++) {
      if (y >= this.renderedLines[i].top && y <= this.renderedLines[i].bottom) {
        lineIndex = i;
        runIndex = -1;
        let runsLength = this.renderedLines[i].runs.length;
        for (let j = 0; j < runsLength; j++) {
          if (x < this.renderedLines[i].runs[j].right) {
            runIndex = j;
            break;
          }
        }
        break;
      }
    }

    if (lineIndex < 0) {
      console.log("B.Text.Formatter: GetHitInfo output:", hitInfo);
      return hitInfo;
    }

    hitInfo.rLine = lineIndex;
    hitInfo.rRun = runIndex;
    let renderedLine = this.renderedLines[lineIndex];
    let paragraphIndex = renderedLine.paraIndex;
    let lineIndexInParagraph = renderedLine.lineIndex;
    hitInfo.fPara = paragraphIndex;
    hitInfo.fLine = lineIndexInParagraph;

    if (runIndex < 0) {
      hitInfo.pRun = 0;
      hitInfo.rRun = 0;
      if (this.fmtText.paragraphs[paragraphIndex].lines[lineIndexInParagraph].runs.length > 0) {
        hitInfo.index = this.fmtText.paragraphs[paragraphIndex].lines[lineIndexInParagraph].runs[0].dispStart;
      } else {
        hitInfo.index = this.fmtText.paragraphs[paragraphIndex].lines[lineIndexInParagraph].start;
      }
      if (this.IsDataFieldAtPos(hitInfo.index)) {
        hitInfo.inDataField = true;
        hitInfo.dataFieldInfo = this.GetDataField(hitInfo.index);
      }
      console.log("B.Text.Formatter: GetHitInfo output:", hitInfo);
      return hitInfo;
    }

    let run = renderedLine.runs[runIndex];
    hitInfo.fRun = run.runIndex;
    this.BuildRuntimeCharPos(renderedLine, run);
    let charPosLength = run.charPos.length;
    let formattedRun = this.fmtText.paragraphs[paragraphIndex].lines[lineIndexInParagraph].runs[run.runIndex];

    if (x <= run.left) {
      hitInfo.index = formattedRun.dispStart;
    } else {
      let charIndex = formattedRun.dispStart;
      let left = run.left;
      for (let k = 0; k < charPosLength; k++) {
        if (run.charPos[k] > x) {
          if ((left + run.charPos[k]) / 2 < x) {
            charIndex++;
          }
          break;
        }
        left = run.charPos[k];
        charIndex++;
      }
      hitInfo.index = charIndex;
    }

    console.log("B.Text.Formatter: GetHitInfo output:", hitInfo);
    return hitInfo;
  }

  static FindPrevNextWord(text: string, position: number, isPrevious: boolean): number {
    console.log("B.Text.Formatter: FindPrevNextWord input:", { text, position, isPrevious });

    const length = text.length;
    const whitespace = /[ \f\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/;
    const punctuation = /[`~!@#$%\^&?*()_\-+={}\[\]|\\;:'",.<>\/]/;
    const wordChar = /[^\s`~!@#$%\^&?*()_\-+={}\[\]|\\;:'",.<>\/]/;

    const getCharType = (char: string) => {
      if (whitespace.test(char)) return whitespace;
      if (punctuation.test(char)) return punctuation;
      if (wordChar.test(char)) return wordChar;
      return null;
    };

    let charType;

    if (isPrevious && position > 0) {
      position--;
      while (whitespace.test(text[position]) && position > 0) {
        position--;
      }
      charType = getCharType(text[position]);
      if (charType && position > 0) {
        while (charType.test(text[position - 1]) && position > 0) {
          position--;
        }
      }
    } else if (position < length) {
      charType = getCharType(text[position]);
      while (charType && charType.test(text[position]) && position < length) {
        position++;
      }
      if (!charType && position < length) {
        position++;
      }
      while (whitespace.test(text[position]) && position < length) {
        position++;
      }
    }

    console.log("B.Text.Formatter: FindPrevNextWord output:", position);
    return position;
  }

  GetAdjacentChar(index: number, line: number, direction: string, event: KeyboardEvent) {
    console.log("B.Text.Formatter: GetAdjacentChar input:", { index, line, direction, event });

    let currentIndex = index;
    let currentLine = line;
    let isCtrlPressed = event && event.ctrlKey;
    let isForward = true;
    let hitInfo;
    let renderedLine;
    let run;
    let startChar;
    let endChar;
    let hitPoint = { x: 0, y: 0 };
    let result = { index: currentIndex, line: currentLine };

    if (direction === 'prev' || direction === 'next') {
      hitInfo = this.GetRenderedCharInfo(currentIndex, currentLine);
      if (hitInfo.rLine >= 0) {
        renderedLine = this.renderedLines[hitInfo.rLine];
        if (renderedLine && renderedLine.runs.length) {
          startChar = renderedLine.runs[0].runRec.dispStart;
          endChar = renderedLine.runs[renderedLine.runs.length - 1].runRec.dispStart + renderedLine.runs[renderedLine.runs.length - 1].runRec.dispLen;
        }
      }

      switch (direction) {
        case 'prev':
          if (currentIndex > 0) {
            if (isCtrlPressed) {
              result.index = Formatter.FindPrevNextWord(this.fmtText.text, currentIndex, true);
              if (result.index < startChar) {
                result.line--;
              }
            } else {
              result.index--;
            }
          }
          isForward = false;
          break;
        case 'next':
          if (currentIndex < this.fmtText.text.length) {
            if (isCtrlPressed) {
              result.index = Formatter.FindPrevNextWord(this.fmtText.text, currentIndex, false);
              if (result.index > endChar) {
                result.line++;
              }
            } else {
              result.index++;
            }
          }
          break;
      }
    } else if (direction === 'home' || direction === 'end') {
      if (isCtrlPressed) {
        result.line = undefined;
        switch (direction) {
          case 'home':
            result.index = 0;
            isForward = false;
            break;
          case 'end':
            result.index = this.fmtText.text.length;
            break;
        }
      } else {
        hitInfo = this.GetRenderedCharInfo(currentIndex, currentLine);
        if (hitInfo.rLine < 0) return result;

        result.line = hitInfo.rLine;
        renderedLine = this.renderedLines[hitInfo.rLine];
        if (!renderedLine || !renderedLine.runs.length) return result;

        startChar = renderedLine.runs[0].runRec.dispStart;
        endChar = renderedLine.runs[renderedLine.runs.length - 1].runRec.dispStart + renderedLine.runs[renderedLine.runs.length - 1].runRec.dispLen;

        switch (direction) {
          case 'home':
            result.index = startChar;
            isForward = false;
            break;
          case 'end':
            result.index = endChar;
            break;
        }
      }
    } else {
      hitInfo = this.GetRenderedCharInfo(currentIndex, currentLine);
      if (hitInfo.rLine < 0) return result;

      startChar = currentIndex;
      endChar = currentIndex;
      if (isCtrlPressed && this.renderedLines[hitInfo.rLine] && this.renderedLines[hitInfo.rLine].runs.length) {
        renderedLine = this.renderedLines[hitInfo.rLine];
        startChar = renderedLine.runs[0].runRec.dispStart;
        endChar = renderedLine.runs[renderedLine.runs.length - 1].runRec.dispStart + renderedLine.runs[renderedLine.runs.length - 1].runRec.dispLen;
      }

      switch (direction) {
        case 'up':
          if (hitInfo.rLine > 0) {
            renderedLine = this.renderedLines[hitInfo.rLine - 1];
            if (isCtrlPressed) {
              if (startChar === currentIndex) {
                if (renderedLine.runs.length) {
                  run = renderedLine.runs[0].runRec;
                  result.index = run.dispStart;
                  result.line = hitInfo.rLine - 1;
                }
              } else {
                result.index = startChar;
                result.line = hitInfo.rLine;
              }
            } else {
              let lineRec = renderedLine.lineRec;
              hitPoint.x = hitInfo.left;
              hitPoint.y = lineRec.yOffset + lineRec.height / 2;
              let hit = this.GetHitInfo(hitPoint);
              if (hit.index >= 0) {
                result.index = hit.index;
                result.line = hitInfo.rLine - 1;
              }
            }
          } else if (isCtrlPressed) {
            result.index = startChar;
            result.line = hitInfo.rLine;
          }
          isForward = false;
          break;
        case 'down':
          if (hitInfo.rLine < this.renderedLines.length - 1) {
            renderedLine = this.renderedLines[hitInfo.rLine + 1];
            if (isCtrlPressed) {
              if (renderedLine.runs.length) {
                run = renderedLine.runs[0].runRec;
                result.index = run.dispStart;
                result.line = hitInfo.rLine + 1;
              }
            } else {
              let lineRec = renderedLine.lineRec;
              hitPoint.x = hitInfo.left;
              hitPoint.y = lineRec.yOffset + lineRec.height / 2;
              let hit = this.GetHitInfo(hitPoint);
              if (hit.index >= 0) {
                result.index = hit.index;
                result.line = hitInfo.rLine + 1;
              }
            }
          } else if (isCtrlPressed) {
            result.index = endChar;
            result.line = hitInfo.rLine;
          }
          break;
      }
    }

    if (result.index > 0 && result.index < this.fmtText.text.length) {
      let dataField = this.GetDataField(result.index);
      if (dataField) {
        let previousIndex = result.index;
        if (isForward) {
          if (result.index > dataField.startPos) {
            result.index = dataField.endPos;
          }
        } else {
          result.index = dataField.startPos;
        }
        if (previousIndex !== result.index) {
          hitInfo = this.GetRenderedCharInfo(result.index);
          if (hitInfo.rLine >= 0) {
            if (isForward && hitInfo.rLine > result.line) {
              result.line = hitInfo.rLine;
            } else if (!isForward && hitInfo.rLine < result.line) {
              result.line = hitInfo.rLine;
            }
          }
        }
      }
    }

    console.log("B.Text.Formatter: GetAdjacentChar output:", result);
    return result;
  }

  GetRenderedCharInfo(charIndex: number, lineIndex?: number) {
    console.log("B.Text.Formatter: GetRenderedCharInfo input:", { charIndex, lineIndex });

    let renderedLine, lineRec, runRec, run, charPos;
    const textSize = this.GetTextFormatSize();
    const result = {
      rLine: -1,
      rRun: -1,
      rChar: -1,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };

    if (charIndex < 0) {
      if (lineIndex === undefined) return result;
      result.rLine = lineIndex;
      lineRec = (renderedLine = this.renderedLines[lineIndex]).lineRec;
    } else {
      for (let i = 0; i < this.renderedLines.length; i++) {
        result.rLine = i;
        lineRec = (renderedLine = this.renderedLines[i]).lineRec;
        if (charIndex < lineRec.start + lineRec.length) break;
      }
    }

    if (result.rLine < 0) return result;

    if (result.rLine > 0 && charIndex >= 0 && charIndex < renderedLine.dispStart) {
      result.rLine--;
      lineRec = (renderedLine = this.renderedLines[result.rLine]).lineRec;
    }

    if ((lineIndex === undefined || lineIndex < 0) && (lineIndex = -2), charIndex === lineRec.start && lineIndex === result.rLine - 1) {
      result.rLine = lineIndex;
      lineRec = (renderedLine = this.renderedLines[result.rLine]).lineRec;
    }

    result.top = Math.max(0, Math.min(textSize.height, renderedLine.top));
    result.bottom = Math.max(0, Math.min(textSize.height, renderedLine.bottom));

    if (charIndex < 0) {
      result.left = Math.max(0, Math.min(textSize.width, renderedLine.left));
      result.right = Math.max(0, Math.min(textSize.width, renderedLine.right));
      console.log("B.Text.Formatter: GetRenderedCharInfo output:", result);
      return result;
    }

    for (let i = 0; i < renderedLine.runs.length; i++) {
      result.rRun = i;
      runRec = (run = renderedLine.runs[i]).runRec;
      if (charIndex < runRec.start + runRec.length) break;
    }

    if (result.rRun < 0) {
      result.left = renderedLine.left;
      result.right = renderedLine.left;
    } else if (charIndex >= lineRec.start + lineRec.length) {
      result.left = renderedLine.right;
      result.right = renderedLine.right;
      result.rChar = lineRec.length;
    } else {
      this.BuildRuntimeCharPos(renderedLine, run);
      result.rChar = charIndex - runRec.dispStart;
      if (result.rChar < 0) {
        result.rChar = -1;
        result.left = run.left;
        result.right = run.left;
      } else if (result.rChar >= run.charPos.length) {
        result.rChar = run.charPos.length;
        if (result.rChar > 0) {
          result.left = run.charPos[result.rChar - 1];
          result.right = result.left;
        } else {
          result.left = run.right;
          result.right = run.right;
        }
      } else {
        result.left = run.left;
        result.right = run.charPos[result.rChar];
        if (result.rChar > 0) {
          result.left = run.charPos[result.rChar - 1];
        }
      }
    }

    result.left = Math.max(0, Math.min(textSize.width, result.left));
    result.right = Math.max(0, Math.min(textSize.width, result.right));

    console.log("B.Text.Formatter: GetRenderedCharInfo output:", result);
    return result;
  }

  GetRenderedRange(startIndex: number, endIndex: number) {
    console.log("B.Text.Formatter: GetRenderedRange input:", { startIndex, endIndex });

    let renderedRanges = [];
    if (startIndex > endIndex || startIndex < 0 || endIndex < 0) {
      return renderedRanges;
    }

    let startCharInfo = this.GetRenderedCharInfo(startIndex);
    let endCharInfo = this.GetRenderedCharInfo(endIndex);

    if (startCharInfo.rLine === endCharInfo.rLine) {
      renderedRanges.push({
        left: startCharInfo.left,
        top: startCharInfo.top,
        right: endCharInfo.left,
        bottom: endCharInfo.bottom
      });
    } else {
      for (let lineIndex = startCharInfo.rLine; lineIndex <= endCharInfo.rLine; lineIndex++) {
        let lineInfo = this.GetRenderedCharInfo(-1, lineIndex);
        let range = {
          left: lineInfo.left,
          top: lineInfo.top,
          right: lineInfo.right,
          bottom: lineInfo.bottom
        };

        if (lineIndex === startCharInfo.rLine) {
          range.left = startCharInfo.left;
        } else if (lineIndex === endCharInfo.rLine) {
          range.right = endCharInfo.left;
        }

        renderedRanges.push(range);
      }
    }

    for (let i = 0; i < renderedRanges.length; i++) {
      if (renderedRanges[i].left < 0) {
        renderedRanges[i].left = 0;
      }
      if (renderedRanges[i].right < renderedRanges[i].left) {
        renderedRanges[i].right = renderedRanges[i].left;
      }
      if (this.limits.maxWidth && renderedRanges[i].right > this.limits.maxWidth) {
        renderedRanges[i].right = this.limits.maxWidth;
      }
    }

    console.log("B.Text.Formatter: GetRenderedRange output:", renderedRanges);
    return renderedRanges;
  }

  BuildRuntimeCharPos(line, run) {
    console.log("B.Text.Formatter: BuildRuntimeCharPos input:", { line, run });

    let charPos = [];
    let currentPos = run.left;
    const runNode = run.elem ? run.elem.node : null;
    const runRec = run.runRec;

    if (run.isTab && line.pStyle.tabspace) {
      currentPos -= currentPos % line.pStyle.tabspace;
    }

    for (let i = 0; runNode && i < runRec.dispLen; i++) {
      if (run.isTab) {
        currentPos += line.pStyle.tabspace;
      } else {
        currentPos = run.left + Formatter.GetRunPositionForChar(runNode, i, false, run.cache, run.left);
      }
      charPos.push(currentPos);
    }

    for (let i = runRec.length - (runRec.dispStart - runRec.start), j = charPos.length; j < i; j++) {
      const charIndex = runRec.dispStart + j;
      if (run.isTab) {
        currentPos += line.pStyle.tabspace;
      } else {
        if (this.fmtText.text[charIndex] !== ' ') break;
        currentPos += runRec.space;
      }
      charPos.push(currentPos);
    }

    run.charPos = charPos;

    console.log("B.Text.Formatter: BuildRuntimeCharPos output:", run.charPos);
  }

  GetWordAtIndex(index: number) {
    console.log("B.Text.Formatter: GetWordAtIndex input:", index);

    let wordList = this.GetWordList();
    let result = { start: index, end: index };

    for (let i = 0; i < wordList.list.length; i++) {
      if (index >= wordList.list[i].start && index < wordList.list[i].end) {
        result.start = wordList.list[i].start;
        result.end = wordList.list[i].end;
        break;
      }
    }

    console.log("B.Text.Formatter: GetWordAtIndex output:", result);
    return result;
  }

  GetWordList() {
    console.log("B.Text.Formatter: GetWordList input");

    let previousWordList;
    if (this.wordList && this.wordList.sessionID === this.GetContentVersion()) {
      console.log("B.Text.Formatter: GetWordList output:", this.wordList);
      return this.wordList;
    }

    previousWordList = this.wordList;
    this.wordList = this.BuildWordList();

    if (previousWordList) {
      this.MergeWordLists(previousWordList, this.wordList);
    }

    console.log("B.Text.Formatter: GetWordList output:", this.wordList);
    return this.wordList;
  }

  MergeWordLists(newWordList, currentWordList) {
    console.log("B.Text.Formatter: MergeWordLists input:", { newWordList, currentWordList });

    for (let i = 0; i < newWordList.list.length; i++) {
      const newWord = newWordList.list[i];
      for (let j = 0; j < currentWordList.list.length; j++) {
        const currentWord = currentWordList.list[j];
        if (currentWord.word === newWord.word) {
          currentWord.status = newWord.status;
          currentWord.auto = newWord.auto;
          currentWord.needSuggest = newWord.needSuggest;
          currentWord.suggestions = newWord.suggestions;
          break;
        }
      }
    }

    console.log("B.Text.Formatter: MergeWordLists output:", currentWordList);
  }

  BuildWordList() {
    console.log("B.Text.Formatter: BuildWordList input");

    let match;
    const wordList = {
      textID: this.parent.GetInternalID(),
      sessionID: this.GetContentVersion(),
      list: []
    };

    const wordRegex = /(([^\u0000-\u2FFF]|[A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F\u0386-\u04FF\u1E00-\u1FFF])+)(([\u0027\u0060\u2018\u2019\u2032](([^\u0000-\u2FFF]|[A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F\u0386-\u04FF\u1E00-\u1FFF])+))*)/g;

    while ((match = wordRegex.exec(this.rtData.text)) !== null) {
      const word = match[0].replace(/[\u0027\u0060\u2018\u2019\u2032]/g, '\'');
      wordList.list.push({
        word: word,
        start: match.index,
        end: match.index + match[0].length,
        status: Spell.WordState.NOTPROCESSED,
        auto: false,
        needSuggest: true,
        suggestions: null
      });
    }

    console.log("B.Text.Formatter: BuildWordList output:", wordList);
    return wordList;
  }

  SetFormat(format, start?, length?, skipCallback?) {
    console.log("B.Text.Formatter: SetFormat input:", { format, start, length, skipCallback });

    let styleIndex = -1;
    let formatChanged = false;

    if (format.size === 0) return -1;

    if (start == null) {
      start = 0;
    } else if (start >= this.rtData.text.length) {
      start = this.rtData.text.length - 1;
    }

    if (length == null || start + length > this.rtData.text.length) {
      length = this.rtData.text.length - start;
    }

    if (format.font && !format.type) {
      format.type = this.parent.doc.GetFontType(format.font);
    }

    if (length <= 0) {
      styleIndex = this.SetRuntimeCharFormat(start, format, false);
      if (this.rtData.text.length === 0) {
        const style = this.rtData.styles[styleIndex];
        this.rtData.styles = [style];
        styleIndex = 0;
      }
      console.log("B.Text.Formatter: SetFormat output:", styleIndex);
      return styleIndex;
    }

    for (let i = 0; i < length; i++) {
      const charIndex = i + start;
      if (this.rtData.charStyles[charIndex] !== this.SetRuntimeCharFormat(charIndex, format, true)) {
        formatChanged = true;
      }
    }

    if (skipCallback || !formatChanged) {
      console.log("B.Text.Formatter: SetFormat output: No format change");
      return -1;
    }

    styleIndex = this.rtData.styles.length - 1;
    for (let i = 0; i < this.rtData.charStyles.length; i++) {
      if (i === 0) {
        styleIndex = this.rtData.charStyles[i];
      } else if (this.rtData.charStyles[i] !== styleIndex) {
        styleIndex = -1;
        break;
      }
    }

    if (styleIndex >= 0) {
      const style = this.rtData.styles[styleIndex];
      this.rtData.styles = [style];
      for (let i = 0; i < this.rtData.charStyles.length; i++) {
        this.rtData.charStyles[i] = 0;
      }
    }

    const paragraphStyles = [];
    this.rtData.styleRuns.forEach(run => {
      paragraphStyles.push({ pStyle: run.pStyle });
    });

    this.BuildRuntimeRuns(this.rtData, paragraphStyles);
    this.fmtText = this.CalcFromRuntime(this.rtData, this.limits);
    this.parent.CallEditCallback('select');

    console.log("B.Text.Formatter: SetFormat output:", -1);
    return -1;
  }

  GetFormatAtOffset(offset: number, runtimeData?: any) {
    console.log("B.Text.Formatter: GetFormatAtOffset input:", { offset, runtimeData });

    let styleIndex = 0;
    let style = new DefaultStyle();
    runtimeData = runtimeData || this.rtData;

    if (offset >= runtimeData.charStyles.length) {
      offset = runtimeData.charStyles.length - 1;
    }
    if (offset < 0) {
      offset = 0;
    }
    if (offset < runtimeData.charStyles.length) {
      styleIndex = runtimeData.charStyles[offset];
      if (styleIndex < runtimeData.styles.length) {
        style = runtimeData.styles[styleIndex];
      }
    } else if (runtimeData.styles.length > 0) {
      styleIndex = runtimeData.styles.length - 1;
      style = runtimeData.styles[styleIndex];
    }

    const result = {
      id: styleIndex,
      style: style
    };

    console.log("B.Text.Formatter: GetFormatAtOffset output:", result);
    return result;
  }

  GetFormatByID(formatId: number) {
    console.log("B.Text.Formatter: GetFormatByID input:", formatId);

    let style = new DefaultStyle();
    if (formatId >= 0 && formatId < this.rtData.styles.length) {
      style = this.rtData.styles[formatId];
    }

    console.log("B.Text.Formatter: GetFormatByID output:", style);
    return style;
  }

  SetParagraphStyle(paragraphStyle, startOffset, length) {
    console.log("B.Text.Formatter: SetParagraphStyle input:", { paragraphStyle, startOffset, length });

    let startParagraph, endParagraph;

    if (startOffset == null) {
      startOffset = 0;
    } else if (startOffset > this.rtData.text.length) {
      startOffset = this.rtData.text.length;
    }

    if (length == null || startOffset + length > this.rtData.text.length) {
      length = this.rtData.text.length - startOffset;
    }

    startParagraph = this.GetParagraphAtOffset(startOffset);
    endParagraph = this.GetParagraphAtOffset(startOffset + length);

    if (startParagraph >= 0) {
      if (paragraphStyle.bullet && paragraphStyle.bullet !== 'none') {
        paragraphStyle.lindent = 0;
        paragraphStyle.pindent = 0;
      }

      for (let i = startParagraph; i <= endParagraph; i++) {
        if (paragraphStyle.just !== undefined) {
          this.rtData.styleRuns[i].pStyle.just = paragraphStyle.just;
        }
        if (paragraphStyle.bullet !== undefined) {
          this.rtData.styleRuns[i].pStyle.bullet = paragraphStyle.bullet;
        }
        if (paragraphStyle.spacing !== undefined) {
          this.rtData.styleRuns[i].pStyle.spacing = Number(paragraphStyle.spacing);
        }
        if (paragraphStyle.pindent !== undefined) {
          this.rtData.styleRuns[i].pStyle.pindent = Number(paragraphStyle.pindent);
        }
        if (paragraphStyle.lindent !== undefined) {
          this.rtData.styleRuns[i].pStyle.lindent = Number(paragraphStyle.lindent);
        }
        if (paragraphStyle.rindent !== undefined) {
          this.rtData.styleRuns[i].pStyle.rindent = Number(paragraphStyle.rindent);
        }
        if (paragraphStyle.tabspace !== undefined) {
          this.rtData.styleRuns[i].pStyle.tabspace = Number(paragraphStyle.tabspace);
        }
      }

      this.fmtText = this.CalcFromRuntime(this.rtData, this.limits);
    }

    console.log("B.Text.Formatter: SetParagraphStyle output:", this.fmtText);
  }

  GetParagraphStyle(offset: number) {
    console.log("B.Text.Formatter: GetParagraphStyle input:", offset);

    let paragraphStyle = this.DefaultPStyle();
    const paragraphIndex = this.GetParagraphAtOffset(offset);

    if (paragraphIndex >= 0) {
      paragraphStyle = Utils1.CopyObj(this.rtData.styleRuns[paragraphIndex].pStyle);
    }

    console.log("B.Text.Formatter: GetParagraphStyle output:", paragraphStyle);
    return paragraphStyle;
  }

  GetParagraphAtOffset(offset: number) {
    console.log("B.Text.Formatter: GetParagraphAtOffset input:", offset);

    for (let i = 0; i < this.rtData.styleRuns.length; i++) {
      if (offset < this.rtData.styleRuns[i].start + this.rtData.styleRuns[i].nChars) {
        console.log("B.Text.Formatter: GetParagraphAtOffset output:", i);
        return i;
      }
    }

    const result = this.rtData.styleRuns.length - 1;
    console.log("B.Text.Formatter: GetParagraphAtOffset output:", result);
    return result;
  }

  GetParagraphCount() {
    console.log("B.Text.Formatter: GetParagraphCount input");

    const paragraphCount = this.rtData.styleRuns.length;

    console.log("B.Text.Formatter: GetParagraphCount output:", paragraphCount);
    return paragraphCount;
  }

  GetParagraphPosition(paragraphIndex: number): number {
    console.log("B.Text.Formatter: GetParagraphPosition input:", paragraphIndex);

    const position = paragraphIndex < this.rtData.styleRuns.length ? this.rtData.styleRuns[paragraphIndex].start : -1;

    console.log("B.Text.Formatter: GetParagraphPosition output:", position);
    return position;
  }

  GetCommonFormatForRange(startIndex: number, length: number) {
    console.log("B.Text.Formatter: GetCommonFormatForRange input:", { startIndex, length });

    let commonFormat = {};
    let currentStyleIndex, charStyleIndex;

    if (startIndex === undefined || startIndex < 0) {
      startIndex = 0;
    }
    if (length === undefined || length < 0 || length > this.rtData.charStyles.length - startIndex) {
      length = Math.max(this.rtData.charStyles.length - startIndex, 0);
    }
    if (!length || startIndex >= this.rtData.charStyles.length) {
      commonFormat = Utils1.CopyObj(this.GetFormatAtOffset(startIndex - 1).style);
    } else {
      currentStyleIndex = this.rtData.charStyles[startIndex];
      if (currentStyleIndex >= 0 && currentStyleIndex < this.rtData.styles.length) {
        commonFormat = Utils1.CopyObj(this.rtData.styles[currentStyleIndex]);
      }
      for (let i = 1; i < length; i++) {
        charStyleIndex = this.rtData.charStyles[startIndex + i];
        if (charStyleIndex !== currentStyleIndex) {
          currentStyleIndex = charStyleIndex;
          commonFormat = this.AndStyles(commonFormat, this.rtData.styles[charStyleIndex]);
        }
      }
    }

    console.log("B.Text.Formatter: GetCommonFormatForRange output:", commonFormat);
    return commonFormat;
  }

  GetFormatRangeAtIndex(format, index) {
    console.log("B.Text.Formatter: GetFormatRangeAtIndex input:", { format, index });

    let start = index;
    let end = index;
    let currentStyle = -1;
    const totalChars = this.rtData.charStyles.length;

    if (!this.IsFormatAtIndex(format, index)) {
      console.log("B.Text.Formatter: GetFormatRangeAtIndex output:", { start: -1, end: -1 });
      return { start: -1, end: -1 };
    }

    for (let i = index - 1; i >= 0; i--) {
      const charStyle = this.rtData.charStyles[i];
      if (charStyle !== currentStyle && !this.IsFormatAtIndex(format, i)) break;
      start = i;
      currentStyle = charStyle;
    }

    currentStyle = -1;
    for (let i = index + 1; i < totalChars; i++) {
      const charStyle = this.rtData.charStyles[i];
      if (charStyle !== currentStyle && !this.IsFormatAtIndex(format, i)) break;
      end = i;
      currentStyle = charStyle;
    }

    const result = { start, end };
    console.log("B.Text.Formatter: GetFormatRangeAtIndex output:", result);
    return result;
  }

  IsFormatAtIndex(format: any, index: number): boolean {
    console.log("B.Text.Formatter: IsFormatAtIndex input:", { format, index });

    const formatAtOffset = this.GetFormatAtOffset(index);
    const result = this.MatchPartialStyles(formatAtOffset.style, format);

    console.log("B.Text.Formatter: IsFormatAtIndex output:", result);
    return result;
  }

  GetFormatTextMinDimensions() {
    console.log("B.Text.Formatter: GetFormatTextMinDimensions input");

    const width = this.fmtText.width;
    const height = this.fmtText.height;

    const result = { width: width, height: height };

    console.log("B.Text.Formatter: GetFormatTextMinDimensions output:", result);
    return result;
  }

  SetHyperlink(url: string, startOffset: number, length: number) {
    console.log("B.Text.Formatter: SetHyperlink input:", { url, startOffset, length });

    let hyperlinkRange, formatRange, currentHyperlink, endOffset, isExtended = false;

    if (startOffset == null) {
      startOffset = 0;
    } else if (startOffset >= this.rtData.text.length) {
      startOffset = this.rtData.text.length - 1;
    }

    endOffset = (length == null || startOffset + length > this.rtData.text.length) ? this.rtData.text.length : startOffset + length;

    currentHyperlink = this.GetHyperlinkAtOffset(startOffset);
    if (currentHyperlink) {
      formatRange = this.GetFormatRangeAtIndex({ hyperlink: currentHyperlink.id }, startOffset);
      startOffset = formatRange.start;
      if (formatRange.end >= endOffset) {
        endOffset = formatRange.end + 1;
        isExtended = true;
      }
    }

    if (endOffset > startOffset + 1 && !isExtended) {
      currentHyperlink = this.GetHyperlinkAtOffset(endOffset - 1);
      if (currentHyperlink) {
        formatRange = this.GetFormatRangeAtIndex({ hyperlink: currentHyperlink.id }, endOffset - 1);
        endOffset = formatRange.end + 1;
      }
    }

    if (startOffset == endOffset) {
      hyperlinkRange = this.GetWordAtIndex(startOffset);
      startOffset = hyperlinkRange.start;
      endOffset = hyperlinkRange.end;
    }

    if (startOffset == endOffset) {
      endOffset++;
    }

    for (let i = startOffset; i < endOffset; i++) {
      let style = this.GetFormatAtOffset(i).style;
      if (style.hyperlink >= 0) {
        this.RemoveHyperlink(style.hyperlink);
      }
    }

    let hyperlinkId = this.rtData.hyperlinks.length;
    this.rtData.hyperlinks.push(url);
    length = endOffset - startOffset;
    this.SetFormat({ hyperlink: hyperlinkId }, startOffset, length);

    console.log("B.Text.Formatter: SetHyperlink output:", { url, startOffset, length });
  }

  GetHyperlinkAtOffset(offset: number) {
    console.log("B.Text.Formatter: GetHyperlinkAtOffset input:", offset);

    const format = this.GetFormatAtOffset(offset).style;
    let result = null;

    if (format.hyperlink !== undefined && format.hyperlink >= 0 && format.hyperlink < this.rtData.hyperlinks.length) {
      result = {
        url: this.rtData.hyperlinks[format.hyperlink],
        id: format.hyperlink
      };
    }

    console.log("B.Text.Formatter: GetHyperlinkAtOffset output:", result);
    return result;
  }

  GetHyperlinkAtPoint(point) {
    console.log("B.Text.Formatter: GetHyperlinkAtPoint input:", point);

    let lineIndex, runIndex, styleIndex = -1;

    if (point.y < 0 || point.y > this.fmtText.height) {
      console.log("B.Text.Formatter: GetHyperlinkAtPoint output:", null);
      return null;
    }

    for (lineIndex = 0; lineIndex < this.renderedLines.length; lineIndex++) {
      if (point.y >= this.renderedLines[lineIndex].top && point.y <= this.renderedLines[lineIndex].bottom) {
        if (point.x < this.renderedLines[lineIndex].left || point.x > this.renderedLines[lineIndex].right) {
          break;
        }
        for (runIndex = 0; runIndex < this.renderedLines[lineIndex].runs.length; runIndex++) {
          if (point.x <= this.renderedLines[lineIndex].runs[runIndex].right) {
            styleIndex = this.renderedLines[lineIndex].runs[runIndex].runRec.style;
            break;
          }
        }
        break;
      }
    }

    let result = null;
    if (styleIndex >= 0) {
      const hyperlinkId = this.fmtText.styles[styleIndex].hyperlink;
      if (hyperlinkId !== undefined && hyperlinkId >= 0 && hyperlinkId < this.rtData.hyperlinks.length) {
        result = {
          url: this.rtData.hyperlinks[hyperlinkId],
          id: hyperlinkId
        };
      }
    }

    console.log("B.Text.Formatter: GetHyperlinkAtPoint output:", result);
    return result;
  }

  ClearHyperlink(offset: number) {
    console.log("B.Text.Formatter: ClearHyperlink input:", offset);

    const hyperlink = this.GetHyperlinkAtOffset(offset);
    if (hyperlink) {
      this.RemoveHyperlink(hyperlink.id);
      this.fmtText = this.CalcFromRuntime(this.rtData, this.limits);
    }

    console.log("B.Text.Formatter: ClearHyperlink output:", this.fmtText);
  }

  RemoveHyperlink(hyperlinkIndex: number) {
    console.log("B.Text.Formatter: RemoveHyperlink input:", hyperlinkIndex);

    if (hyperlinkIndex >= 0 && hyperlinkIndex < this.rtData.hyperlinks.length) {
      this.rtData.hyperlinks.splice(hyperlinkIndex, 1);

      for (let i = 0; i < this.rtData.styles.length; i++) {
        if (this.rtData.styles[i].hyperlink === hyperlinkIndex) {
          this.rtData.styles[i].hyperlink = -1;
        } else if (this.rtData.styles[i].hyperlink > hyperlinkIndex) {
          this.rtData.styles[i].hyperlink--;
        }
      }
    }

    console.log("B.Text.Formatter: RemoveHyperlink output:", this.rtData.hyperlinks);
  }

  SetHyperlinkCursor() {
    console.log("B.Text.Formatter: SetHyperlinkCursor input");

    let lineIndex, runIndex, styleIndex, element;

    for (lineIndex = 0; lineIndex < this.renderedLines.length; lineIndex++) {
      for (runIndex = 0; runIndex < this.renderedLines[lineIndex].runs.length; runIndex++) {
        styleIndex = this.renderedLines[lineIndex].runs[runIndex].runRec.style;
        if (this.rtData.styles[styleIndex].hyperlink >= 0) {
          element = this.renderedLines[lineIndex].runs[runIndex].elem;
          if (element) {
            element.node.setAttribute('class', Instance.Basic.Element.CursorType.POINTER);
          }
        }
      }
    }

    console.log("B.Text.Formatter: SetHyperlinkCursor output");
  }

  RenderFormattedText(e, t) {
    //'use strict';
    var a,
      r,
      i,
      n,
      o,
      s,
      l,
      S,
      c,
      u,
      p,
      d,
      D = [],
      g = [],
      h = e.parent;
    for (
      h &&
      (d = e.position(), h.remove(e)),
      e.clear(),
      e.attr('xml:space', 'preserve'),
      this.renderedLines = [],
      this.renderedDataFields = [],
      t.clear(),
      this.fmtText.paragraphs.forEach(
        (
          function (d, h) {
            s = null,
              'none' != d.pStyle.bullet &&
              d.bindent &&
              (
                s = {
                  bullet: d.pStyle.bullet,
                  xPos: 0,
                  yPos: d.yOffset,
                  indent: d.bindent,
                  height: d.height,
                  ascent: d.height / 2,
                  hasText: !1,
                  style: this.GetBulletStyle(h)
                }
              ),
              d.lines.forEach(
                (
                  function (t, m) {
                    switch (
                    i = 0,
                    n = t.width + d.bindent,
                    l = this.fmtText.fmtWidth - (t.indent + d.pStyle.rindent),
                    d.pStyle.just
                    ) {
                      case 'center':
                        i = (l - n) / 2;
                        break;
                      case 'right':
                        i = l - n
                    }
                    for (
                      i += t.indent,
                      s &&
                      0 === m &&
                      (s.xPos = i, s.yPos = t.yOffset, s.ascent = t.ascent),
                      i += t.bindent,
                      o = {
                        paraIndex: h,
                        lineIndex: m,
                        lineRec: t,
                        left: i,
                        right: i,
                        top: t.yOffset,
                        bottom: t.yOffset + t.height,
                        dispStart: t.start,
                        pStyle: d.pStyle,
                        runs: []
                      },
                      c = 0;
                      c < t.spErrors.length;
                      c++
                    ) g.push({
                      x: i + t.spErrors[c].startPos,
                      y: t.yOffset + t.ascent,
                      width: t.spErrors[c].endPos - t.spErrors[c].startPos
                    });
                    for (c = 0; c < t.dataFields.length; c++) this.renderedDataFields.push({
                      x: i + t.dataFields[c].startPos,
                      y: t.yOffset,
                      width: t.dataFields[c].endPos - t.dataFields[c].startPos,
                      height: t.height,
                      fieldID: t.dataFields[c].fieldID
                    });
                    t.runs.forEach(
                      (
                        function (n, l) {
                          s &&
                            (s.hasText = n.width > 0),
                            u = null,
                            p = null,
                            a = this.fmtText.styles[n.style],
                            r = this.fmtText.text.substr(n.dispStart, n.dispLen);
                          var c = !1,
                            d = this.parent.dataStyleOverride ||
                            {
                            };
                          d._curFieldDecoration = null,
                            d._curFieldStyle = null,
                            n.dispLen > 0 &&
                            !n.isTab &&
                            (
                              a.dataField &&
                              (d._curFieldStyle = this.parent.GetDataStyle(a.dataField)),
                              (
                                u = Formatter.CreateTextRunElem(r, a, this.parent.doc, this.parent.linksDisabled, d)
                              ).attr('x', Utils1.RoundCoord(i)),
                              u.attr('text-anchor', 'start'),
                              u.attr(
                                'y',
                                Utils1.RoundCoord(t.yOffset + t.ascent + n.extraYOffset)
                              ),
                              u.attr('textLength', n.dispWidth),
                              this.parent.linksDisabled ||
                              (
                                this.AttachHyperlinkToRun(u, a) ||
                                (a.hyperlink = - 1),
                                c = a.hyperlink >= 0
                              ),
                              e.add(u),
                              p = this.parent.doc.GetTextRunCache(a, r)
                            ),
                            ('underline' == (d._curFieldDecoration || a.decoration) || c) &&
                            n.extraYOffset <= 0 &&
                            (
                              S = c ? '#0000FF' : a.color,
                              D.push({
                                x: i,
                                y: t.yOffset + t.ascent,
                                width: n.width,
                                color: S
                              })
                            ),
                            o.runs.length ||
                            (o.dispStart = n.dispStart),
                            o.runs.push({
                              runIndex: l,
                              runRec: n,
                              left: i,
                              right: i + n.width,
                              isTab: n.isTab,
                              elem: u,
                              cache: p
                            }),
                            i += n.width
                        }
                      ),
                      this
                    ),
                      o.right = i,
                      this.renderedLines.push(o)
                  }
                ),
                this
              ),
              s &&
              s.hasText &&
              this.RenderBullet(s, t)
          }
        ),
        this
      ),
      c = 0;
      c < D.length;
      c++
    ) this.RenderUnderline(D[c], t);
    if (this.SpellCheckValid()) for (c = 0; c < g.length; c++) this.RenderSpellError(g[c], t);
    this.parent.IsActive() &&
      this.RenderDataFieldHilites(t),
      h &&
      h.add(e, d)
  }

  AttachHyperlinkToRun(element, style) {
    console.log("B.Text.Formatter: AttachHyperlinkToRun input:", { element, style });

    if (style.hyperlink !== undefined && style.hyperlink >= 0 && style.hyperlink < this.fmtText.hyperlinks.length) {
      const hyperlink = this.fmtText.hyperlinks[style.hyperlink];
      const resolvedHyperlink = Utils1.ResolveHyperlinkForDisplay(hyperlink);
      const actualHyperlink = Utils1.ResolveHyperlink(hyperlink);

      if (actualHyperlink) {
        element.node.setAttribute('_explink_', actualHyperlink);
        Instance.Basic.Element.SetTooltipOnElement(element, resolvedHyperlink);
        console.log("B.Text.Formatter: AttachHyperlinkToRun output:", true);
        return true;
      }
    }

    console.log("B.Text.Formatter: AttachHyperlinkToRun output:", false);
    return false;
  }

  RenderUnderline(underline, formattingLayer) {
    console.log("B.Text.Formatter: RenderUnderline input:", { underline, formattingLayer });

    const path = new HvacSVG.Path();
    const startX = Utils1.RoundCoord(underline.x);
    const startY = Utils1.RoundCoord(underline.y) + 2;
    const width = Utils1.RoundCoord(underline.width);

    path.plot(`M${startX},${startY}h${width}`);
    path.attr('stroke-width', 1);
    path.attr('stroke', underline.color);
    path.attr('fill', 'none');

    formattingLayer.add(path);

    console.log("B.Text.Formatter: RenderUnderline output");
  }

  RenderSpellError(spellError, formattingLayer) {
    console.log("B.Text.Formatter: RenderSpellError input:", { spellError, formattingLayer });

    const path = new HvacSVG.Path();
    let x = spellError.x;
    let y = spellError.y + 2;
    let direction = 1;
    const endX = x + spellError.width;
    let pathData = `M${x},${y + direction}`;

    while (x < endX) {
      pathData += `L${(x += 2)},${(y += (direction = -direction))}`;
    }

    path.plot(pathData);
    path.attr('stroke-width', 1);
    path.attr('stroke-opacity', 0.7);
    path.attr('stroke', '#FF0000');
    path.attr('fill', 'none');
    path.node.setAttribute('no-export', '1');
    formattingLayer.add(path);

    console.log("B.Text.Formatter: RenderSpellError output");
  }

  RenderDataFieldHilites(formattingLayer) {
    console.log("B.Text.Formatter: RenderDataFieldHilites input:", formattingLayer);

    let dataField, tooltipText, rectElement;

    if (this.renderedDataFields) {
      this.ClearDataFieldHilites(formattingLayer);
      for (let i = 0; i < this.renderedDataFields.length; i++) {
        dataField = this.renderedDataFields[i];
        tooltipText = this.parent.GetDataText(dataField.fieldID, true);
        rectElement = new HvacSVG.Container(HvacSVG.create('rect'));
        rectElement.move(dataField.x, dataField.y);
        rectElement.size(dataField.width, dataField.height);
        rectElement.attr('fill', '#A6F8CD');
        rectElement.attr('stroke-width', 0);
        rectElement.attr('fill-opacity', 0.4);
        rectElement.attr('pointer-events', 'fill');
        rectElement.node.setAttribute('no-export', '1');
        Instance.Basic.Element.SetTooltipOnElement(rectElement, tooltipText);
        formattingLayer.add(rectElement);
        dataField.elem = rectElement;
      }
    }

    console.log("B.Text.Formatter: RenderDataFieldHilites output");
  }

  ClearDataFieldHilites(formattingLayer) {
    console.log("B.Text.Formatter: ClearDataFieldHilites input:", formattingLayer);

    if (this.renderedDataFields) {
      for (let i = 0; i < this.renderedDataFields.length; i++) {
        const element = this.renderedDataFields[i].elem;
        if (element) {
          formattingLayer.remove(element);
          this.renderedDataFields[i].elem = null;
        }
      }
    }

    console.log("B.Text.Formatter: ClearDataFieldHilites output");
  }

  RenderBullet(bulletInfo, formattingLayer) {
    console.log("B.Text.Formatter: RenderBullet input:", { bulletInfo, formattingLayer });

    let shape, path, size, color, isFilled = false, isStroked = false;
    const halfIndent = Math.max(4, bulletInfo.indent / 2);
    color = bulletInfo.style.color;

    switch (bulletInfo.bullet) {
      case 'hround':
        shape = this.parent.doc.CreateShape(ConstantData.CreateShapeType.OVAL).SetSize(halfIndent, halfIndent);
        isStroked = true;
        break;
      case 'sround':
        shape = this.parent.doc.CreateShape(ConstantData.CreateShapeType.OVAL).SetSize(halfIndent, halfIndent);
        isFilled = true;
        break;
      case 'hsquare':
        shape = this.parent.doc.CreateShape(ConstantData.CreateShapeType.RECT).SetSize(halfIndent, halfIndent);
        isStroked = true;
        break;
      case 'ssquare':
        shape = this.parent.doc.CreateShape(ConstantData.CreateShapeType.RECT).SetSize(halfIndent, halfIndent);
        isFilled = true;
        break;
      case 'diamond':
        shape = this.parent.doc.CreateShape(ConstantData.CreateShapeType.POLYGON).SetPoints([
          { x: halfIndent / 2, y: 0 },
          { x: halfIndent, y: halfIndent / 2 },
          { x: halfIndent / 2, y: halfIndent },
          { x: 0, y: halfIndent / 2 }
        ]);
        isFilled = true;
        break;
      case 'chevron':
        shape = this.parent.doc.CreateShape(ConstantData.CreateShapeType.POLYGON).SetPoints([
          { x: 0, y: 0 },
          { x: halfIndent, y: halfIndent / 2 },
          { x: 0, y: halfIndent },
          { x: halfIndent / 2, y: halfIndent / 2 }
        ]);
        isFilled = true;
        break;
      case 'check':
        shape = this.parent.doc.CreateShape(ConstantData.CreateShapeType.POLYLINE).SetPoints([
          { x: 0, y: halfIndent - halfIndent / 4 },
          { x: halfIndent / 4, y: halfIndent },
          { x: halfIndent, y: 0 }
        ]);
        isStroked = true;
        break;
      case 'plus':
        path = this.parent.doc.CreateShape(ConstantData.CreateShapeType.PATH).PathCreator();
        path.MoveTo(0, halfIndent / 2).LineTo(halfIndent, halfIndent / 2);
        path.MoveTo(halfIndent / 2, 0).LineTo(halfIndent / 2, halfIndent);
        path.Apply();
        shape = path;
        isStroked = true;
        break;
    }

    if (shape) {
      const xOffset = (bulletInfo.indent - halfIndent) / 2;
      const yOffset = halfIndent < bulletInfo.ascent ? bulletInfo.ascent - halfIndent : halfIndent < bulletInfo.height ? 0 : (bulletInfo.height - halfIndent) / 2;
      shape.SetPos(bulletInfo.xPos + xOffset, bulletInfo.yPos + yOffset);
      isFilled ? shape.SetFillColor(color) : shape.SetFillColor('none');
      isStroked ? shape.SetStrokeColor(color).SetStrokeWidth(1) : shape.SetStrokeColor('none').SetStrokeWidth(0);
      formattingLayer.add(shape.svgObj);
    }

    console.log("B.Text.Formatter: RenderBullet output");
  }

  SetRuntimeCharFormat(charIndex: number, format: any, apply: boolean): number {
    console.log("B.Text.Formatter: SetRuntimeCharFormat input:", { charIndex, format, apply });

    let currentStyle = this.GetFormatAtOffset(charIndex).style;
    let mergedStyle = this.MergeStyles(format, currentStyle);
    let styleIndex = this.FindAddStyle(mergedStyle);

    if (apply) {
      this.rtData.charStyles[charIndex] = styleIndex;
    }

    console.log("B.Text.Formatter: SetRuntimeCharFormat output:", styleIndex);
    return styleIndex;
  }

  CalcFromRuntime(runtimeData, limits) {
    console.log("B.Text.Formatter: CalcFromRuntime input:", { runtimeData, limits });

    let formattedText = new DefaultFmtText();
    let maxWidth = limits ? limits.maxWidth : 0;
    let minWidth = limits ? limits.minWidth : 0;
    let currentYOffset = 0;
    let formattingLayer = null;

    formattedText.text = String(runtimeData.text);
    runtimeData.styles.forEach(style => {
      formattedText.styles.push(style);
    });
    formattedText.hyperlinks = Utils1.CopyObj(runtimeData.hyperlinks);

    if (!maxWidth) {
      maxWidth = 32000;
    }
    formattedText.fmtWidth = minWidth;

    if (this.renderingEnabled) {
      let bulletIndent = Math.max(this.GetBulletIndent(), 8);
      formattedText.width = 0;
      formattedText.dispMinWidth = 0;

      runtimeData.styleRuns.forEach((styleRun, index) => {
        let paragraph = {
          pStyle: Utils1.CopyObj(styleRun.pStyle),
          width: 0,
          height: 0,
          start: styleRun.start,
          length: styleRun.nChars,
          bindent: 0,
          yOffset: currentYOffset,
          dispMinWidth: 0,
          lines: []
        };

        let bulletWidth = 0;
        if (paragraph.pStyle.bullet && paragraph.pStyle.bullet !== 'none') {
          bulletWidth = bulletIndent;
        }
        let halfBulletWidth = bulletWidth / 2 + 2;
        paragraph.bindent = bulletWidth;

        if (!formattingLayer) {
          formattingLayer = new HvacSVG.Container(HvacSVG.create('text'));
          formattingLayer.attr('xml:space', 'preserve');
          formattingLayer.attr('fill-opacity', 0);
          this.parent.doc.GetFormattingLayer().svgObj.add(formattingLayer);
        }

        let paragraphRunMetrics = this.CalcParagraphRunMetrics(runtimeData, styleRun, formattingLayer, this.parent.doc.GetFormattingLayer());
        let nextRunInfo = null;

        do {
          let indent = paragraph.lines.length ? paragraph.pStyle.lindent : paragraph.pStyle.pindent;
          if (bulletWidth) {
            indent = 0;
          }
          let availableWidth = maxWidth - (bulletWidth + paragraph.pStyle.rindent + indent);
          let lineForDisplay = this.BuildLineForDisplay(paragraphRunMetrics, availableWidth, nextRunInfo, paragraph.pStyle);

          if (lineForDisplay.runs.length) {
            let line = {
              width: 0,
              height: 0,
              start: styleRun.start,
              length: 0,
              bindent: paragraph.bindent,
              indent: indent,
              yOffset: currentYOffset,
              ascent: 0,
              descent: 0,
              dispMinWidth: 0,
              runs: [],
              spErrors: [],
              dataFields: []
            };

            indent += bulletWidth;
            if (paragraph.lines.length) {
              line.start = lineForDisplay.runs[0].start;
            }

            lineForDisplay.runs.forEach(run => {
              let source = run.source;
              delete run.source;
              line.runs.push(run);

              if (runtimeData.spErrors && source && run.extraYOffset <= 0 && !run.isTab) {
                runtimeData.spErrors.forEach(spError => {
                  let start = spError.startIndex;
                  let end = spError.startIndex + spError.nChars - 1;
                  if (start < run.dispStart + run.dispLen && end >= run.dispStart) {
                    let error = {
                      startIndex: Math.max(start, run.dispStart),
                      endIndex: Math.min(end, run.dispStart + run.dispLen - 1),
                      startPos: 0,
                      endPos: 0
                    };
                    let startPos = error.startIndex - run.start + source.startRunChar;
                    error.startPos = line.width + Formatter.GetRunPositionForChar(source.runElem.node, startPos, true, source.cache);
                    let endPos = error.endIndex - run.start + source.startRunChar;
                    error.endPos = line.width + Formatter.GetRunPositionForChar(source.runElem.node, endPos, false, source.cache);
                    line.spErrors.push(error);
                  }
                });
              }

              if (runtimeData.dataFields && source && !run.isTab) {
                runtimeData.dataFields.forEach(dataField => {
                  let start = dataField.startIndex;
                  let end = dataField.startIndex + dataField.nChars - 1;
                  if (start < run.dispStart + run.dispLen && end >= run.dispStart) {
                    let field = {
                      fieldID: dataField.fieldID,
                      startIndex: Math.max(start, run.dispStart),
                      endIndex: Math.min(end, run.dispStart + run.dispLen - 1),
                      startPos: 0,
                      endPos: 0
                    };
                    let startPos = field.startIndex - run.start + source.startRunChar;
                    field.startPos = line.width + Formatter.GetRunPositionForChar(source.runElem.node, startPos, true, source.cache);
                    let endPos = field.endIndex - run.start + source.startRunChar;
                    field.endPos = line.width + Formatter.GetRunPositionForChar(source.runElem.node, endPos, false, source.cache);
                    line.dataFields.push(field);
                  }
                });
              }

              line.descent = Math.max(line.descent, run.descent);
              line.ascent = Math.max(line.ascent, run.ascent);
              line.length += run.length;
              line.width += run.width;
              line.dispMinWidth += run.dispMinWidth;
            });

            line.height = line.ascent + line.descent;
            if (index < runtimeData.styleRuns.length - 1 || (lineForDisplay.nextRunInfo && lineForDisplay.runs.length)) {
              if (paragraph.pStyle.spacing < 0) {
                let extraSpacing = -paragraph.pStyle.spacing - line.height;
                if (extraSpacing > 0) {
                  line.height += extraSpacing;
                }
              } else {
                line.height += line.height * paragraph.pStyle.spacing;
              }
            }

            paragraph.width = Math.max(paragraph.width, line.width + indent);
            paragraph.dispMinWidth = Math.max(paragraph.dispMinWidth, line.dispMinWidth + indent);
            paragraph.height += line.height;
            currentYOffset += line.height;
            paragraph.lines.push(line);
          }

          nextRunInfo = lineForDisplay.nextRunInfo;
        } while (nextRunInfo && lineForDisplay.runs.length);

        this.parent.doc.GetFormattingLayer().svgObj.remove(formattingLayer);
        formattedText.height += paragraph.height;

        if (bulletWidth > 0 && paragraph.lines.length && paragraph.height < halfBulletWidth) {
          let extraHeight = (halfBulletWidth - paragraph.height) / 2;
          paragraph.lines.forEach(line => {
            line.yOffset += extraHeight;
          });
          currentYOffset += halfBulletWidth - paragraph.height;
          formattedText.height += halfBulletWidth - paragraph.height;
        }

        formattedText.paragraphs.push(paragraph);
        formattedText.width = Math.max(formattedText.width, paragraph.width);
        formattedText.dispMinWidth = Math.max(formattedText.dispMinWidth, paragraph.dispMinWidth);
      });

      formattedText.fmtWidth = Math.max(formattedText.fmtWidth, formattedText.width);
    } else {
      this.deferredRenderNeeded = true;
    }

    console.log("B.Text.Formatter: CalcFromRuntime output:", formattedText);
    return formattedText;
  }

  BuildLineForDisplay(paragraphRunMetrics, availableWidth, nextRunInfo, paragraphStyle) {
    console.log("B.Text.Formatter: BuildLineForDisplay input:", { paragraphRunMetrics, availableWidth, nextRunInfo, paragraphStyle });

    let currentRunIndex = 0;
    let currentCharIndex = 0;
    let currentPos = 0;
    let lineWidth = 0;
    let lineHeight = 0;
    let isInitialRun = !nextRunInfo;

    if (nextRunInfo) {
      currentRunIndex = nextRunInfo.curRun || 0;
      currentCharIndex = nextRunInfo.curChar || 0;
      currentPos = nextRunInfo.curPos || 0;

      if (currentCharIndex < paragraphRunMetrics[currentRunIndex].startDispIndex) {
        currentCharIndex = paragraphRunMetrics[currentRunIndex].startDispIndex;
      }
      if (currentPos < paragraphRunMetrics[currentRunIndex].startDispPos) {
        currentPos = paragraphRunMetrics[currentRunIndex].startDispPos;
      }
      nextRunInfo = null;
    }

    const line = {
      runs: [],
      nextRunInfo: null
    };

    const breakInfo = {
      runIndex: -1,
      startChar: 0,
      endChar: 0,
      startPos: 0,
      endPos: 0,
      isRunEnd: false,
      breakRec: null
    };

    while (currentRunIndex < paragraphRunMetrics.length) {
      const runMetrics = paragraphRunMetrics[currentRunIndex];
      const runWidth = Math.max(runMetrics.endDispPos - currentPos, 0);

      if (runWidth > availableWidth) {
        break;
      }

      const run = {
        width: Math.min(runMetrics.width - currentPos, availableWidth),
        height: runMetrics.runRT.metrics.height,
        start: runMetrics.startIndex + currentCharIndex,
        length: runMetrics.nChars - currentCharIndex,
        dispStart: runMetrics.startIndex + currentCharIndex,
        dispLen: Math.max(runMetrics.endDispIndex - currentCharIndex, 0),
        dispWidth: runWidth,
        dispMinWidth: runWidth,
        space: runMetrics.runRT.metrics.width,
        ascent: runMetrics.runRT.metrics.ascent,
        descent: runMetrics.runRT.metrics.descent,
        extraYOffset: runMetrics.runRT.metrics.extraYOffset,
        isTab: runMetrics.isTab,
        style: runMetrics.runRT.style,
        source: {
          runElem: runMetrics.runElem,
          cache: runMetrics.cache,
          startRunChar: currentCharIndex,
          startRunPos: currentPos
        }
      };

      if (run.isTab && paragraphStyle.tabspace > 0) {
        const tabStop = lineHeight - lineHeight % paragraphStyle.tabspace;
        run.width = tabStop + paragraphStyle.tabspace * run.length - lineHeight;
      }

      if (runMetrics.hasCR) {
        run.length++;
      }

      if (run.width > 0) {
        const lastBreak = runMetrics.breaks[runMetrics.breaks.length - 1];
        if (lastBreak && lastBreak.startIndex >= currentCharIndex) {
          breakInfo.runIndex = line.runs.length;
          breakInfo.startChar = lastBreak.startIndex - currentCharIndex;
          breakInfo.endChar = lastBreak.endIndex - currentCharIndex;
          breakInfo.startPos = lastBreak.startPos - currentPos;
          breakInfo.endPos = lastBreak.endPos - currentPos;
          breakInfo.breakRec = lastBreak;
          breakInfo.rtRunIndex = currentRunIndex;
          breakInfo.rtRunPos = currentPos;
          breakInfo.rtRunChar = currentCharIndex;
          breakInfo.isRunEnd = lastBreak.endIndex === runMetrics.nChars;
        }
        line.runs.push(run);
      }

      availableWidth -= run.width;
      lineHeight += run.width;
      currentRunIndex++;
      currentPos = 0;
      currentCharIndex = 0;
    }

    if (currentRunIndex < paragraphRunMetrics.length) {
      nextRunInfo = {
        curRun: currentRunIndex,
        curChar: currentCharIndex,
        curPos: currentPos
      };

      if (availableWidth > 0) {
        const runMetrics = paragraphRunMetrics[currentRunIndex];
        let run = null;

        for (let i = runMetrics.breaks.length - 1; i >= 0; i--) {
          const breakRec = runMetrics.breaks[i];
          if (breakRec.startPos - currentPos <= availableWidth) {
            nextRunInfo.curChar = breakRec.endIndex;
            nextRunInfo.curPos = breakRec.endPos;

            run = {
              width: Math.min(nextRunInfo.curPos - currentPos, availableWidth),
              height: runMetrics.runRT.metrics.height,
              start: runMetrics.startIndex + currentCharIndex,
              length: nextRunInfo.curChar - currentCharIndex,
              dispStart: runMetrics.startIndex + currentCharIndex,
              dispLen: breakRec.startIndex - currentCharIndex,
              dispWidth: breakRec.startPos - currentPos,
              dispMinWidth: breakRec.startPos - currentPos,
              space: runMetrics.runRT.metrics.width,
              ascent: runMetrics.runRT.metrics.ascent,
              descent: runMetrics.runRT.metrics.descent,
              extraYOffset: runMetrics.runRT.metrics.extraYOffset,
              isTab: runMetrics.isTab,
              style: runMetrics.runRT.style,
              source: {
                runElem: runMetrics.runElem,
                cache: runMetrics.cache,
                startRunChar: currentCharIndex,
                startRunPos: currentPos
              }
            };
            line.runs.push(run);
            break;
          }
        }

        if (!run) {
          if (breakInfo.runIndex >= 0) {
            if (!breakInfo.isRunEnd) {
              while (line.runs.length > breakInfo.runIndex + 1) {
                line.runs.pop();
              }
              run = line.runs[breakInfo.runIndex];
              run.width = breakInfo.endPos;
              run.length = breakInfo.endChar;
              run.dispLen = breakInfo.startChar;
              run.dispWidth = breakInfo.startPos;
              run.dispMinWidth = breakInfo.startPos;
              nextRunInfo.curRun = breakInfo.rtRunIndex;
              nextRunInfo.curChar = breakInfo.endChar + breakInfo.rtRunChar;
              nextRunInfo.curPos = breakInfo.endPos + breakInfo.rtRunPos;
            }
          } else {
            run = {
              width: 0,
              height: runMetrics.runRT.metrics.height,
              start: runMetrics.startIndex + currentCharIndex,
              length: 0,
              dispStart: runMetrics.startIndex + currentCharIndex,
              dispLen: 0,
              dispWidth: 0,
              dispMinWidth: 0,
              space: runMetrics.runRT.metrics.width,
              ascent: runMetrics.runRT.metrics.ascent,
              descent: runMetrics.runRT.metrics.descent,
              extraYOffset: runMetrics.runRT.metrics.extraYOffset,
              isTab: runMetrics.isTab,
              style: runMetrics.runRT.style,
              source: {
                runElem: runMetrics.runElem,
                cache: runMetrics.cache,
                startRunChar: currentCharIndex,
                startRunPos: currentPos
              }
            };

            let charPos = 0;
            while (currentCharIndex < runMetrics.nChars && charPos < availableWidth) {
              charPos = Formatter.GetRunPositionForChar(runMetrics.runElem.node, currentCharIndex, false, runMetrics.cache) - currentPos;
              if (charPos <= availableWidth || !line.runs.length && !run.length) {
                run.width = charPos;
                run.dispWidth = charPos;
                run.dispMinWidth = charPos;
                run.length++;
                run.dispLen++;
                currentCharIndex++;
                nextRunInfo.curChar++;
                nextRunInfo.curPos = currentPos + charPos;
              }
            }

            if (run.length) {
              line.runs.push(run);
            }
          }
        }
      }
    } else if (paragraphRunMetrics.length > 0 && !line.runs.length && isInitialRun) {
      const runMetrics = paragraphRunMetrics[0];
      const run = {
        width: 0,
        height: runMetrics.runRT.metrics.height,
        start: runMetrics.startIndex,
        length: 0,
        dispStart: runMetrics.startIndex,
        dispLen: 0,
        dispWidth: 0,
        dispMinWidth: 0,
        space: runMetrics.runRT.metrics.width,
        ascent: runMetrics.runRT.metrics.ascent,
        descent: runMetrics.runRT.metrics.descent,
        extraYOffset: runMetrics.runRT.metrics.extraYOffset,
        isTab: runMetrics.isTab,
        style: runMetrics.runRT.style,
        source: {
          runElem: runMetrics.runElem,
          cache: runMetrics.cache,
          startRunChar: 0,
          startRunPos: 0
        }
      };

      if (runMetrics.hasCR) {
        run.length++;
      }

      line.runs.push(run);
    }

    line.nextRunInfo = nextRunInfo;

    console.log("B.Text.Formatter: BuildLineForDisplay output:", line);
    return line;
  }

  CalcParagraphRunMetrics(runtimeData, styleRun, formattingLayer, docFormattingLayer) {
    console.log("B.Text.Formatter: CalcParagraphRunMetrics input:", { runtimeData, styleRun, formattingLayer, docFormattingLayer });

    const whitespaceRegex = /(\s+)/g;
    const tabRegex = /(\t+)/g;
    let paragraphRunMetrics = [];
    let runSegments = [];

    for (let runIndex = 0; runIndex < styleRun.runs.length; runIndex++) {
      const runStart = styleRun.runs[runIndex].start;
      const runLength = styleRun.runs[runIndex].nChars;
      const runStyle = styleRun.runs[runIndex].style;
      let tabSegments = [];
      let runText = runLength ? runtimeData.text.substr(runStart, runLength) : '';

      let match;
      while ((match = tabRegex.exec(runText)) !== null) {
        tabSegments.push({
          start: match.index,
          end: match.index + match[0].length,
          nChars: match[0].length
        });
      }

      if (tabSegments.length) {
        if (tabSegments[0].start > 0) {
          runSegments.push({
            start: runStart,
            nChars: tabSegments[0].start,
            style: runStyle,
            metrics: styleRun.runs[runIndex].metrics
          });
        }
        for (let segmentIndex = 0; segmentIndex < tabSegments.length; segmentIndex++) {
          runSegments.push({
            start: runStart + tabSegments[segmentIndex].start,
            nChars: tabSegments[segmentIndex].nChars,
            style: runStyle,
            metrics: styleRun.runs[runIndex].metrics,
            isTab: true
          });
          if (tabSegments[segmentIndex].end < runLength) {
            if (segmentIndex < tabSegments.length - 1) {
              runSegments.push({
                start: runStart + tabSegments[segmentIndex].end,
                nChars: tabSegments[segmentIndex + 1].start - tabSegments[segmentIndex].end,
                style: runStyle,
                metrics: styleRun.runs[runIndex].metrics
              });
            } else {
              runSegments.push({
                start: runStart + tabSegments[segmentIndex].end,
                nChars: runLength - tabSegments[segmentIndex].end,
                style: runStyle,
                metrics: styleRun.runs[runIndex].metrics
              });
            }
          }
        }
      } else {
        runSegments.push({
          start: runStart,
          nChars: runLength,
          style: runStyle,
          metrics: styleRun.runs[runIndex].metrics
        });
      }
    }

    for (let segmentIndex = 0; segmentIndex < runSegments.length; segmentIndex++) {
      const segmentStart = runSegments[segmentIndex].start;
      const segmentLength = runSegments[segmentIndex].nChars;
      const segmentStyle = runtimeData.styles[runSegments[segmentIndex].style];
      const hasCarriageReturn = segmentLength && '\n' === runtimeData.text[segmentStart + segmentLength - 1];
      if (hasCarriageReturn) segmentLength--;

      let segmentText = segmentLength ? runtimeData.text.substr(segmentStart, segmentLength) : '';
      let whitespaceBreaks = [];
      let match;
      while ((match = whitespaceRegex.exec(segmentText)) !== null) {
        whitespaceBreaks.push({
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          startPos: 0,
          endPos: 0
        });
      }

      let runMetrics = {
        startIndex: segmentStart,
        endIndex: segmentStart + segmentLength,
        nChars: segmentLength,
        style: segmentStyle,
        breaks: whitespaceBreaks,
        str: segmentText,
        startDispIndex: 0,
        endDispIndex: segmentLength,
        width: 0,
        startDispPos: 0,
        endDispPos: 0,
        hasCR: hasCarriageReturn,
        runRT: runSegments[segmentIndex],
        isTab: runSegments[segmentIndex].isTab
      };

      if (whitespaceBreaks.length && !segmentStyle.dataField) {
        if (whitespaceBreaks[0].startIndex === 0) {
          runMetrics.startDispIndex = whitespaceBreaks[0].endIndex;
        }
        if (whitespaceBreaks[whitespaceBreaks.length - 1].endIndex === segmentLength) {
          runMetrics.endDispIndex = whitespaceBreaks[whitespaceBreaks.length - 1].startIndex;
        }
      }

      let runElement = null;
      let runCache = null;
      if (segmentLength && !runMetrics.isTab) {
        segmentText += '.';
        runElement = Formatter.CreateTextRunElem(segmentText, segmentStyle, this.parent.doc, this.parent.linksDisabled, null);
        runElement.attr('x', 0);
        runElement.attr('text-anchor', 'start');
        runElement.attr('y', 0);
        formattingLayer.add(runElement);
        runCache = this.parent.doc.GetTextRunCache(segmentStyle, segmentText);
      }

      runMetrics.runElem = runElement;
      runMetrics.cache = runCache;
      paragraphRunMetrics.push(runMetrics);
    }

    docFormattingLayer.svgObj.add(formattingLayer);

    for (let runMetricsIndex = 0; runMetricsIndex < paragraphRunMetrics.length; runMetricsIndex++) {
      const runMetrics = paragraphRunMetrics[runMetricsIndex];
      const runElement = runMetrics.runElem;
      if (runElement) {
        const lastCharIndex = runMetrics.endIndex - runMetrics.startIndex - 1;
        const runWidth = Formatter.GetRunPositionForChar(runElement.node, lastCharIndex, false, runMetrics.cache);
        runMetrics.width = runWidth;
        runMetrics.endDispPos = runWidth;

        for (let breakIndex = 0; breakIndex < runMetrics.breaks.length; breakIndex++) {
          const breakInfo = runMetrics.breaks[breakIndex];
          if (breakInfo.startIndex > 0) {
            const startPos = Formatter.GetRunPositionForChar(runElement.node, breakInfo.startIndex, true, runMetrics.cache);
            breakInfo.startPos = startPos;
          }
          if (breakInfo.endIndex === runMetrics.nChars) {
            breakInfo.endPos = runWidth;
          } else {
            const endPos = Formatter.GetRunPositionForChar(runElement.node, breakInfo.endIndex, true, runMetrics.cache);
            breakInfo.endPos = endPos;
          }
          if (breakIndex === 0 && breakInfo.startIndex === 0 && !runMetrics.style.dataField) {
            runMetrics.startDispPos = breakInfo.endPos;
          }
          if (breakIndex === runMetrics.breaks.length - 1 && breakInfo.endIndex === runMetrics.nChars && !runMetrics.style.dataField) {
            runMetrics.endDispPos = breakInfo.startPos;
          }
        }
      }
    }

    console.log("B.Text.Formatter: CalcParagraphRunMetrics output:", paragraphRunMetrics);
    return paragraphRunMetrics;
  }

  GetTextParagraphCount(text: string): number {
    console.log("B.Text.Formatter: GetTextParagraphCount input:", text);

    let paragraphCount = 1;
    const newLineMatches = text.match(/\n/g);

    if (newLineMatches) {
      paragraphCount += newLineMatches.length;
    }

    console.log("B.Text.Formatter: GetTextParagraphCount output:", paragraphCount);
    return paragraphCount;
  }

  MergeParagraphInfo(paragraphStyles, startOffset, length) {
    console.log("B.Text.Formatter: MergeParagraphInfo input:", { paragraphStyles, startOffset, length });

    let startParagraphIndex = this.GetParagraphAtOffset(startOffset);
    let endParagraphIndex = this.GetParagraphAtOffset(startOffset + length);
    let mergedParagraphStyles = [];

    if (startParagraphIndex < 0) {
      startParagraphIndex = 0;
      endParagraphIndex = 0;
    }

    for (let i = 0; i < startParagraphIndex; i++) {
      mergedParagraphStyles.push({
        pStyle: Utils1.CopyObj(this.rtData.styleRuns[i].pStyle)
      });
    }

    let newParagraphStyle = undefined;
    if (startParagraphIndex < this.rtData.styleRuns.length) {
      if (!paragraphStyles.length ||
        startOffset !== this.rtData.styleRuns[startParagraphIndex].start ||
        length < this.rtData.styleRuns[startParagraphIndex].nChars - 1 ||
        (length < this.rtData.styleRuns[startParagraphIndex].nChars && startParagraphIndex === this.rtData.styleRuns.length - 1)) {
        newParagraphStyle = {
          pStyle: Utils1.CopyObj(this.rtData.styleRuns[startParagraphIndex].pStyle)
        };
      }
    }

    if (newParagraphStyle === undefined && paragraphStyles.length > 0) {
      newParagraphStyle = paragraphStyles[0];
    }

    if (newParagraphStyle !== undefined) {
      mergedParagraphStyles.push(newParagraphStyle);
    }

    for (let i = 1; i < paragraphStyles.length; i++) {
      mergedParagraphStyles.push(paragraphStyles[i]);
    }

    for (let i = endParagraphIndex + 1; i < this.rtData.styleRuns.length; i++) {
      mergedParagraphStyles.push({
        pStyle: Utils1.CopyObj(this.rtData.styleRuns[i].pStyle)
      });
    }

    console.log("B.Text.Formatter: MergeParagraphInfo output:", mergedParagraphStyles);
    return mergedParagraphStyles;
  }

  BuildRuntimeRuns(runtimeData, paragraphStyles) {
    console.log("B.Text.Formatter: BuildRuntimeRuns input:", { runtimeData, paragraphStyles });

    let paragraphStartIndices = [];
    let defaultParagraphStyle = this.DefaultPStyle();
    let totalTextLength = runtimeData.text.length;

    paragraphStartIndices.push(0);
    for (let i = 0; i < totalTextLength; i++) {
      if (runtimeData.text[i] === '\n') {
        paragraphStartIndices.push(i + 1);
      }
    }

    runtimeData.styleRuns = [];
    runtimeData.spErrors = [];
    runtimeData.dataFields = [];

    if (this.parent.doc) {
      for (let i = 0; i < paragraphStartIndices.length; i++) {
        let startIndex = paragraphStartIndices[i];
        let charCount = i < paragraphStartIndices.length - 1 ? paragraphStartIndices[i + 1] - startIndex : totalTextLength - startIndex;
        let paragraphStyleIndex = runtimeData.styleRuns.length < paragraphStyles.length ? runtimeData.styleRuns.length : 0;
        let paragraphStyle = paragraphStyles[paragraphStyleIndex] ? paragraphStyles[paragraphStyleIndex].pStyle : defaultParagraphStyle;

        let styleRun = {
          pStyle: Utils1.CopyObj(paragraphStyle),
          runs: [],
          start: startIndex,
          nChars: charCount
        };

        if (this.renderingEnabled) {
          if (charCount) {
            let currentFormat = null;
            let currentSpellError = null;
            let currentDataField = null;

            for (let j = startIndex; j < startIndex + charCount; j++) {
              let formatAtOffset = this.GetFormatAtOffset(j, runtimeData);

              if (currentFormat && this.MatchStylesNoSpell(formatAtOffset.style, currentFormat.style)) {
                styleRun.runs[styleRun.runs.length - 1].nChars++;
              } else {
                let newRun = {
                  style: formatAtOffset.id,
                  start: j,
                  nChars: 1,
                  metrics: this.parent.doc.CalcStyleMetrics(formatAtOffset.style)
                };
                styleRun.runs.push(newRun);
              }

              currentFormat = formatAtOffset;

              if (formatAtOffset.style.spError) {
                if (currentSpellError) {
                  currentSpellError.nChars++;
                } else {
                  currentSpellError = {
                    startIndex: j,
                    nChars: 1
                  };
                  runtimeData.spErrors.push(currentSpellError);
                }
              } else {
                currentSpellError = null;
              }

              if (formatAtOffset.style.dataField) {
                if (currentDataField && currentDataField.fieldID === formatAtOffset.style.dataField) {
                  currentDataField.nChars++;
                } else {
                  currentDataField = {
                    fieldID: formatAtOffset.style.dataField,
                    startIndex: j,
                    nChars: 1
                  };
                  runtimeData.dataFields.push(currentDataField);
                }
              } else {
                currentDataField = null;
              }
            }
          } else {
            let formatAtOffset = this.GetFormatAtOffset(startIndex, runtimeData);
            let newRun = {
              style: formatAtOffset.id,
              start: startIndex,
              nChars: 0,
              metrics: this.parent.doc.CalcStyleMetrics(formatAtOffset.style)
            };
            styleRun.runs.push(newRun);
          }
        } else {
          this.deferredRenderNeeded = true;
        }

        runtimeData.styleRuns.push(styleRun);
      }
    }

    console.log("B.Text.Formatter: BuildRuntimeRuns output:", runtimeData.styleRuns);
  }

  static GetRunPositionForChar(element, charIndex?, isStart?, cache?, offset?) {
    console.log("B.Text.Formatter: GetRunPositionForChar input:", { element, charIndex, isStart, cache, offset });

    if (charIndex < 0) return -1;

    let position;
    offset = offset || 0;

    if (cache && cache.startOffsets && cache.endOffsets && cache.startOffsets.length > charIndex) {
      const offsets = isStart ? cache.startOffsets : cache.endOffsets;
      position = offsets[charIndex];
    }

    if (position === undefined) {
      position = -1;
      try {
        position = (isStart ? element.getStartPositionOfChar(charIndex) : element.getEndPositionOfChar(charIndex)).x - offset;
        if (cache) {
          const offsets = isStart ? cache.startOffsets : cache.endOffsets;
          offsets[charIndex] = position;
        }
      } catch (error) {
        throw error;
      }
    }

    console.log("B.Text.Formatter: GetRunPositionForChar output:", position);
    return position;
  }

  static CalcStyleMetrics(style, doc) {
    console.log("B.Text.Formatter: CalcStyleMetrics input:", { style, doc });

    let tempStyle = null;
    const metrics = { height: 0, width: 0, ascent: 0, descent: 0, extraYOffset: 0 };
    let isSubscript = false;
    let isSuperscript = false;
    const textContainer = new HvacSVG.Container(HvacSVG.create('text'));

    textContainer.attr('xml:space', 'preserve');
    textContainer.attr('text-anchor', 'start');

    const textRunElement = Formatter.CreateTextRunElem(' .', style, doc, false, null);
    textContainer.add(textRunElement);
    textContainer.attr('fill-opacity', 0);

    const formattingLayer = doc.GetFormattingLayer();
    formattingLayer.svgObj.add(textContainer);

    const extent = textContainer.node.getExtentOfChar(0);
    formattingLayer.svgObj.remove(textContainer);

    metrics.height = extent.height;
    metrics.width = extent.width;
    metrics.ascent = -extent.y;
    metrics.descent = metrics.height - metrics.ascent;
    metrics.extraYOffset = 0;

    if (style) {
      isSubscript = style.baseOffset === 'sub';
      isSuperscript = style.baseOffset === 'super';
    }

    if (isSubscript || isSuperscript) {
      tempStyle = Utils1.CopyObj(style);
      tempStyle.baseOffset = undefined;
      const baseMetrics = doc.CalcStyleMetrics(tempStyle);

      if (isSuperscript) {
        const offset = baseMetrics.ascent / 2;
        const totalHeight = offset + metrics.ascent + baseMetrics.descent;
        if (totalHeight > baseMetrics.height) {
          baseMetrics.height = totalHeight;
        }
        metrics.height = baseMetrics.height;
        metrics.ascent = baseMetrics.height - baseMetrics.descent;
        metrics.descent = baseMetrics.descent;
        metrics.extraYOffset = -offset;
      } else {
        const offset = metrics.ascent / 2;
        if (baseMetrics.descent < metrics.descent + offset) {
          baseMetrics.descent = metrics.descent + offset;
        }
        metrics.height = baseMetrics.ascent + baseMetrics.descent;
        metrics.ascent = baseMetrics.ascent;
        metrics.descent = baseMetrics.descent;
        metrics.extraYOffset = offset;
      }
    }

    console.log("B.Text.Formatter: CalcStyleMetrics output:", metrics);
    return metrics;
  }

  static MakeIDFromStyle(style) {
    console.log("B.Text.Formatter: MakeIDFromStyle input:", style);

    const id = (style.font + '_' + style.size + '_' + style.weight + '_' + style.style + '_' + style.baseOffset).replace(/ /g, '');

    console.log("B.Text.Formatter: MakeIDFromStyle output:", id);
    return id;
  }

  GetBulletPIndex() {
    console.log("B.Text.Formatter: GetBulletPIndex input");

    let paragraphIndex = 0;

    if (this.rtData.styleRuns) {
      for (let i = 0; i < this.rtData.styleRuns.length; i++) {
        const paragraphStyle = this.rtData.styleRuns[i].pStyle;
        if (paragraphStyle && paragraphStyle.bullet && paragraphStyle.bullet !== 'none') {
          paragraphIndex = i;
          break;
        }
      }
    }

    console.log("B.Text.Formatter: GetBulletPIndex output:", paragraphIndex);
    return paragraphIndex;
  }

  GetBulletIndent() {
    console.log("B.Text.Formatter: GetBulletIndent input");

    let bulletIndent = 0;
    const bulletParagraphIndex = this.GetBulletPIndex();

    if (this.rtData.styleRuns &&
      bulletParagraphIndex < this.rtData.styleRuns.length &&
      this.rtData.styleRuns[bulletParagraphIndex].runs &&
      this.rtData.styleRuns[bulletParagraphIndex].runs.length) {
      bulletIndent = this.rtData.styleRuns[bulletParagraphIndex].runs[0].metrics.ascent;
    }

    console.log("B.Text.Formatter: GetBulletIndent output:", bulletIndent);
    return bulletIndent;
  }

  GetBulletStyle(paragraphIndex) {
    console.log("B.Text.Formatter: GetBulletStyle input:", paragraphIndex);

    let bulletStyle = new DefaultStyle();

    if (paragraphIndex === undefined || paragraphIndex < 0 || (this.rtData.styleRuns && paragraphIndex >= this.rtData.styleRuns.length)) {
      paragraphIndex = this.GetBulletPIndex();
    }

    if (this.rtData.styleRuns && paragraphIndex < this.rtData.styleRuns.length && this.rtData.styleRuns[paragraphIndex].runs && this.rtData.styleRuns[paragraphIndex].runs.length) {
      const styleIndex = this.rtData.styleRuns[paragraphIndex].runs[0].style;
      bulletStyle = this.rtData.styles[styleIndex];
    }

    console.log("B.Text.Formatter: GetBulletStyle output:", bulletStyle);
    return bulletStyle;
  }

  static CreateTextRunElem(text: string, style: any, doc: any, linksDisabled: boolean, fieldStyleOverride: any) {
    console.log("B.Text.Formatter: CreateTextRunElem input:", { text, style, doc, linksDisabled, fieldStyleOverride });

    let fontSizeMultiplier = 1;
    const tspanElement = new HvacSVG.Container(HvacSVG.create('tspan'));
    let processedText = String(text).replace(/\n/g, '');
    if (!processedText.length) {
      processedText = '.';
    }
    tspanElement.node.textContent = processedText.replace(/ /g, ' ');
    tspanElement.attr('xml:space', 'preserve');
    tspanElement.attr('text-rendering', 'optimizeSpeed');

    let color = style.color;
    let fontWeight = style.weight;
    let fontStyle = style.style;
    let textDecoration = style.decoration;
    const isHyperlink = style.hyperlink >= 0;

    if (fieldStyleOverride) {
      if (fieldStyleOverride.textColor) {
        color = fieldStyleOverride.textColor;
      }
      if (fieldStyleOverride._curFieldStyle) {
        const fieldStyle = fieldStyleOverride._curFieldStyle;
        for (let i = 0; i < fieldStyle.length; i++) {
          switch (fieldStyle[i].name) {
            case 'color':
              color = fieldStyle[i].val;
              break;
            case 'font-weight':
              fontWeight = fieldStyle[i].val;
              break;
            case 'font-style':
              fontStyle = fieldStyle[i].val;
              break;
            case 'text-decoration':
              if (fieldStyle[i].val === 'underline') {
                fieldStyleOverride._curFieldDecoration = fieldStyle[i].val;
                textDecoration = null;
              } else {
                textDecoration = fieldStyle[i].val;
              }
              break;
          }
        }
      }
    }

    if (style) {
      if (style.baseOffset === 'sub' || style.baseOffset === 'super') {
        fontSizeMultiplier = 0.8;
      }
      for (const key in style) {
        switch (key) {
          case 'font':
            if (!style.mappedFont) {
              style.mappedFont = doc.MapFont(style.font, style.type);
            }
            $(tspanElement.node).css('font-family', style.mappedFont);
            break;
          case 'size':
            let fontSize = style[key];
            if (!isNaN(fontSize)) {
              fontSize *= fontSizeMultiplier;
              tspanElement.attr('font-size', fontSize);
            }
            break;
          case 'weight':
            tspanElement.attr('font-weight', fontWeight);
            break;
          case 'style':
            tspanElement.attr('font-style', fontStyle);
            break;
          case 'decoration':
            if (textDecoration) {
              tspanElement.attr('text-decoration', textDecoration);
            }
            break;
          case 'color':
            if (!isHyperlink || linksDisabled) {
              tspanElement.attr('fill', color);
            }
            break;
          case 'colorTrans':
            tspanElement.attr('opacity', style[key]);
            break;
        }
      }
      if (isHyperlink && !linksDisabled) {
        tspanElement.attr('fill', '#0000FF');
      }
    }

    console.log("B.Text.Formatter: CreateTextRunElem output:", tspanElement);
    return tspanElement;
  }

  FindAddStyle(style, skipAdd?) {
    console.log("B.Text.Formatter: FindAddStyle input:", { style, skipAdd });

    let styleIndex = -1;
    const totalStyles = this.rtData.styles.length;

    if (!style) {
      console.log("B.Text.Formatter: FindAddStyle output:", 0);
      return 0;
    }

    for (let i = 0; i < totalStyles; i++) {
      if (this.MatchStyles(style, this.rtData.styles[i])) {
        styleIndex = i;
        break;
      }
    }

    if (styleIndex < 0 && !skipAdd) {
      this.rtData.styles.push(style);
      styleIndex = totalStyles;
    }

    console.log("B.Text.Formatter: FindAddStyle output:", styleIndex);
    return styleIndex;
  }

  TrimUnusedStyles(formattedText) {
    console.log("B.Text.Formatter: TrimUnusedStyles input:", formattedText);

    let charStyleUsage = [];
    let newStyles = [];
    const totalStyles = formattedText.styles.length;
    const totalCharStyles = formattedText.charStyles.length;

    if (totalStyles) {
      charStyleUsage = new Array(totalStyles).fill(false);

      for (let i = 0; i < totalCharStyles; i++) {
        charStyleUsage[formattedText.charStyles[i]] = true;
      }

      for (let i = 0; i < totalStyles; i++) {
        if (charStyleUsage[i]) {
          const newIndex = newStyles.length;
          newStyles.push(formattedText.styles[i]);

          for (let j = 0; j < totalCharStyles; j++) {
            if (formattedText.charStyles[j] === i) {
              formattedText.charStyles[j] = newIndex;
            }
          }
        }
      }

      if (!newStyles.length && formattedText.styles.length > 0) {
        newStyles.push(formattedText.styles[formattedText.styles.length - 1]);
      }

      formattedText.styles = newStyles;
    }

    console.log("B.Text.Formatter: TrimUnusedStyles output:", formattedText);
  }

  MergeStyles(newStyle, baseStyle) {
    console.log("B.Text.Formatter: MergeStyles input:", { newStyle, baseStyle });

    const mergedStyle = {
      font: newStyle.font !== undefined ? newStyle.font : baseStyle.font,
      type: newStyle.type !== undefined ? newStyle.type : baseStyle.type,
      size: newStyle.size !== undefined ? newStyle.size : baseStyle.size,
      weight: newStyle.weight !== undefined ? newStyle.weight : baseStyle.weight,
      style: newStyle.style !== undefined ? newStyle.style : baseStyle.style,
      baseOffset: newStyle.baseOffset !== undefined ? newStyle.baseOffset : baseStyle.baseOffset,
      decoration: newStyle.decoration !== undefined ? newStyle.decoration : baseStyle.decoration,
      spError: newStyle.spError !== undefined ? newStyle.spError : baseStyle.spError,
      color: newStyle.color !== undefined ? newStyle.color : baseStyle.color,
      colorTrans: newStyle.colorTrans !== undefined ? newStyle.colorTrans : baseStyle.colorTrans,
      dataField: newStyle.dataField !== undefined ? newStyle.dataField : baseStyle.dataField,
      hyperlink: newStyle.hyperlink !== undefined ? newStyle.hyperlink : baseStyle.hyperlink
    };

    console.log("B.Text.Formatter: MergeStyles output:", mergedStyle);
    return mergedStyle;
  }

  AndStyles(style1, style2) {
    console.log("B.Text.Formatter: AndStyles input:", { style1, style2 });

    const result = {
      font: style1.font === style2.font ? style1.font : undefined,
      type: style1.type === style2.type ? style1.type : undefined,
      size: style1.size === style2.size ? style1.size : undefined,
      weight: style1.weight === style2.weight ? style1.weight : undefined,
      style: style1.style === style2.style ? style1.style : undefined,
      baseOffset: style1.baseOffset === style2.baseOffset ? style1.baseOffset : undefined,
      decoration: style1.decoration === style2.decoration ? style1.decoration : undefined,
      spError: style1.spError === style2.spError ? style1.spError : undefined,
      color: style1.color === style2.color ? style1.color : undefined,
      colorTrans: style1.colorTrans === style2.colorTrans ? style1.colorTrans : undefined,
      dataField: style1.dataField === style2.dataField ? style1.dataField : undefined,
      hyperlink: style1.hyperlink === style2.hyperlink ? style1.hyperlink : undefined
    };

    console.log("B.Text.Formatter: AndStyles output:", result);
    return result;
  }

  MatchStyles(style1, style2) {
    console.log("B.Text.Formatter: MatchStyles input:", { style1, style2 });

    const result = style1.font === style2.font &&
      style1.type === style2.type &&
      style1.size === style2.size &&
      style1.weight === style2.weight &&
      style1.style === style2.style &&
      style1.baseOffset === style2.baseOffset &&
      style1.decoration === style2.decoration &&
      style1.spError === style2.spError &&
      style1.color === style2.color &&
      style1.colorTrans === style2.colorTrans &&
      style1.dataField === style2.dataField &&
      style1.hyperlink === style2.hyperlink;

    console.log("B.Text.Formatter: MatchStyles output:", result);
    return result;
  }

  MatchStylesNoSpell(style1, style2) {
    console.log("B.Text.Formatter: MatchStylesNoSpell input:", { style1, style2 });

    const result = style1.font === style2.font &&
      style1.type === style2.type &&
      style1.size === style2.size &&
      style1.weight === style2.weight &&
      style1.style === style2.style &&
      style1.baseOffset === style2.baseOffset &&
      style1.decoration === style2.decoration &&
      style1.color === style2.color &&
      style1.colorTrans === style2.colorTrans &&
      style1.dataField === style2.dataField &&
      style1.hyperlink === style2.hyperlink;

    console.log("B.Text.Formatter: MatchStylesNoSpell output:", result);
    return result;
  }

  MatchPartialStyles(style1, style2) {
    console.log("B.Text.Formatter: MatchPartialStyles input:", { style1, style2 });

    const result = !(
      (style1.font !== undefined && style2.font !== undefined && style1.font !== style2.font) ||
      (style1.type !== undefined && style2.type !== undefined && style1.type !== style2.type) ||
      (style1.size !== undefined && style2.size !== undefined && style1.size !== style2.size) ||
      (style1.weight !== undefined && style2.weight !== undefined && style1.weight !== style2.weight) ||
      (style1.style !== undefined && style2.style !== undefined && style1.style !== style2.style) ||
      (style1.baseOffset !== undefined && style2.baseOffset !== undefined && style1.baseOffset !== style2.baseOffset) ||
      (style1.decoration !== undefined && style2.decoration !== undefined && style1.decoration !== style2.decoration) ||
      (style1.spError !== undefined && style2.spError !== undefined && style1.spError !== style2.spError) ||
      (style1.color !== undefined && style2.color !== undefined && style1.color !== style2.color) ||
      (style1.colorTrans !== undefined && style2.colorTrans !== undefined && style1.colorTrans !== style2.colorTrans) ||
      (style1.dataField !== undefined && style2.dataField !== undefined && style1.dataField !== style2.dataField) ||
      (style1.hyperlink !== undefined && style2.hyperlink !== undefined && style1.hyperlink !== style2.hyperlink)
    );

    console.log("B.Text.Formatter: MatchPartialStyles output:", result);
    return result;
  }

  DefaultPStyle() {
    //'use strict';
    return {
      just: 'left',
      bullet: 'none',
      spacing: 0,
      pindent: 0,
      lindent: 0,
      rindent: 0,
      tabspace: 0
    }
  }

  SetDataNameDisplay(isEnabled: boolean) {
    console.log("B.Text.Formatter: SetDataNameDisplay input:", isEnabled);
    this.dataNameEnabled = isEnabled;
    console.log("B.Text.Formatter: SetDataNameDisplay output:", this.dataNameEnabled);
  }

  GetDataNameDisplay() {
    console.log("B.Text.Formatter: GetDataNameDisplay input");

    const dataNameEnabled = this.dataNameEnabled;

    console.log("B.Text.Formatter: GetDataNameDisplay output:", dataNameEnabled);
    return dataNameEnabled;
  }

  GetDataField(position: number) {
    console.log("B.Text.Formatter: GetDataField input:", position);

    if (!this.HasDataFields() || !this.IsDataFieldAtPos(position)) {
      console.log("B.Text.Formatter: GetDataField output:", null);
      return null;
    }

    let dataFieldInfo = null;
    for (let i = 0; i < this.rtData.dataFields.length; i++) {
      const startIndex = this.rtData.dataFields[i].startIndex;
      const endIndex = startIndex + this.rtData.dataFields[i].nChars;

      if (position >= startIndex && position < endIndex) {
        dataFieldInfo = {
          fieldID: this.rtData.dataFields[i].fieldID,
          startPos: startIndex,
          endPos: endIndex
        };
        break;
      }
    }

    console.log("B.Text.Formatter: GetDataField output:", dataFieldInfo);
    return dataFieldInfo;
  }

  IsDataFieldAtPos(position: number): boolean {
    console.log("B.Text.Formatter: IsDataFieldAtPos input:", position);

    const hasDataField = !!this.GetFormatAtOffset(position).style.dataField;

    console.log("B.Text.Formatter: IsDataFieldAtPos output:", hasDataField);
    return hasDataField;
  }

  IsDataFieldInRange(startIndex: number, endIndex: number): boolean {
    console.log("B.Text.Formatter: IsDataFieldInRange input:", { startIndex, endIndex });

    if (!this.HasDataFields()) {
      console.log("B.Text.Formatter: IsDataFieldInRange output:", false);
      return false;
    }

    for (let i = startIndex; i <= endIndex; i++) {
      if (this.IsDataFieldAtPos(i)) {
        console.log("B.Text.Formatter: IsDataFieldInRange output:", true);
        return true;
      }
    }

    console.log("B.Text.Formatter: IsDataFieldInRange output:", false);
    return false;
  }

  HasDataFields() {
    console.log("B.Text.Formatter: HasDataFields input");

    const hasDataFields = this.rtData.dataFields && this.rtData.dataFields.length > 0;

    console.log("B.Text.Formatter: HasDataFields output:", hasDataFields);
    return hasDataFields;
  }

  HasDataField(fieldID: string): boolean {
    console.log("B.Text.Formatter: HasDataField input:", fieldID);

    if (!this.HasDataFields()) {
      console.log("B.Text.Formatter: HasDataField output:", false);
      return false;
    }

    const formattedFieldID = Formatter.FormatDataFieldID(fieldID, false);
    for (let i = 0; i < this.rtData.dataFields.length; i++) {
      if (Formatter.FormatDataFieldID(this.rtData.dataFields[i].fieldID, false) === formattedFieldID) {
        console.log("B.Text.Formatter: HasDataField output:", true);
        return true;
      }
    }

    console.log("B.Text.Formatter: HasDataField output:", false);
    return false;
  }

  ClearDataFieldRun(fieldID: string) {
    console.log("B.Text.Formatter: ClearDataFieldRun input:", fieldID);

    if (this.HasDataFields()) {
      if (fieldID) {
        for (let i = 0; i < this.rtData.dataFields.length; i++) {
          if (Formatter.FormatDataFieldID(this.rtData.dataFields[i].fieldID, false) === fieldID) {
            const startIndex = this.rtData.dataFields[i].startIndex;
            const numChars = this.rtData.dataFields[i].nChars;
            this.SetFormat({ dataField: null }, startIndex, numChars);
          }
        }
      } else {
        this.SetFormat({ dataField: null });
      }
    }

    console.log("B.Text.Formatter: ClearDataFieldRun output");
  }

  RebuildFromData() {
    console.log("B.Text.Formatter: RebuildFromData input");

    if (this.HasDataFields()) {
      const dataFieldsCopy = Utils1.CopyObj(this.rtData.dataFields);

      for (let i = dataFieldsCopy.length - 1; i >= 0; i--) {
        const fieldID = dataFieldsCopy[i].fieldID;
        const dataText = this.parent.GetDataText(fieldID, this.dataNameEnabled);
        const startIndex = dataFieldsCopy[i].startIndex;
        const numChars = dataFieldsCopy[i].nChars;
        const format = dataText && dataText.length ? { dataField: fieldID } : null;

        this.SetText(dataText, format, startIndex, numChars, true);
      }
    }

    console.log("B.Text.Formatter: RebuildFromData output");
  }

  static FormatDataFieldID(fieldID, generateUnique) {
    console.log("B.Text.Formatter: FormatDataFieldID input:", { fieldID, generateUnique });

    let formattedID = fieldID;
    const hasUnderscore = formattedID.indexOf('_') > 0;

    if (generateUnique) {
      if (!hasUnderscore) {
        formattedID += '_' + Utils4.MakeShortUniqueID();
      }
    } else {
      if (hasUnderscore) {
        formattedID = formattedID.split('_')[0];
      }
    }

    console.log("B.Text.Formatter: FormatDataFieldID output:", formattedID);
    return formattedID;
  }

  RemapDataFields(mapping) {
    console.log("B.Text.Formatter: RemapDataFields input:", mapping);

    if (this.HasDataFields()) {
      const remapFieldID = (fieldID) => {
        const [baseID, uniqueID] = fieldID.split('_');
        for (let i = 0; i < mapping.length; i++) {
          if (mapping[i].srcFieldID === baseID) {
            return `${mapping[i].dstFieldID}_${uniqueID}`;
          }
        }
        return fieldID;
      };

      if (this.rtData) {
        for (let i = 0; i < this.rtData.styles.length; i++) {
          if (this.rtData.styles[i].dataField) {
            this.rtData.styles[i].dataField = remapFieldID(this.rtData.styles[i].dataField);
          }
        }
        for (let i = 0; i < this.rtData.dataFields.length; i++) {
          if (this.rtData.dataFields[i].fieldID) {
            this.rtData.dataFields[i].fieldID = remapFieldID(this.rtData.dataFields[i].fieldID);
          }
        }
      }

      if (this.fmtText) {
        for (let i = 0; i < this.fmtText.styles.length; i++) {
          if (this.fmtText.styles[i].dataField) {
            this.fmtText.styles[i].dataField = remapFieldID(this.fmtText.styles[i].dataField);
          }
        }
        this.fmtText.paragraphs.forEach((paragraph) => {
          paragraph.lines.forEach((line) => {
            for (let i = 0; i < line.dataFields.length; i++) {
              if (line.dataFields[i].fieldID) {
                line.dataFields[i].fieldID = remapFieldID(line.dataFields[i].fieldID);
              }
            }
          });
        });
      }

      if (this.renderedDataFields) {
        for (let i = 0; i < this.renderedDataFields.length; i++) {
          if (this.renderedDataFields[i].fieldID) {
            this.renderedDataFields[i].fieldID = remapFieldID(this.renderedDataFields[i].fieldID);
          }
        }
      }
    }

    console.log("B.Text.Formatter: RemapDataFields output");
  }

}

export default Formatter
